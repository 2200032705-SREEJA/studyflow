import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnedAssignment } from "@/lib/getOwnedAssignment";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { assignment, status } = await getOwnedAssignment(params.id);
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status });

  const [explain, plan, review, viva] = await Promise.all([
    prisma.explainResult.findFirst({ where: { assignmentId: assignment.id }, orderBy: { createdAt: "desc" } }),
    prisma.planResult.findFirst({ where: { assignmentId: assignment.id }, orderBy: { createdAt: "desc" } }),
    prisma.reviewResult.findFirst({ where: { assignmentId: assignment.id }, orderBy: { createdAt: "desc" } }),
    prisma.vivaResult.findFirst({ where: { assignmentId: assignment.id }, orderBy: { createdAt: "desc" } })
  ]);

  return NextResponse.json({ assignment, explain, plan, review, viva });
}
