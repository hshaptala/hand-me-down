import axios from "@/config/axios.config";
import type { Item } from "@/models/item";

const API_BASE = import.meta.env.VITE_API_URL;

export async function fetchItems(communityId: number): Promise<Item[]> {
  const res = await axios.get(`${API_BASE}/communities/${communityId}/items`);
  return res.data;
}

export async function fetchItem(
  communityId: number,
  itemId: number,
): Promise<Item> {
  const res = await axios.get(
    `${API_BASE}/communities/${communityId}/items/${itemId}`,
  );
  return res.data;
}

export async function createItem(
  communityId: number,
  item: Item,
): Promise<Item> {
  const res = await axios.post(
    `${API_BASE}/communities/${communityId}/items`,
    item,
  );
  return res.data;
}
