import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnedAssignment } from "@/lib/getOwnedAssignment";
import { generateReview } from "@/lib/llm";
import { isForwardStatus } from "@/lib/assignmentStatus";

// Accepts the draft as plain text plus an optional already-uploaded file URL
// (upload the file first via POST /api/upload, then send its URL + extracted
// text here). For PDF drafts, extract text with a library such as `pdf-parse`
// before calling this route — kept out of this route to keep the API surface
// provider-agnostic.
const schema = z.object({
  draftText: z.string().min(1),
  uploadedFileUrl: z.string().optional().nullable()
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { assignment, status } = await getOwnedAssignment(params.id);
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Mark the draft as submitted before calling the AI, so if the AI call fails,
  // the student's submission is still reflected instead of silently vanishing.
  if (isForwardStatus(assignment.status, "DRAFT_READY")) {
    await prisma.assignment.update({ where: { id: assignment.id }, data: { status: "DRAFT_READY" } });
  }

  try {
    const content = await generateReview({
      title: assignment.title,
      subject: assignment.subject,
      question: assignment.question,
      draftText: parsed.data.draftText
    });

    const result = await prisma.reviewResult.create({
      data: {
        assignmentId: assignment.id,
        uploadedFileUrl: parsed.data.uploadedFileUrl ?? null,
        grammarRating: content.grammarRating,
        structureRating: content.structureRating,
        formattingRating: content.formattingRating,
        referencesRating: content.referencesRating,
        feedback: content.feedback
      }
    });

    if (isForwardStatus(assignment.status, "REVIEWED")) {
      await prisma.assignment.update({ where: { id: assignment.id }, data: { status: "REVIEWED" } });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to review draft." },
      { status: 502 }
    );
  }
}