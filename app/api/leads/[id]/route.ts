import { NextRequest } from "next/server";

import {
  AuthorizationError,
  SESSION_COOKIE_NAME,
  verifyAdminSession,
} from "@/lib/auth/require-admin";
import { leadRepository } from "@/lib/leads/firebase-repository";
import { statusUpdateSchema } from "@/lib/leads/schema";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isValidId(id: string): boolean {
  return /^[A-Za-z0-9_-]{1,128}$/.test(id);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidId(id)) {
    return Response.json({ error: "Invalid lead identifier." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Choose New, Contacted, or Closed." },
      { status: 400 },
    );
  }

  try {
    await verifyAdminSession(
      request.cookies.get(SESSION_COOKIE_NAME)?.value,
    );
    await leadRepository.updateStatus(id, parsed.data.status);
    return Response.json({ message: "Lead status updated." });
  } catch (error) {
    if (
      error instanceof AuthorizationError ||
      (error instanceof Error &&
        [401, 403].includes(
          (error as Error & { status?: number }).status ?? 0,
        ))
    ) {
      const status = (error as Error & { status: 401 | 403 }).status;
      return Response.json({ error: error.message }, { status });
    }
    console.error("Lead status update failed", error);
    return Response.json(
      { error: "Unable to update this lead right now." },
      { status: 500 },
    );
  }
}
