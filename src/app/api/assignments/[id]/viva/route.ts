import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnedAssignment } from "@/lib/getOwnedAssignment";
import { generateViva } from "@/lib/llm";
import { checkRateLimit } from "@/lib/rateLimit";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _req: Request,
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

  try {
    const content = await generateViva({
      title: assignment.title,
      subject: assignment.subject,
      question: assignment.question,
    });

    const result = await prisma.vivaResult.create({
      data: {
        assignmentId: assignment.id,
        content,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to generate viva questions.",
      },
      { status: 502 }
    );
  }
}