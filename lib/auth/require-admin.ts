import "server-only";

import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "leaddesk_session";

export class AuthorizationError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function assertAdministrator(uid: string): Promise<void> {
  const snapshot = await getAdminDb().collection("admins").doc(uid).get();
  if (!snapshot.exists || snapshot.data()?.role !== "admin") {
    throw new AuthorizationError(403, "Administrator access required.");
  }
}

export async function verifyAdminSession(sessionCookie?: string) {
  if (!sessionCookie) {
    throw new AuthorizationError(401, "Sign in required.");
  }

  let decoded;
  try {
    decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    throw new AuthorizationError(401, "Your session has expired.");
  }

  await assertAdministrator(decoded.uid);
  return {
    uid: decoded.uid,
    email: decoded.email ?? "",
  };
}
