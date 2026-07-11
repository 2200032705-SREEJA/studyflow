import { NextResponse } from "next/server";
import { z } from "zod";
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

// Due date is no longer collected on the create-assignment form (it's not needed
// until planning actually starts), so it's set/changed here instead, from the
// workspace page.
const patchSchema = z.object({
  dueDate: z.string().nullable()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { assignment, status } = await getOwnedAssignment(params.id);
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.assignment.update({
    where: { id: assignment.id },
    data: { dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null }
  });

  return NextResponse.json(updated);
}