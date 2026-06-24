export const ACTIVE_ORG_PREFIX = "active_organization_id_";
const BACKEND_JWT_KEY = "backend_jwt";

function isBrowser() {
  return typeof window !== "undefined";
}

export const AuthStorage = {
  getJWT(): string | null {
    if (!isBrowser()) return null;
    try {
      return localStorage.getItem(BACKEND_JWT_KEY);
    } catch {
      return null;
    }
  },
  setJWT(jwt: string) {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(BACKEND_JWT_KEY, jwt);
    } catch {}
  },
  clearJWT() {
    if (!isBrowser()) return;
    try {
      localStorage.removeItem(BACKEND_JWT_KEY);
    } catch {}
  },
};

export { BACKEND_JWT_KEY };
