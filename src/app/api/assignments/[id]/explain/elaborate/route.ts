import { NextResponse } from "next/server";
import { z } from "zod";
import { getOwnedAssignment } from "@/lib/getOwnedAssignment";
import { generateElaboration } from "@/lib/llm";
import { checkRateLimit } from "@/lib/rateLimit";

const schema = z.object({
  concept: z.string().min(1),
  currentExplanation: z.string().min(1)
});

// Generated on demand (not persisted) so a student only pays for the depth they
// actually ask for, instead of every concept being fully expanded up front.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { assignment, status } = await getOwnedAssignment(params.id);
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status });

  // This route is a repeatable button click (student can hit "explain more"
  // over and over), which makes it the easiest route to abuse in a tight
  // loop — so it shares the same per-user cap as the main generation routes.
  const limit = checkRateLimit(assignment.userId);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Daily generation limit reached (${limit.limit}/day). Try again later.` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const content = await generateElaboration({
      title: assignment.title,
      subject: assignment.subject,
      question: assignment.question,
      concept: parsed.data.concept,
      currentExplanation: parsed.data.currentExplanation
    });
    return NextResponse.json(content, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to elaborate." },
      { status: 502 }
    );
  }
}