import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { verifyIdToken, createSessionCookie, adminGet } = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
  createSessionCookie: vi.fn(),
  adminGet: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => ({
    verifyIdToken,
    createSessionCookie,
  }),
  getAdminDb: () => ({
    collection: () => ({
      doc: () => ({
        get: adminGet,
      }),
    }),
  }),
}));

import { DELETE, GET, POST } from "@/app/api/auth/session/route";

function request(
  method: "GET" | "POST" | "DELETE",
  body?: unknown,
  cookie?: string,
) {
  return new NextRequest("http://localhost:3000/api/auth/session", {
    method,
    headers: {
      origin: "http://localhost:3000",
      ...(cookie ? { cookie } : {}),
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("/api/auth/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyIdToken.mockResolvedValue({
      uid: "admin-1",
      email: "admin@example.com",
      auth_time: Math.floor(Date.now() / 1000),
    });
    adminGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: "admin" }),
    });
    createSessionCookie.mockResolvedValue("signed-session");
  });

  it("issues a CSRF token and matching cookie", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.csrfToken).toMatch(/^[a-f0-9]{64}$/);
    expect(response.headers.get("set-cookie")).toContain("leaddesk_csrf=");
  });

  it("rejects a login request without required values", async () => {
    const response = await POST(request("POST", {}));

    expect(response.status).toBe(400);
    expect(createSessionCookie).not.toHaveBeenCalled();
  });

  it("rejects a mismatched CSRF token", async () => {
    const submitted = "a".repeat(64);
    const expected = "b".repeat(64);
    const response = await POST(
      request(
        "POST",
        { idToken: "firebase-token", csrfToken: submitted },
        `leaddesk_csrf=${expected}`,
      ),
    );

    expect(response.status).toBe(403);
  });

  it("rejects an authenticated user without administrator authorization", async () => {
    adminGet.mockResolvedValue({ exists: false, data: () => undefined });
    const token = "a".repeat(64);

    const response = await POST(
      request(
        "POST",
        { idToken: "firebase-token", csrfToken: token },
        `leaddesk_csrf=${token}`,
      ),
    );

    expect(response.status).toBe(403);
  });

  it("creates an HTTP-only session for an authorized administrator", async () => {
    const token = "b".repeat(64);
    const response = await POST(
      request(
        "POST",
        { idToken: "firebase-token", csrfToken: token },
        `leaddesk_csrf=${token}`,
      ),
    );

    expect(response.status).toBe(204);
    expect(createSessionCookie).toHaveBeenCalledWith("firebase-token", {
      expiresIn: 432000000,
    });
    const cookie = response.headers.get("set-cookie");
    expect(cookie).toContain("leaddesk_session=signed-session");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=lax");
  });

  it("clears the session on logout", async () => {
    const response = await DELETE(request("DELETE"));
    const cookie = response.headers.get("set-cookie");

    expect(response.status).toBe(204);
    expect(cookie).toContain("leaddesk_session=");
    expect(cookie).toContain("Max-Age=0");
  });
});
