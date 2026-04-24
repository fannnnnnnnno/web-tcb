import { prisma } from "./src/lib/prisma";

async function main() {
  const game = await prisma.game.create({
    data: {
      name: "Dead or Alive 6",
      slug: "doa6",
      isActive: true,
      order: 3,
    },
  });
  console.log("Game added:", game);
}

main().catch(console.error).finally(() => prisma.$disconnect());
