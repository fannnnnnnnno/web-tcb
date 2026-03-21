import { prisma } from "@/lib/prisma";
import { BadgeForm, BadgeDeleteButton } from "@/components/admin/BadgeForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Lencana" };

export default async function AdminBadgesPage() {
  const badges = await prisma.badge.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { awardedTo: true } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-tcb-white">Lencana</h1>
        <BadgeForm mode="create" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.length === 0 && (
          <div className="col-span-3 card text-center py-12 text-tcb-gray-400 text-sm">Belum ada lencana.</div>
        )}
        {badges.map((badge) => (
          <div key={badge.id} className="card flex gap-4 items-start">
            {badge.imageUrl ? (
              <img src={badge.imageUrl} alt={badge.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover flex-shrink-0 border border-tcb-gray-700" />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-tcb-red/20 border border-tcb-red/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-tcb-red" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-black text-tcb-white text-sm">{badge.name}</div>
              {badge.description && <div className="text-xs text-tcb-gray-400 mt-0.5 line-clamp-2">{badge.description}</div>}
              <div className="text-xs text-tcb-gray-500 mt-1">Diberikan ke {badge._count.awardedTo} member</div>
              <div className="flex gap-2 mt-3">
                <BadgeForm mode="edit" badge={badge} />
                <BadgeDeleteButton badgeId={badge.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
