import { prisma } from "@/lib/prisma";
import { formatPoints, getAvatarUrl } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLastWeekStart } from "@/lib/rankUtils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Peringkat" };
export const revalidate = 300; // cache 5 menit

function PlayerAvatar({ name, avatarId, size }: { name: string; avatarId: string | null; size: "sm" | "md" }) {
  const dim    = size === "md" ? "w-14 h-14 sm:w-20 sm:h-20" : "w-10 h-10 text-sm";
  const border = "border-2";
  const url    = getAvatarUrl(avatarId);

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        loading="lazy"
        className={`${dim} rounded-full object-cover ${border} border-tcb-gray-600 flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-tcb-gray-700 ${border} border-tcb-gray-600 flex items-center justify-center font-black text-tcb-white flex-shrink-0`}>
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function RankBadge({ change }: { change: number | null }) {
  if (change === null) return <span className="text-xs text-tcb-gray-600">—</span>;
  if (change === 0) return <span className="text-xs text-tcb-gray-400">●</span>;
  if (change > 0) return (
    <span className="text-xs text-green-400 font-bold flex items-center gap-0.5">
      ▲{change}
    </span>
  );
  return (
    <span className="text-xs text-red-400 font-bold flex items-center gap-0.5">
      ▼{Math.abs(change)}
    </span>
  );
}

export default async function PeringkatPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; game?: string }>;
}) {
  const params  = await searchParams;
  const page    = Math.max(1, parseInt(params.page ?? "1"));
  const gameSlug = params.game ?? "global";
  const limit   = 10;

  const session = await getServerSession(authOptions);
  const myId    = (session?.user as any)?.id ?? null;

  // Ambil semua game aktif
  const games = await prisma.game.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  const lastWeek = getLastWeekStart();
  const isGlobal = gameSlug === "global";
  const activeGame = games.find((g) => g.slug === gameSlug) ?? null;

  let players: { id: string; username: string; name: string; avatarId: string | null; points: number }[] = [];
  let total = 0;

  if (isGlobal) {
    const [data, count] = await Promise.all([
      prisma.user.findMany({
        where: { role: "MEMBER" },
        orderBy: { totalPoints: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, username: true, name: true, avatarId: true, totalPoints: true },
      }),
      prisma.user.count({ where: { role: "MEMBER" } }),
    ]);
    players = data.map((p) => ({ ...p, points: p.totalPoints }));
    total   = count;
  } else if (activeGame) {
    const [data, count] = await Promise.all([
      prisma.gamePoint.findMany({
        where: { gameId: activeGame.id },
        orderBy: { points: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, username: true, name: true, avatarId: true } },
        },
      }),
      prisma.gamePoint.count({ where: { gameId: activeGame.id } }),
    ]);
    players = data.map((gp) => ({ ...gp.user, points: gp.points }));
    total   = count;
  }

  // Ambil snapshot minggu lalu untuk rank change
  const playerIds = players.map((p) => p.id);
  const snapshots = await prisma.rankSnapshot.findMany({
    where: {
      userId: { in: playerIds },
      gameId: isGlobal ? null : activeGame?.id ?? null,
      weekStart: lastWeek,
    },
  });
  const snapshotMap = new Map(snapshots.map((s) => [s.userId, s.rank]));

  const ranked = players.map((p, i) => {
    const currentRank = (page - 1) * limit + i + 1;
    const lastRank    = snapshotMap.get(p.id);
    const change      = lastRank != null ? lastRank - currentRank : null;
    return { ...p, rank: currentRank, change };
  });

  const isFirstPage = page === 1;
  const podium      = isFirstPage && ranked.length >= 3 ? ranked.slice(0, 3) : [];
  const list        = isFirstPage ? ranked.slice(3) : ranked;
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
        <div className="mb-8 sm:mb-10 text-center">
          <div className="red-line mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-tcb-white">
            Papan <span className="text-tcb-red">Peringkat</span>
          </h1>
          <p className="text-tcb-gray-400 mt-2 text-sm">{total} {isGlobal ? "anggota terdaftar" : `pemain ${activeGame?.name ?? ""}`}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 justify-center flex-wrap mb-8 sm:mb-10">
          <Link
            href="/peringkat"
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              isGlobal
                ? "bg-tcb-red border-tcb-red text-white"
                : "border-tcb-gray-700 text-tcb-gray-400 hover:text-white hover:border-tcb-gray-500"
            }`}
          >
            🌐 Global
          </Link>
          {games.map((g) => (
            <Link
              key={g.id}
              href={`/peringkat?game=${g.slug}`}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                gameSlug === g.slug
                  ? "bg-tcb-red border-tcb-red text-white"
                  : "border-tcb-gray-700 text-tcb-gray-400 hover:text-white hover:border-tcb-gray-500"
              }`}
            >
              {g.name}
            </Link>
          ))}
        </div>

        {/* PODIUM */}
        {podium.length >= 3 && (
          <div className="mb-12 sm:mb-16">
            <div className="flex items-end justify-center gap-3 sm:gap-6 md:gap-10">
              {PODIUM_DISPLAY.map(({ idx, pos, color, text, bg, h }) => {
                const player = podium[idx];
                if (!player) return null;
                const isFirst = pos === 1;
                const isMe    = player.id === myId;
                return (
                  <Link key={player.id} href={`/member/${player.username}`} className="flex flex-col items-center gap-2 sm:gap-3 group">
                    <div className={isFirst ? "scale-105 sm:scale-110" : ""}>
                      <div className="relative">
                        <div className={`rounded-full ${isMe ? "ring-4 ring-tcb-red ring-offset-2 ring-offset-tcb-black" : ""}`}>
                          <PlayerAvatar name={player.name} avatarId={player.avatarId} size="md" />
                        </div>
                        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black bg-tcb-gray-900 border-2 ${color} ${text}`}>
                          {pos}
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <div className={`font-black text-xs sm:text-sm max-w-[72px] sm:max-w-[96px] truncate ${isMe ? "text-tcb-red" : "text-tcb-white"}`}>
                        {player.name}
                      </div>
                      <div className={`text-xs font-bold ${text} mt-0.5`}>
                        {formatPoints(player.points)}
                      </div>
                      <div className="flex justify-center mt-1">
                        <RankBadge change={player.change} />
                      </div>
                    </div>
                    <div className={`w-20 sm:w-28 md:w-32 ${h} rounded-t-lg border-t-2 border-x-2 ${color} ${bg} flex items-start justify-center pt-2`}>
                      <span className={`text-2xl sm:text-3xl font-black ${text} opacity-20`}>{pos}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* LIST */}
        {list.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-2">
            {list.map((player) => {
              const isMe = player.id === myId;
              return (
                <Link
                  key={player.id}
                  href={`/member/${player.username}`}
                  className={`flex items-center gap-3 rounded-xl px-3 sm:px-4 py-3 transition-all border ${
                    isMe
                      ? "bg-tcb-red/10 border-tcb-red text-tcb-red"
                      : "bg-tcb-gray-800 border-tcb-gray-700 hover:border-tcb-red/40"
                  }`}
                >
                  <span className={`w-7 sm:w-8 text-center font-black text-base sm:text-lg flex-shrink-0 ${isMe ? "text-tcb-red" : "text-tcb-gray-400"}`}>
                    {player.rank}
                  </span>
                  <PlayerAvatar name={player.name} avatarId={player.avatarId} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm truncate ${isMe ? "text-tcb-red" : "text-tcb-white"}`}>
                      {player.name} {isMe && <span className="text-xs font-normal">(Kamu)</span>}
                    </div>
                    <div className="text-xs text-tcb-gray-400">@{player.username}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RankBadge change={player.change} />
                    <div className={`font-black text-sm ${isMe ? "text-tcb-red" : "text-tcb-red"}`}>
                      {formatPoints(player.points)}{" "}
                      <span className="text-tcb-gray-400 font-normal text-xs">pts</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {ranked.length === 0 && (
          <div className="text-center py-16 text-tcb-gray-400 text-sm">
            {isGlobal ? "Belum ada member terdaftar." : `Belum ada member bermain ${activeGame?.name ?? "game ini"}.`}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8 sm:mt-10 flex-wrap">
            {page > 1 && (
              <Link href={`/peringkat?game=${gameSlug}&page=${page - 1}`} className="btn-outline text-sm px-4 py-2">← Prev</Link>
            )}
            <span className="text-tcb-gray-400 text-sm">Hal {page} / {totalPages}</span>
            {page < totalPages && (
              <Link href={`/peringkat?game=${gameSlug}&page=${page + 1}`} className="btn-red text-sm px-4 py-2">Next →</Link>
            )}
          </div>
        )}

        {/* Keterangan rank change */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-tcb-gray-500">
          <span className="flex items-center gap-1"><span className="text-green-400">▲</span> Naik peringkat minggu ini</span>
          <span className="flex items-center gap-1"><span className="text-red-400">▼</span> Turun peringkat</span>
          <span className="flex items-center gap-1"><span>●</span> Tidak berubah</span>
        </div>

      </div>
    </div>
  );
}
