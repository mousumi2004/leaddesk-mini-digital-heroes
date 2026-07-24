import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { verifyAdminSession, list, updateStatus } = vi.hoisted(() => ({
  verifyAdminSession: vi.fn(),
  list: vi.fn(),
  updateStatus: vi.fn(),
}));

vi.mock("@/lib/auth/require-admin", () => ({
  AuthorizationError: class AuthorizationError extends Error {
    constructor(
      public status: 401 | 403,
      message: string,
    ) {
      super(message);
    }
  },
  verifyAdminSession,
  SESSION_COOKIE_NAME: "leaddesk_session",
}));

vi.mock("@/lib/leads/firebase-repository", () => ({
  leadRepository: {
    list,
    updateStatus,
  },
}));

import { GET } from "@/app/api/leads/route";
import { PATCH } from "@/app/api/leads/[id]/route";

function request(method: "GET" | "PATCH", body?: unknown, withCookie = true) {
  return new NextRequest(`http://localhost:3000/api/leads`, {
    method,
    headers: {
      ...(withCookie ? { cookie: "leaddesk_session=signed-session" } : {}),
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("protected lead APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdminSession.mockResolvedValue({
      uid: "admin-1",
      email: "admin@example.com",
    });
    list.mockResolvedValue([]);
    updateStatus.mockResolvedValue(undefined);
  });

  it("rejects an unauthenticated lead list", async () => {
    verifyAdminSession.mockRejectedValue(
      Object.assign(new Error("Sign in required."), { status: 401 }),
    );

    expect((await GET(request("GET", undefined, false))).status).toBe(401);
  });

  it("returns leads to an authorized administrator", async () => {
    list.mockResolvedValue([{ id: "lead-1", status: "new" }]);

    const response = await GET(request("GET"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      leads: [{ id: "lead-1", status: "new" }],
    });
  });

  it("rejects an unsupported status", async () => {
    const response = await PATCH(
      request("PATCH", { status: "archived" }),
      { params: Promise.resolve({ id: "lead-1" }) },
    );

    expect(response.status).toBe(400);
    expect(updateStatus).not.toHaveBeenCalled();
  });

  it("rejects an invalid lead identifier", async () => {
    const response = await PATCH(
      request("PATCH", { status: "closed" }),
      { params: Promise.resolve({ id: "../private" }) },
    );

    expect(response.status).toBe(400);
  });

  it("updates status for an authorized administrator", async () => {
    const response = await PATCH(
      request("PATCH", { status: "closed" }),
      { params: Promise.resolve({ id: "lead-1" }) },
    );

    expect(response.status).toBe(200);
    expect(updateStatus).toHaveBeenCalledWith("lead-1", "closed");
    await expect(response.json()).resolves.toEqual({
      message: "Lead status updated.",
    });
  });
});
