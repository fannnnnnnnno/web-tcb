import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { newPassword } = await req.json();

  if (!newPassword || newPassword.length < 6)
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user)
    return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });

  await prisma.user.update({
    where: { id },
    data: { password: await bcrypt.hash(newPassword, 12) },
  });

  return NextResponse.json({ message: "Password berhasil diubah" });
}