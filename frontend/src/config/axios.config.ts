import axios from "axios";

import { getSupabase } from "../lib/supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export async function getBearerAuthHeaders(
  contentType: string = "application/json",
) {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  const headers: Record<string, string> = { "Content-Type": contentType };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  },
);

export default api;
