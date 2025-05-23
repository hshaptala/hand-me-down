import api from "@/config/axios.config";
import type { Community } from "@/models/community";

export async function fetchCommunities(): Promise<Community[]> {
  const res = await api.get("/communities");
  return res.data;
}

export async function fetchCommunity(id: number): Promise<Community> {
  const res = await api.get(`/communities/${id}`);
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
  const res = await api.post("/communities", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
