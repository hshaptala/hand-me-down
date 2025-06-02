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
