import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Hanya superadmin" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "File diperlukan" }, { status: 400 });

  const allowed = ["image/png", "image/jpeg", "image/webp"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Format tidak didukung" }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
  }

  const ext      = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `avatar_${Date.now()}.${ext}`;
  const dir      = path.join(process.cwd(), "public", "avatars");

  await mkdir(dir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(dir, filename), Buffer.from(bytes));

  const avatar = await prisma.avatar.create({
    data: { filename, url: `/avatars/${filename}` },
  });

  return NextResponse.json({ data: avatar }, { status: 201 });
}
