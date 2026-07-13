import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnedAssignment } from "@/lib/getOwnedAssignment";
import { generateReview } from "@/lib/llm";
import { isForwardStatus } from "@/lib/assignmentStatus";
import { checkRateLimit } from "@/lib/rateLimit";

const schema = z.object({
  draftText: z.string().min(1),
  uploadedFileUrl: z.string().optional().nullable(),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (isForwardStatus(assignment.status, "DRAFT_READY")) {
    await prisma.assignment.update({
      where: { id: assignment.id },
      data: { status: "DRAFT_READY" },
    });
  }

  try {
    const content = await generateReview({
      title: assignment.title,
      subject: assignment.subject,
      question: assignment.question,
      draftText: parsed.data.draftText,
    });

    const result = await prisma.reviewResult.create({
      data: {
        assignmentId: assignment.id,
        uploadedFileUrl: parsed.data.uploadedFileUrl ?? null,
        grammarRating: content.grammarRating,
        structureRating: content.structureRating,
        formattingRating: content.formattingRating,
        referencesRating: content.referencesRating,
        feedback: content.feedback,
      },
    });

    if (isForwardStatus(assignment.status, "REVIEWED")) {
      await prisma.assignment.update({
        where: { id: assignment.id },
        data: { status: "REVIEWED" },
      });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to review draft.",
      },
      { status: 502 }
    );
  }
}