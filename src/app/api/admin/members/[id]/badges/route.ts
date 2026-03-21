import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { badgeId, note } = await req.json();
  if (!badgeId) return NextResponse.json({ error: "Pilih lencana" }, { status: 400 });

  try {
    const ub = await prisma.userBadge.create({
      data: { userId: params.id, badgeId, note },
    });
    return NextResponse.json({ data: ub }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Member sudah punya lencana ini" }, { status: 409 });
  }
}
