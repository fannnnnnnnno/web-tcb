import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [members, games] = await Promise.all([
    prisma.user.findMany({ where: { role: "MEMBER" }, select: { id: true, name: true } }),
    prisma.game.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
  ]);

  console.log(`Ditemukan ${members.length} member dan ${games.length} game.`);

  let created = 0;
  let skipped = 0;

  for (const member of members) {
    for (const game of games) {
      const existing = await prisma.gamePoint.findUnique({
        where: { userId_gameId: { userId: member.id, gameId: game.id } },
      });

      if (!existing) {
        await prisma.gamePoint.create({
          data: { userId: member.id, gameId: game.id, points: 0 },
        });
        created++;
      } else {
        skipped++;
      }
    }
  }

  console.log(`✓ Selesai! ${created} dibuat, ${skipped} sudah ada.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
