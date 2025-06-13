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

export async function getRatingBetweenUsers({
  fromId,
  toId,
}: {
  fromId: number;
  toId: number;
}): Promise<Rating | null> {
  try {
    const params = new URLSearchParams({
      fromId: fromId.toString(),
      toId: toId.toString(),
    });

    const response = await api.get(`/api/ratings?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
    }
    throw error;
  }
}

export async function getUserRatings(userId: number): Promise<{
  given: Rating[];
  received: Rating[];
}> {
  const response = await api.get(`/api/users/${userId}/ratings`);
  return response.data;
}
