import { prisma } from "./src/lib/prisma";

async function main() {
  const game = await prisma.game.findUnique({ where: { slug: "doa6" } });
  if (!game) throw new Error("Game DOA 6 tidak ditemukan");

  const users = await prisma.user.findMany({ where: { role: "MEMBER" }, select: { id: true } });

  for (const user of users) {
    await prisma.gamePoint.upsert({
      where: { userId_gameId: { userId: user.id, gameId: game.id } },
      update: {},
      create: { userId: user.id, gameId: game.id, points: 0 },
    });
  }

  console.log(`Done: ${users.length} pemain ditambahkan ke DOA 6`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
