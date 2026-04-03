import { prisma } from "@/lib/prisma";
import { formatDate, formatPoints, getAvatarUrl } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username }, select: { name: true } });
  return { title: user ? `${user.name} — FGC BJN` : "Member tidak ditemukan" };
}

export const revalidate = 300;

export default async function MemberProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username, role: "MEMBER" },
    include: {
      badges: { include: { badge: true }, orderBy: { awardedAt: "desc" } },
      gamePoints: { include: { game: true }, orderBy: { points: "desc" } },
    },
  });

  if (!user) notFound();

  const avatarUrl = getAvatarUrl(user.avatarId);

  const rank = await prisma.user.count({
    where: { role: "MEMBER", totalPoints: { gt: user.totalPoints } },
  }) + 1;

  return (
    <div className="min-h-screen bg-tcb-black pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8">
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-tcb-red" />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-tcb-gray-700 border-4 border-tcb-red flex items-center justify-center text-4xl font-black text-tcb-white">
                {user.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-tcb-white">{user.name}</h1>
            <p className="text-tcb-gray-400 text-sm mt-1">@{user.username}</p>
            <p className="text-tcb-gray-500 text-xs mt-0.5">Bergabung {formatDate(user.joinedAt)}</p>
            <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start flex-wrap">
              <span className="text-tcb-red font-black text-xl">{formatPoints(user.totalPoints)}</span>
              <span className="text-tcb-gray-400 text-sm">poin global</span>
              <span className="text-tcb-gray-600">·</span>
              <span className="text-tcb-gray-200 font-bold text-sm">Peringkat #{rank}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Statistik */}
          <div className="card">
            <h2 className="font-black text-tcb-white text-base mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-tcb-red rounded-full" />
              Statistik
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Poin",  value: formatPoints(user.totalPoints) },
                { label: "Peringkat",   value: `#${rank}` },
                { label: "Lencana",     value: user.badges.length.toString() },
                { label: "Bergabung",   value: new Date(user.joinedAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" }) },
              ].map((s) => (
                <div key={s.label} className="bg-tcb-gray-900 border border-tcb-gray-700 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-tcb-red">{s.value}</div>
                  <div className="text-xs text-tcb-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Poin per Game */}
          <div className="card">
            <h2 className="font-black text-tcb-white text-base mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-tcb-red rounded-full" />
              Poin per Game
            </h2>
            {user.gamePoints.length === 0 ? (
              <p className="text-tcb-gray-400 text-sm">Belum ada poin per game.</p>
            ) : (
              <div className="space-y-2">
                {user.gamePoints.map((gp) => (
                  <div key={gp.id} className="flex items-center justify-between py-2 border-b border-tcb-gray-700 last:border-0">
                    <span className="text-sm font-semibold text-tcb-white">{gp.game.name}</span>
                    <span className="text-sm font-black text-tcb-red">{formatPoints(gp.points)} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lencana */}
          <div className="card md:col-span-2">
            <h2 className="font-black text-tcb-white text-base mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-tcb-red rounded-full" />
              Lencana ({user.badges.length})
            </h2>
            {user.badges.length === 0 ? (
              <p className="text-tcb-gray-400 text-sm">Belum ada lencana.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {user.badges.map(({ badge, note }) => (
                  <div key={badge.id} className="bg-tcb-gray-900 border border-tcb-gray-700 rounded-xl p-3 flex items-center gap-3" title={note ?? badge.description ?? ""}>
                    {badge.imageUrl ? (
                      <img src={badge.imageUrl} alt={badge.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-tcb-red/20 border border-tcb-red/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-tcb-red" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-tcb-white truncate">{badge.name}</div>
                      {badge.description && <div className="text-xs text-tcb-gray-400 truncate">{badge.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
