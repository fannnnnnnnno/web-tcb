import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  if (session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user)
    return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });

  await prisma.user.update({
    where: { id },
    data: { avatarLastUploadAt: null },
  });

  return NextResponse.json({ message: "Cooldown avatar berhasil direset" });
}