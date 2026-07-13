import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnedAssignment } from "@/lib/getOwnedAssignment";
import { generateExplain, type ExplainDepth } from "@/lib/llm";
import { checkRateLimit } from "@/lib/rateLimit";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// The three explanation depths a student can pick before generating.
const bodySchema = z.object({
  depth: z.enum(["quick", "standard", "deep-dive"]).default("standard"),
});

export async function POST(
  req: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  const { assignment, status } = await getOwnedAssignment(id);

  if (!assignment) {
    return NextResponse.json({ error: "Not found" }, { status });
  }

  const limit = checkRateLimit(assignment.userId);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Daily generation limit reached (${limit.limit}/day). Try again later.`,
      },
      { status: 429 }
    );
  }

  // Body is optional — requests with no body (or an old client) fall back to "standard".
  let depth: ExplainDepth = "standard";
  try {
    const rawBody = await req.json();
    const parsed = bodySchema.safeParse(rawBody);
    if (parsed.success) {
      depth = parsed.data.depth;
    }
  } catch {
    // No JSON body sent — keep the default depth.
  }

  try {
    const content = await generateExplain({
      title: assignment.title,
      subject: assignment.subject,
      question: assignment.question,
      depth,
    });

    const result = await prisma.explainResult.create({
      data: {
        assignmentId: assignment.id,
        content: content as any,
        depth,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to generate explanation.",
      },
      { status: 502 }
    );
  }
}