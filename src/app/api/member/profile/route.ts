import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(50).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
}).refine((d) => {
  if (d.newPassword && !d.currentPassword) return false;
  return true;
}, { message: "Password lama wajib diisi untuk ganti password" });

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, currentPassword, newPassword } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

  const updateData: Record<string, string> = {};
  if (name && name !== user.name) updateData.name = name;

  if (newPassword && currentPassword) {
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Password lama salah" }, { status: 400 });
    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: (session.user as any).id }, data: updateData });
  return NextResponse.json({ message: "Profil diperbarui" });
}
