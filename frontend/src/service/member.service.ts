import api, { getBearerAuthHeaders } from "@/config/axios.config";
import type { Member } from "@/models/member";

export async function fetchMembers(communityId: number): Promise<Member[]> {
  const headers = await getBearerAuthHeaders("application/json");
  const res = await api.get(`/api/communities/${communityId}/members`, { headers });
  return res.data;
}

export async function fetchMember(
  communityId: number,
  memberId: number,
): Promise<Member> {
  const res = await api.get(
    `/api/communities/${communityId}/members/${memberId}`,
  );
  return res.data;
}
