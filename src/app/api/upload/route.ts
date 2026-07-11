import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuid } from "uuid";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { authOptions } from "@/lib/auth";

// Stores uploaded PDFs on local disk under public/uploads, so they're served
// directly by Next's static file handler at the returned URL. This is the right
// default for running/demoing locally. If you deploy to Vercel (where the
// filesystem is read-only/ephemeral), swap this for real object storage, e.g.:
//   const { put } = await import("@vercel/blob");
//   const blob = await put(key, file, { access: "public" });
//   return blob.url;
async function storeFile(file: File): Promise<string> {
  const key = `${uuid()}-${file.name}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, key), bytes);

  return `/uploads/${key}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF uploads are supported." }, { status: 400 });
  }
  const MAX_BYTES = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (10MB limit)." }, { status: 400 });
  }

  const url = await storeFile(file);
  return NextResponse.json({ url });
}