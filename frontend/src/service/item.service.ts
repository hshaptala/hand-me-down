import api from "@/config/axios.config";
import type { Item } from "@/models/item";

export async function fetchItems(communityId: number): Promise<Item[]> {
  const res = await api.get(`/api/communities/${communityId}/items`);
  return res.data;
}

export async function fetchItem(
  communityId: number,
  itemId: number,
): Promise<Item> {
  const res = await api.get(`/api/communities/${communityId}/items/${itemId}`);
  return res.data;
}

export async function createItem(
  communityId: number,
  data: {
    title: string;
    description: string;
    keywords: string[];
    image: File;
  },
): Promise<Item> {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("keywords", data.keywords.join(","));
  formData.append("image", data.image);

  const res = await api.post(
    `/api/communities/${communityId}/items`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return res.data;
}
