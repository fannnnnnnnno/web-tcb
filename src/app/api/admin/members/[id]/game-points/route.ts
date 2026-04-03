import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { logAdminAction } from "@/lib/adminLog";
import { z } from "zod";

const schema = z.object({
  amount: z.number().int().min(-99999).max(99999),
  reason: z.string().min(1).max(200),
  gameId: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { amount, reason, gameId } = parsed.data;

  // Verifikasi game ada
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return NextResponse.json({ error: "Game tidak ditemukan" }, { status: 404 });

  // Update atau buat GamePoint
  await prisma.gamePoint.upsert({
    where: { userId_gameId: { userId: id, gameId } },
    update: { points: { increment: amount } },
    create: { userId: id, gameId, points: Math.max(0, amount) },
  });

  // Update total points user (akumulasi semua game)
  const allGamePoints = await prisma.gamePoint.findMany({
    where: { userId: id },
    select: { points: true },
  });
  const newTotal = allGamePoints.reduce((sum, gp) => sum + gp.points, 0);

  await prisma.user.update({
    where: { id },
    data: { totalPoints: newTotal },
  });

  // Catat di PointLog dengan gameId
  await prisma.pointLog.create({
    data: { userId: id, amount, reason, gameId },
  });

  await logAdminAction({
    adminId: (session!.user as any).id,
    action: amount >= 0 ? "TAMBAH_POIN" : "KURANG_POIN",
    targetId: id,
    detail: `${amount > 0 ? "+" : ""}${amount} [${game.name}] — ${reason}`,
  });

  return NextResponse.json({ message: "Poin game diperbarui" });
}
