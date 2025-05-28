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
  item: Item,
): Promise<Item> {
  const res = await api.post(`/api/communities/${communityId}/items`, item);
  return res.data;
}
