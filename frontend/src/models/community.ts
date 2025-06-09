export type Community = {
  id?: number;
  name: string;
  location: string;
  description?: string;
  password?: string;
  created_at?: string;
  creator_id?: number;
  visibility: "Public" | "Private";
  imageUrl: string;
  memberCount?: number;
  itemCount?: number;
};
