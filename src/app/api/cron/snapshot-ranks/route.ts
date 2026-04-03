import { NextRequest, NextResponse } from "next/server";
import { snapshotGlobalRanks, snapshotGameRanks } from "@/lib/rankUtils";
import { prisma } from "@/lib/prisma";

// Panggil endpoint ini setiap minggu via Vercel Cron
// Tambahkan di vercel.json:
// { "crons": [{ "path": "/api/cron/snapshot-ranks", "schedule": "0 0 * * 1" }] }

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await snapshotGlobalRanks();

  const games = await prisma.game.findMany({ where: { isActive: true } });
  for (const game of games) {
    await snapshotGameRanks(game.id);
  }

  return NextResponse.json({ message: "Snapshot berhasil disimpan" });
}
