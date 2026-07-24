import "server-only";

import { randomBytes, timingSafeEqual } from "node:crypto";

export const CSRF_COOKIE_NAME = "leaddesk_csrf";

export function createCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export function tokensMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function requestIsSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return origin === null || origin === new URL(request.url).origin;
}
