import { leadRepository } from "@/lib/leads/firebase-repository";
import {
  leadInputSchema,
  normalizeLeadInput,
} from "@/lib/leads/schema";

export const runtime = "nodejs";

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
