import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnedAssignment } from "@/lib/getOwnedAssignment";

const schema = z.object({
  status: z.enum(["NOT_STARTED", "PLANNING", "DRAFT_READY", "REVIEWED", "COMPLETED"])
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { assignment, status } = await getOwnedAssignment(params.id);
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.assignment.update({
    where: { id: assignment.id },
    data: { status: parsed.data.status }
  });

  return NextResponse.json(updated);
}
