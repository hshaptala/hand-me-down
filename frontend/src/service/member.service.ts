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

export async function updateMemberRole(
  communityId: number,
  userId: number,
  role: string,
): Promise<Member> {
  const res = await api.patch(
    `/api/communities/${communityId}/members/${userId}?role=${role}`,
  );

  requestCache.clearRequest(`fetch-members-${communityId}`);
  requestCache.clearRequest(`fetch-member-${communityId}-${userId}`);

  return res.data;
}

export async function banMember(
  communityId: number,
  userId: number,
): Promise<Member> {
  const res = await api.post(
    `/api/communities/${communityId}/members/${userId}/ban`,
  );
  requestCache.clearRequest(`fetch-members-${communityId}`);
  requestCache.clearRequest(`fetch-banned-members-${communityId}`);

  return res.data;
}

export async function unbanMember(
  communityId: number,
  userId: number,
): Promise<Member> {
  const res = await api.post(
    `/api/communities/${communityId}/members/${userId}/unban`,
  );

  requestCache.clearRequest(`fetch-members-${communityId}`);
  requestCache.clearRequest(`fetch-banned-members-${communityId}`);

  return res.data;
}

export async function fetchBannedMembers(
  communityId: number,
): Promise<Member[]> {
  return requestCache.getOrCreate(
    `fetch-banned-members-${communityId}`,
    async () => {
      const res = await api.get(
        `/api/communities/${communityId}/banned-members`,
      );
      return res.data;
    },
    60000,
  );
}

export async function fetchRoles(): Promise<string[]> {
  return requestCache.getOrCreate(
    "fetch-roles",
    async () => {
      const res = await api.get("/api/members/roles");
      return res.data.map((role: { value: string }) => role.value);
    },
    300000,
  );
}

export async function transferOwnership(
  communityId: number,
  userId: number,
): Promise<void> {
  await api.post(
    `/api/communities/${communityId}/members/${userId}/give-ownership`,
  );

  requestCache.clearRequest(`fetch-community-${communityId}`);
  requestCache.clearRequest(`fetch-members-${communityId}`);
}
