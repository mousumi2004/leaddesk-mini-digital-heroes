import { NextRequest } from "next/server";

import {
  AuthorizationError,
  SESSION_COOKIE_NAME,
  verifyAdminSession,
} from "@/lib/auth/require-admin";
import { leadRepository } from "@/lib/leads/firebase-repository";
import {
  leadInputSchema,
  normalizeLeadInput,
} from "@/lib/leads/schema";

export const runtime = "nodejs";

function authorizationResponse(error: unknown) {
  if (
    error instanceof AuthorizationError ||
    (error instanceof Error &&
      (error as Error & { status?: number }).status &&
      [401, 403].includes((error as Error & { status: number }).status))
  ) {
    const status = (error as Error & { status: 401 | 403 }).status;
    return Response.json({ error: error.message }, { status });
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    await verifyAdminSession(
      request.cookies.get(SESSION_COOKIE_NAME)?.value,
    );
    return Response.json({ leads: await leadRepository.list() });
  } catch (error) {
    const authResponse = authorizationResponse(error);
    if (authResponse) {
      return authResponse;
    }
    console.error("Lead listing failed", error);
    return Response.json(
      { error: "Unable to load leads right now." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = leadInputSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        error: "Please check the highlighted fields.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    await leadRepository.create(normalizeLeadInput(parsed.data));
    return Response.json(
      { message: "Thanks - your project request has been received." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Lead creation failed", error);
    return Response.json(
      { error: "Unable to save your request right now." },
      { status: 500 },
    );
  }
}
