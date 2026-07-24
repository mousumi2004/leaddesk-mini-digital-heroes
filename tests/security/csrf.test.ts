import { describe, expect, it } from "vitest";

import { requestIsSameOrigin } from "@/lib/security/csrf";

describe("requestIsSameOrigin", () => {
  it("accepts the browser origin when the runtime normalized the request URL", () => {
    const request = new Request("http://localhost:3100/api/auth/session", {
      headers: {
        host: "127.0.0.1:3100",
        origin: "http://127.0.0.1:3100",
      },
    });

    expect(requestIsSameOrigin(request)).toBe(true);
  });

  it("uses trusted proxy host and protocol headers", () => {
    const request = new Request("http://localhost/api/auth/session", {
      headers: {
        host: "localhost",
        origin: "https://leaddesk.example",
        "x-forwarded-host": "leaddesk.example",
        "x-forwarded-proto": "https",
      },
    });

    expect(requestIsSameOrigin(request)).toBe(true);
  });

  it("rejects a cross-origin request", () => {
    const request = new Request("https://leaddesk.example/api/auth/session", {
      headers: {
        host: "leaddesk.example",
        origin: "https://attacker.example",
      },
    });

    expect(requestIsSameOrigin(request)).toBe(false);
  });
});
