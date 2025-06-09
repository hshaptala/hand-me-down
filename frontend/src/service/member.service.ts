import api from "@/config/axios.config";
import type { Member } from "@/models/member";
import { requestCache } from "@/utils/request-cache";

export async function fetchMembers(communityId: number): Promise<Member[]> {
  return requestCache.getOrCreate(
    `fetch-members-${communityId}`,
    async () => {
      const res = await api.get(`/api/communities/${communityId}/members`);
      return res.data;
    },
    60000,
  );
}

export async function fetchMember(
  communityId: number,
  memberId: number,
): Promise<Member> {
  return requestCache.getOrCreate(
    `fetch-member-${communityId}-${memberId}`,
    async () => {
      const res = await api.get(
        `/api/communities/${communityId}/members/${memberId}`,
      );
      return res.data;
    },
    60000,
  );
}
