import api, { getBearerAuthHeaders } from "@/config/axios.config";
import type { Community } from "@/models/community";

export async function fetchCommunities(): Promise<Community[]> {
  const res = await api.get("/api/communities");
  return res.data;
}

export async function fetchCommunity(id: number): Promise<Community> {
  const res = await api.get(`/api/communities/${id}`);
  return res.data;
}

export async function joinCommunity(
  id: number,
  password?: string,
): Promise<Community> {
  const headers = await getBearerAuthHeaders("application/json");
  const res = await api.post(
    `/api/communities/${id}/join`,
    { password },
    { headers },
  );
  return res.data;
}

export async function leaveCommunity(id: number): Promise<void> {
  const headers = await getBearerAuthHeaders("application/json");
  await api.post(`/api/communities/${id}/leave`, {}, { headers });
}

export async function userCommunities(): Promise<Community[]> {
  const headers = await getBearerAuthHeaders("application/json");
  const res = await api.get("/api/users/communities", { headers });
  return res.data;
}

export async function createCommunity(data: {
  name: string;
  location: string;
  description?: string;
  password?: string;
  visibility: "Public" | "Private";
  image?: File | null;
}): Promise<Community> {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("location", data.location);
  if (data.description) formData.append("description", data.description);
  if (data.password) formData.append("password", data.password);
  formData.append("visibility", data.visibility);
  if (data.image) formData.append("image", data.image);

  const headers = await getBearerAuthHeaders("multipart/form-data");

  const res = await api.post("/api/communities", formData, {
    headers,
  });
  return res.data;
}
