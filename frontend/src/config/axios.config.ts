import type { Session } from "@supabase/supabase-js";
import axios from "axios";

import { getSupabase } from "../lib/supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

let cachedSession: Session | null = null;
let sessionPromise: Promise<Session | null> | null = null;

async function getCachedSession(): Promise<Session | null> {
  if (cachedSession && cachedSession.expires_at && new Date(cachedSession.expires_at * 1000) > new Date()) {
    return cachedSession;
  }

  if (sessionPromise) {
    return sessionPromise;
  }

  sessionPromise = getSupabase().auth.getSession().then(({ data: { session } }) => {
    cachedSession = session;
    sessionPromise = null;
    return session;
  });

  return sessionPromise;
}

export async function getBearerAuthHeaders(
  contentType: string = "application/json",
): Promise<Record<string, string>> {
  const session = await getCachedSession();
  const token = session?.access_token;
  const headers: Record<string, string> = { "Content-Type": contentType };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export function clearSessionCache(): void {
  cachedSession = null;
  sessionPromise = null;
}

api.interceptors.request.use(
  async (config) => {
    if (!config.headers.Authorization) {
      const session = await getCachedSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    if (error.response?.status === 401) {
      cachedSession = null;
      sessionPromise = null;
      const supabase = getSupabase();
      await supabase.auth.signOut();
    }
    
    if (!config || config.__isRetryRequest) {
      return Promise.reject(error);
    }
    
    if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR' || !error.response) {
      config.__isRetryRequest = true;
      config.retryCount = config.retryCount || 0;
      
      if (config.retryCount < 2) {
        config.retryCount += 1;
        const delay = Math.pow(2, config.retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(config);
      }
    }
    
    return Promise.reject(error);
  },
);

export default api;
