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
  if (origin === null) {
    return true;
  }

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost || request.headers.get("host") || requestUrl.host;
  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol = forwardedProtocol || requestUrl.protocol.replace(":", "");

  return originUrl.host === host && originUrl.protocol === `${protocol}:`;
}
