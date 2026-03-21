import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Hanya superadmin" }, { status: 403 });
  }

  const avatar = await prisma.avatar.findUnique({ where: { id: params.id } });
  if (!avatar) return NextResponse.json({ error: "Avatar tidak ditemukan" }, { status: 404 });

  // Hapus file fisik
  try {
    await unlink(path.join(process.cwd(), "public", "avatars", avatar.filename));
  } catch {
    // File mungkin sudah tidak ada, lanjut saja
  }

  // Hapus dari DB + reset user yang pakai avatar ini
  await prisma.user.updateMany({
    where: { avatarId: avatar.filename },
    data: { avatarId: null },
  });

  await prisma.avatar.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "Avatar dihapus" });
}
