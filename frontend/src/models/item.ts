// Item entity type

export interface Item {
  id: number;
  community_id: number;
  title: string;
  description: string;
  image_url?: string;
  category: string;
  status: string;
  created_at: string;
}
