import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function guard(s: any) { return s && ["ADMIN","SUPERADMIN"].includes(s.user.role); }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { name, description, imageUrl } = await req.json();
  if (!name) return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
  const badge = await prisma.badge.create({ data: { name, description: description || null, imageUrl: imageUrl || null } });
  return NextResponse.json({ data: badge }, { status: 201 });
}
