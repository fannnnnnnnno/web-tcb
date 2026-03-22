import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const { amount, reason } = await req.json();
  if (!amount || !reason) return NextResponse.json({ error: "Isi semua field" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id },
    data: { totalPoints: { increment: Number(amount) } },
  });
  await prisma.pointLog.create({
    data: { userId: id, amount: Number(amount), reason },
  });
  return NextResponse.json({ data: user });
}
