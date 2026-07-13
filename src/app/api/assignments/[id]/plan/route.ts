import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnedAssignment } from "@/lib/getOwnedAssignment";
import { generatePlan } from "@/lib/llm";
import { isForwardStatus } from "@/lib/assignmentStatus";
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
    const content = await generatePlan({
      title: assignment.title,
      subject: assignment.subject,
      question: assignment.question,
      dueDate: assignment.dueDate
        ? assignment.dueDate.toISOString()
        : null,
    });

    const result = await prisma.planResult.create({
      data: {
        assignmentId: assignment.id,
        content,
      },
    });

    if (isForwardStatus(assignment.status, "PLANNING")) {
      await prisma.assignment.update({
        where: { id: assignment.id },
        data: { status: "PLANNING" },
      });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to generate plan.",
      },
      { status: 502 }
    );
  }
}