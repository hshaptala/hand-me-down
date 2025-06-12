import api from "@/config/axios.config";
import type { Rating } from "@/models/rating";

export async function leaveRating({
  userId,
  rating,
  message,
}: {
  userId: number;
  rating: number;
  message?: string;
}): Promise<Rating> {
  const params = new URLSearchParams({
    userId: userId.toString(),
    rating: rating.toString(),
  });

  if (message) {
    params.append("message", message);
  }

  const response = await api.post(`/api/ratings?${params.toString()}`);
  return response.data;
}
