import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  assertAdministrator,
  AuthorizationError,
} from "@/lib/auth/require-admin";
import { getAdminAuth } from "@/lib/firebase/admin";
import {
  createCsrfToken,
  CSRF_COOKIE_NAME,
  requestIsSameOrigin,
  tokensMatch,
} from "@/lib/security/csrf";

export const runtime = "nodejs";

const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000;
const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "leaddesk_session";

const loginSchema = z
  .object({
    idToken: z.string().min(1),
    csrfToken: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

const cookieBase = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export async function GET() {
  const csrfToken = createCsrfToken();
  const response = NextResponse.json({ csrfToken });
  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    ...cookieBase,
    httpOnly: false,
    maxAge: 10 * 60,
  });
  return response;
}

export async function POST(request: NextRequest) {
  if (!requestIsSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin rejected." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const csrfCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!csrfCookie || !tokensMatch(csrfCookie, parsed.data.csrfToken)) {
    return NextResponse.json(
      { error: "Security check failed. Refresh and try again." },
      { status: 403 },
    );
  }

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(parsed.data.idToken);
    const now = Math.floor(Date.now() / 1000);
    if (!decoded.auth_time || now - decoded.auth_time > 5 * 60) {
      return NextResponse.json(
        { error: "Please sign in again." },
        { status: 401 },
      );
    }

    await assertAdministrator(decoded.uid);
    const sessionCookie = await auth.createSessionCookie(parsed.data.idToken, {
      expiresIn: SESSION_DURATION_MS,
    });
    const response = new NextResponse(null, { status: 204 });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      ...cookieBase,
      httpOnly: true,
      maxAge: SESSION_DURATION_MS / 1000,
    });
    response.cookies.set(CSRF_COOKIE_NAME, "", {
      ...cookieBase,
      httpOnly: false,
      maxAge: 0,
    });
    return response;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Admin session creation failed", error);
    return NextResponse.json(
      { error: "Unable to sign in with those credentials." },
      { status: 401 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!requestIsSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin rejected." }, { status: 403 });
  }

  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...cookieBase,
    httpOnly: true,
    maxAge: 0,
  });
  return response;
}
