export type CommunityMember = {
  id: number;
  name: string;
  avatar?: string;
  role?: string;
};

export type Community = {
  id?: number;
  name: string;
  location: string;
  description?: string;
  visibility: "Public" | "Private";
  imageUrl?: string;
};
