import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { logAdminAction } from "@/lib/adminLog";

export async function POST(req: NextRequest) {
  const { error, session } = await requireAdmin(["SUPERADMIN"]);
  if (error) return error;

  // Reset semua GamePoint ke 0
  await prisma.gamePoint.updateMany({
    data: { points: 0 },
  });

  // Reset totalPoints semua member ke 0
  await prisma.user.updateMany({
    where: { role: "MEMBER" },
    data: { totalPoints: 0 },
  });

  // Catat di log
  await logAdminAction({
    adminId: (session!.user as any).id,
    action: "TAMBAH_POIN",
    detail: "RESET SEMUA POIN — semua poin member direset ke 0",
  });

  return NextResponse.json({ message: "Semua poin berhasil direset" });
}
