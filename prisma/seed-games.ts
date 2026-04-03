import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const games = [
    { name: "Tekken 8",       slug: "tekken-8",       order: 1 },
    { name: "Street Fighter 6", slug: "street-fighter-6", order: 2 },
  ];

  for (const game of games) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: {},
      create: game,
    });
    console.log(`✓ Game: ${game.name}`);
  }

  console.log("Seed selesai!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
