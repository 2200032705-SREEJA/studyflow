import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnedAssignment } from "@/lib/getOwnedAssignment";
import { generateExplain } from "@/lib/llm";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { assignment, status } = await getOwnedAssignment(params.id);
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status });

  try {
    const content = await generateExplain({
      title: assignment.title,
      subject: assignment.subject,
      question: assignment.question
    });

    const result = await prisma.explainResult.create({
      data: { assignmentId: assignment.id, content }
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate explanation." },
      { status: 502 }
    );
  }
}
