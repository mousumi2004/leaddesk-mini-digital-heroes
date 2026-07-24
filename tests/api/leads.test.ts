import { beforeEach, describe, expect, it, vi } from "vitest";

const { create } = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock("@/lib/leads/firebase-repository", () => ({
  leadRepository: {
    create,
  },
}));

import { POST } from "@/app/api/leads/route";

const validLead = {
  name: "Mousumi Swain",
  email: "mousumi@example.com",
  budget: "1000-5000",
  message: "I need a responsive Shopify storefront for my clothing brand.",
  company: "",
};

function post(body: unknown) {
  return new Request("http://localhost/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/leads", () => {
  beforeEach(() => {
    create.mockReset();
    create.mockResolvedValue({ id: "lead-1" });
  });

  it("creates a normalized lead and returns 201", async () => {
    const response = await POST(
      post({ ...validLead, email: "  MOUSUMI@EXAMPLE.COM " }),
    );

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({
      name: "Mousumi Swain",
      email: "mousumi@example.com",
      budget: "1000-5000",
      message: validLead.message,
    });
    await expect(response.json()).resolves.toEqual({
      message: "Thanks - your project request has been received.",
    });
  });

  it("rejects invalid fields without calling the database", async () => {
    const response = await POST(post({ ...validLead, email: "invalid" }));

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      error: "Please check the highlighted fields.",
    });
  });

  it("rejects a filled honeypot", async () => {
    const response = await POST(post({ ...validLead, company: "spam" }));

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const request = new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    });

    expect((await POST(request)).status).toBe(400);
  });

  it("does not expose database error details", async () => {
    create.mockRejectedValue(new Error("private Firebase failure"));

    const response = await POST(post(validLead));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: "Unable to save your request right now.",
    });
    expect(JSON.stringify(body)).not.toContain("Firebase");
  });
});
