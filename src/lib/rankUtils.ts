import { prisma } from "@/lib/prisma";

export function getWeekStart(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getLastWeekStart(): Date {
  const d = getWeekStart();
  d.setDate(d.getDate() - 7);
  return d;
}

// Prisma tidak menerima null di unique constraint — pakai "" untuk global
const GLOBAL_GAME_ID = "";

export async function snapshotGlobalRanks() {
  const weekStart = getWeekStart();
  const members = await prisma.user.findMany({
    where: { role: "MEMBER" },
    orderBy: { totalPoints: "desc" },
    select: { id: true, totalPoints: true },
  });

  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    await prisma.rankSnapshot.upsert({
      where: {
        userId_gameId_weekStart: {
          userId: m.id,
          gameId: GLOBAL_GAME_ID,
          weekStart,
        },
      },
      update: { rank: i + 1, points: m.totalPoints },
      create: {
        userId:   m.id,
        gameId:   GLOBAL_GAME_ID,
        rank:     i + 1,
        points:   m.totalPoints,
        weekStart,
      },
    });
  }
}

export async function snapshotGameRanks(gameId: string) {
  const weekStart = getWeekStart();
  const gamePoints = await prisma.gamePoint.findMany({
    where: { gameId },
    orderBy: { points: "desc" },
    select: { userId: true, points: true },
  });

  for (let i = 0; i < gamePoints.length; i++) {
    const gp = gamePoints[i];
    await prisma.rankSnapshot.upsert({
      where: {
        userId_gameId_weekStart: {
          userId:  gp.userId,
          gameId,
          weekStart,
        },
      },
      update: { rank: i + 1, points: gp.points },
      create: {
        userId:   gp.userId,
        gameId,
        rank:     i + 1,
        points:   gp.points,
        weekStart,
      },
    });
  }
}

export async function getRankChange(
  userId: string,
  currentRank: number,
  gameId?: string | null
): Promise<number | null> {
  const lastWeek = getLastWeekStart();
  const snapshot = await prisma.rankSnapshot.findUnique({
    where: {
      userId_gameId_weekStart: {
        userId,
        gameId: gameId ?? GLOBAL_GAME_ID,
        weekStart: lastWeek,
      },
    },
  });
  if (!snapshot) return null;
  return snapshot.rank - currentRank;
}
