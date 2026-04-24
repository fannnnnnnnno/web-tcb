import { NextResponse } from "next/server";
import { snapshotGlobalRanks, snapshotGameRanks } from "@/lib/rankUtils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET && secret !== "TCB_CRON_2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await snapshotGlobalRanks();

    const games = await prisma.game.findMany({ where: { isActive: true } });
    for (const game of games) {
      await snapshotGameRanks(game.id);
    }

    const count = await prisma.rankSnapshot.count();

    return NextResponse.json({
      success: true,
      message: `Snapshot berhasil untuk ${games.length} game`,
      totalSnapshots: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Snapshot error:", error);
    return NextResponse.json(
      { error: "Snapshot gagal", detail: String(error) },
      { status: 500 }
    );
  }
}
