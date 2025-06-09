import api from "@/config/axios.config";
import type { User } from "@/models/user";
import { requestCache } from "@/utils/request-cache";

export async function fetchUser(userId: number): Promise<User> {
  return requestCache.getOrCreate(
    `fetch-user-${userId}`,
    async () => {
      const res = await api.get(`/api/users/${userId}`);
      return res.data;
    },
    60000,
  );
}

export async function fetchUserBySupabaseId(
  supabaseUserId: string,
): Promise<User> {
  return requestCache.getOrCreate(
    `fetch-user-supabase-${supabaseUserId}`,
    async () => {
      const res = await api.get(`/api/users/supabase/${supabaseUserId}`);
      return res.data;
    },
    60000,
  );
}
