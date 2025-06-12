import api from "@/config/axios.config";
import type { Item } from "@/models/item";

export async function fetchItems(communityId: number): Promise<Item[]> {
  const res = await api.get(`/api/communities/${communityId}/items`);
  return res.data;
}

export async function fetchItem(itemId: number): Promise<Item> {
  const res = await api.get(`/api/items/${itemId}`);
  return res.data;
}
export async function fetchItemById(itemId: number): Promise<Item> {
  const res = await api.get(`/api/items/${itemId}`);
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

export async function fetchUserDonations(): Promise<Item[]> {
  const res = await api.get(`/api/users/items/donations`);
  return res.data;
}

export async function fetchUserReceipts(): Promise<Item[]> {
  const res = await api.get(`/api/users/items/receipts`);
  return res.data;
}

export async function fetchUserReservations(): Promise<Item[]> {
  const res = await api.get(`/api/users/items/reservations`);
  return res.data;
}

export async function reserveItem(
  itemId: number,
): Promise<{ message: string }> {
  const res = await api.post(`/api/items/${itemId}/reserve`);
  return res.data;
}

export async function cancelReserveItem(
  itemId: number,
): Promise<{ message: string }> {
  const res = await api.post(`/api/items/${itemId}/cancel`);
  return res.data;
}

export async function confirmReceiveItem(
  itemId: number,
): Promise<{ message: string }> {
  const res = await api.post(`/api/items/${itemId}/confirm`);
  return res.data;
}
