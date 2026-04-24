import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BulkPointsForm } from "@/components/admin/BulkPointsForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Input Poin Massal" };

export default async function BulkPointsPage() {
  const session = await auth();
  const isSuperAdmin = (session?.user as any)?.role === "SUPERADMIN";

  const [members, games] = await Promise.all([
    prisma.user.findMany({
      where: { role: "MEMBER" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, username: true, totalPoints: true },
    }),
    prisma.game.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-tcb-white">Input Poin Massal</h1>
        <p className="text-tcb-gray-400 text-sm mt-1">
          Input poin untuk beberapa member sekaligus per game. Kolom kosong akan dilewati.
        </p>
      </div>
      <BulkPointsForm members={members} games={games} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
