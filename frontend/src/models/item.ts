export type Item = {
  id: number;
  title: string;
  description?: string;
  donor: number;
  receiver?: number;
  imageUrl: string;
  keywords: string[];
  status: string;
  postedAt?: string;
};
