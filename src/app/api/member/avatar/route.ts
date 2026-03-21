import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { avatarId } = await req.json();

  // Verify avatar exists
  if (avatarId) {
    const avatar = await prisma.avatar.findFirst({ where: { filename: avatarId } });
    if (!avatar) return NextResponse.json({ error: "Avatar tidak valid" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarId },
  });

  return NextResponse.json({ message: "Avatar diperbarui" });
}
