import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function guard(s: any) { return s && ["ADMIN","SUPERADMIN"].includes(s.user.role); }

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!guard(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  const { name, description, imageUrl } = await req.json();
  const badge = await prisma.badge.update({
    where: { id },
    data: { name, description: description || null, imageUrl: imageUrl || null },
  });
  return NextResponse.json({ data: badge });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!guard(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  await prisma.badge.delete({ where: { id } });
  return NextResponse.json({ message: "Lencana dihapus" });
}
