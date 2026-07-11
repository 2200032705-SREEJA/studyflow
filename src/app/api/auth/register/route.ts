import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1),
  username: z
    .string()
    .min(3)
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, _ . -"),
  email: z.string().email(),
  password: z.string().min(8),
  gender: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { name, username, email, password, gender } = parsed.data;

    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
    if (existing) {
      return NextResponse.json(
        { error: existing.username === username ? "That username is taken." : "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, username, email, passwordHash, gender }
    });

    return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Something went wrong while creating your account. Please try again." },
      { status: 500 }
    );
  }
}