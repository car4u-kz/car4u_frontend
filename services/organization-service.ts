import { Organization } from "@/types/organization";

type FetchOrgsSuccess = { orgs: Organization[] };
type FetchOrgsError = { error: string };

const inFlightOrgs: Record<
  string,
  Promise<FetchOrgsSuccess | FetchOrgsError> | null
> = {};

export async function getMyOrganizations(
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  userId: string
): Promise<FetchOrgsSuccess | FetchOrgsError> {
  if (!userId) {
    return { error: "Missing userId" };
  }

  if (inFlightOrgs[userId])
    return inFlightOrgs[userId] as Promise<FetchOrgsSuccess | FetchOrgsError>;

  inFlightOrgs[userId] = (async () => {
    try {
      const res = await fetchWithAuth("/api/organization/my", {
        method: "GET",
      });

      if (!res.ok) {
        let bodyText: string | null = null;
        try {
          bodyText = await res.text();
        } catch {}
        return {
          error: `Failed to load organizations: ${res.status}${
            bodyText ? ` — ${bodyText}` : ""
          }`,
        };
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        return { error: "Invalid response shape for organizations" };
      }

      return { orgs: data as Organization[] };
    } catch (e: any) {
      console.error("getMyOrganizations error", e);
      return { error: e?.message || "Network error" };
    } finally {
      setTimeout(() => {
        inFlightOrgs[userId] = null;
      }, 0);
    }
  })();

  return inFlightOrgs[userId] as Promise<FetchOrgsSuccess | FetchOrgsError>;
}

export function invalidateInFlightOrganizations(userId: string) {
  inFlightOrgs[userId] = null;
}
