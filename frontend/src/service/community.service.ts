import api from "@/config/axios.config";
import type { Community } from "@/models/community";
import { requestCache } from "@/utils/request-cache";

export async function fetchCommunities(): Promise<Community[]> {
  return requestCache.getOrCreate(
    "fetch-communities",
    async () => {
      const res = await api.get("/api/communities");
      return res.data;
    },
    30000,
  );
}

export async function fetchCommunity(id: number): Promise<Community> {
  return requestCache.getOrCreate(
    `fetch-community-${id}`,
    async () => {
      const res = await api.get(`/api/communities/${id}`);
      return res.data;
    },
    60000,
  );
}

export async function joinCommunity(
  id: number,
  password?: string,
): Promise<Community> {
  const url = `/api/communities/${id}/join`;
  const params = password ? { password } : {};

  const res = await api.post(url, {}, { params });
  requestCache.clearRequest("user-communities");
  requestCache.clearRequest("fetch-communities");
  requestCache.clearRequest(`fetch-community-${id}`);
  return res.data;
}

export async function leaveCommunity(id: number): Promise<void> {
  await api.post(`/api/communities/${id}/leave`);
  requestCache.clearRequest("user-communities");
  requestCache.clearRequest("fetch-communities");
  requestCache.clearRequest(`fetch-community-${id}`);
}

export async function userCommunities(): Promise<Community[]> {
  return requestCache.getOrCreate(
    "user-communities",
    async () => {
      const res = await api.get("/api/users/communities");
      return res.data;
    },
    15000,
  );
}

export async function createCommunity(data: {
  name: string;
  location: string;
  description?: string;
  password?: string;
  visibility: "Public" | "Private";
  image: File;
}): Promise<Community> {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("location", data.location);
  if (data.description) formData.append("description", data.description);
  if (data.password) formData.append("password", data.password);
  formData.append("visibility", data.visibility);
  if (data.image) formData.append("image", data.image);

  const res = await api.post("/api/communities", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  requestCache.clearRequest("fetch-communities");
  requestCache.clearRequest("user-communities");

  return res.data;
}
