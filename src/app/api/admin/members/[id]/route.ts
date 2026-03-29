import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { logAdminAction } from "@/lib/adminLog";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const target = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  await prisma.user.delete({ where: { id } });

  await logAdminAction({
    adminId: (session!.user as any).id,
    action: "HAPUS_MEMBER",
    targetId: id,
    detail: target?.name ?? id,
  });

  return NextResponse.json({ message: "Member dihapus" });
}
