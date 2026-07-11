import { NextResponse } from "next/server";
import { z } from "zod";
import { getOwnedAssignment } from "@/lib/getOwnedAssignment";
import { generateElaboration } from "@/lib/llm";

const schema = z.object({
  concept: z.string().min(1),
  currentExplanation: z.string().min(1)
});

// Generated on demand (not persisted) so a student only pays for the depth they
// actually ask for, instead of every concept being fully expanded up front.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { assignment, status } = await getOwnedAssignment(params.id);
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status });

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