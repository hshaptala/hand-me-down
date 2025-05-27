export type Member = {
  id: number;
  user: {
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  role: string;
};
