import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function adminGuard(session: any) {
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) return false;
  return true;
}

// POST /api/admin/members — add member
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!adminGuard(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { name, username, password } = await req.json();
  if (!name || !username || !password) return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return NextResponse.json({ error: "Username sudah dipakai" }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      name,
      username,
      password: await bcrypt.hash(password, 12),
      role: "MEMBER",
    },
  });

  return NextResponse.json({ data: user }, { status: 201 });
}
