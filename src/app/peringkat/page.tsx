import { prisma } from "@/lib/prisma";
import { formatPoints } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Peringkat" };

function PlayerAvatar({ name, avatarId, size }: { name: string; avatarId: string | null; size: "sm" | "md" }) {
  const dim    = size === "md" ? "w-14 h-14 sm:w-20 sm:h-20 text-xl sm:text-2xl" : "w-10 h-10 text-sm";
  const border = "border-2";
  if (avatarId) {
    return (
      <img
        src={`/avatars/${avatarId}`}
        alt={name}
        className={`${dim} rounded-full object-cover ${border} border-tcb-gray-600 flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-tcb-gray-700 ${border} border-tcb-gray-600 flex items-center justify-center font-black text-tcb-white flex-shrink-0`}>
      {name[0].toUpperCase()}
    </div>
  );
}

export default async function PeringkatPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // Next.js 15: searchParams must be awaited
  const params = await searchParams;
  const page   = Math.max(1, parseInt(params.page ?? "1"));
  const limit  = 10;

  const [allPlayers, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: "MEMBER" },
      orderBy: { totalPoints: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, username: true, name: true, avatarId: true, totalPoints: true },
    }),
    prisma.user.count({ where: { role: "MEMBER" } }),
  ]);

  const ranked      = allPlayers.map((p, i) => ({ ...p, rank: (page - 1) * limit + i + 1 }));
  const isFirstPage = page === 1;
  const podium      = isFirstPage ? ranked.slice(0, 3) : [];
  const list        = isFirstPage ? ranked.slice(3)    : ranked;
  const totalPages  = Math.ceil(total / limit);

  const PODIUM_DISPLAY = [
    { idx: 1, pos: 2, color: "border-gray-400",  text: "text-gray-300",  bg: "bg-gray-400/10",  h: "h-16 sm:h-24" },
    { idx: 0, pos: 1, color: "border-tcb-red",   text: "text-tcb-red",   bg: "bg-tcb-red/10",   h: "h-24 sm:h-32" },
    { idx: 2, pos: 3, color: "border-amber-500", text: "text-amber-400", bg: "bg-amber-500/10", h: "h-12 sm:h-20" },
  ];

  return (
    <div className="min-h-screen bg-tcb-black pt-16 sm:pt-20">
      <div className="section">
        {/* Header */}
        <div className="mb-10 sm:mb-14 text-center">
          <div className="red-line mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-tcb-white">
            Papan <span className="text-tcb-red">Peringkat</span>
          </h1>
          <p className="text-tcb-gray-400 mt-2 text-sm">{total} anggota terdaftar</p>
        </div>

        {/* PODIUM — page 1 only, min 3 members */}
        {isFirstPage && podium.length >= 3 && (
          <div className="mb-12 sm:mb-16">
            <div className="flex items-end justify-center gap-3 sm:gap-6 md:gap-10">
              {PODIUM_DISPLAY.map(({ idx, pos, color, text, bg, h }) => {
                const player = podium[idx];
                if (!player) return null;
                const isFirst = pos === 1;
                return (
                  <div key={player.id} className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className={isFirst ? "scale-105 sm:scale-110" : ""}>
                      <div className="relative">
                        <PlayerAvatar name={player.name} avatarId={player.avatarId} size="md" />
                        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black bg-tcb-gray-900 border-2 ${color} ${text}`}>
                          {pos}
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <div className="font-black text-tcb-white text-xs sm:text-sm max-w-[72px] sm:max-w-[96px] truncate">
                        {player.name}
                      </div>
                      <div className={`text-xs font-bold ${text} mt-0.5`}>
                        {formatPoints(player.totalPoints)}
                      </div>
                    </div>
                    <div className={`w-20 sm:w-28 md:w-32 ${h} rounded-t-lg border-t-2 border-x-2 ${color} ${bg} flex items-start justify-center pt-2`}>
                      <span className={`text-2xl sm:text-3xl font-black ${text} opacity-20`}>{pos}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LIST */}
        {list.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-2">
            {list.map((player) => (
              <div key={player.id} className="flex items-center gap-3 bg-tcb-gray-800 border border-tcb-gray-700 rounded-xl px-3 sm:px-4 py-3 hover:border-tcb-red/40 transition-all">
                <span className="w-7 sm:w-8 text-center font-black text-tcb-gray-400 text-base sm:text-lg flex-shrink-0">
                  {player.rank}
                </span>
                <PlayerAvatar name={player.name} avatarId={player.avatarId} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-tcb-white text-sm truncate">{player.name}</div>
                  <div className="text-xs text-tcb-gray-400">@{player.username}</div>
                </div>
                <div className="text-tcb-red font-black text-sm flex-shrink-0">
                  {formatPoints(player.totalPoints)}{" "}
                  <span className="text-tcb-gray-400 font-normal text-xs">pts</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {ranked.length === 0 && (
          <div className="text-center py-16 text-tcb-gray-400 text-sm">Belum ada member terdaftar.</div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8 sm:mt-10 flex-wrap">
            {page > 1 && (
              <Link href={`/peringkat?page=${page - 1}`} className="btn-outline text-sm px-4 py-2">
                ← Prev
              </Link>
            )}
            <span className="text-tcb-gray-400 text-sm">Hal {page} / {totalPages}</span>
            {page < totalPages && (
              <Link href={`/peringkat?page=${page + 1}`} className="btn-red text-sm px-4 py-2">
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
