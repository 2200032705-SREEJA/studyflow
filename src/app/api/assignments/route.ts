import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  question: z.string().min(1),
  dueDate: z.string().optional().nullable(),
  pdfUrl: z.string().optional().nullable()
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const assignments = await prisma.assignment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      explain: { select: { id: true }, take: 1 },
      plan: { select: { id: true }, take: 1 },
      review: { select: { id: true }, take: 1 },
      viva: { select: { id: true }, take: 1 }
    }
  });

  return NextResponse.json(assignments);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, subject, question, dueDate, pdfUrl } = parsed.data;

  const assignment = await prisma.assignment.create({
    data: {
      userId,
      title,
      subject,
      question,
      pdfUrl: pdfUrl ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: "NOT_STARTED"
    }
  });

  return NextResponse.json(assignment, { status: 201 });
}
