export type Member = {
  id: number;
  user_id: number;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  role: string;
  isBanned?: boolean;
  banCount?: number;
  lastBannedAt?: string;
  lastBannedBy?: number;
  lastUnbannedAt?: string;
  lastUnbannedBy?: number;
};
