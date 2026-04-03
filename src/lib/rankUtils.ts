import { prisma } from "@/lib/prisma";

// Ambil tanggal awal minggu (Senin)
export function getWeekStart(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Ambil snapshot minggu lalu
export function getLastWeekStart(): Date {
  const d = getWeekStart();
  d.setDate(d.getDate() - 7);
  return d;
}

// Simpan snapshot peringkat global semua member
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
          gameId: null as any,
          weekStart,
        },
      },
      update: { rank: i + 1, points: m.totalPoints },
      create: {
        userId: m.id,
        gameId: null,
        rank: i + 1,
        points: m.totalPoints,
        weekStart,
      },
    });
  }
}

// Simpan snapshot peringkat per game
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
          userId: gp.userId,
          gameId,
          weekStart,
        },
      },
      update: { rank: i + 1, points: gp.points },
      create: {
        userId: gp.userId,
        gameId,
        rank: i + 1,
        points: gp.points,
        weekStart,
      },
    });
  }
}

// Ambil perubahan peringkat member (naik/turun)
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
        gameId: gameId ?? null as any,
        weekStart: lastWeek,
      },
    },
  });

  if (!snapshot) return null;
  return snapshot.rank - currentRank; // positif = naik, negatif = turun
}
