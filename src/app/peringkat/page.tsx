import { prisma } from "@/lib/prisma";
import { formatPoints, getAvatarUrl } from "@/lib/utils";

import { auth } from "@/auth";
import { getLastWeekStart } from "@/lib/rankUtils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Peringkat" };
export const revalidate = 300;

function PlayerAvatar({ name, avatarId, size }: { name: string; avatarId: string | null; size: "sm" | "md" }) {
  const dim    = size === "md" ? "w-14 h-14 sm:w-20 sm:h-20" : "w-10 h-10 text-sm";
  const url    = getAvatarUrl(avatarId);
  if (url) {
    return (
      <img src={url} alt={name} loading="lazy"
        className={`${dim} rounded-full object-cover border-2 flex-shrink-0`}
        style={{ borderColor: "var(--border-mid)" }} />
    );
  }
  return (
    <div className={`${dim} rounded-full border-2 flex items-center justify-center font-black flex-shrink-0`}
      style={{ backgroundColor: "var(--bg-card-hover)", borderColor: "var(--border-mid)", color: "var(--text-primary)" }}>
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function RankBadge({ change }: { change: number | null }) {
  if (change === null) return <span className="text-xs" style={{ color: "var(--border-mid)" }}>—</span>;
  if (change === 0)    return <span className="text-xs" style={{ color: "var(--text-faint)" }}>●</span>;
  if (change > 0) return (
    <span className="text-xs text-green-500 font-bold flex items-center gap-0.5">▲{change}</span>
  );
  return (
    <span className="text-xs text-red-400 font-bold flex items-center gap-0.5">▼{Math.abs(change)}</span>
  );
}

export default async function PeringkatPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; game?: string }>;
}) {
  const params   = await searchParams;
  const page     = Math.max(1, parseInt(params.page ?? "1"));
  const gameSlug = params.game ?? "global";
  const limit    = 10;

  const session = await auth();
  const myId    = (session?.user as any)?.id ?? null;

  const games = await prisma.game.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  const lastWeek   = getLastWeekStart();
  const isGlobal   = gameSlug === "global";
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
        include: { user: { select: { id: true, username: true, name: true, avatarId: true } } },
      }),
      prisma.gamePoint.count({ where: { gameId: activeGame.id } }),
    ]);
    players = data.map((gp) => ({ ...gp.user, points: gp.points }));
    total   = count;
  }

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
    { idx: 1, pos: 2, borderColor: "#9ca3af", textColor: "#6b7280", bgColor: "rgba(156,163,175,0.15)", h: "h-16 sm:h-24" },
    { idx: 0, pos: 1, borderColor: "#FFD400", textColor: "#FFD400", bgColor: "rgba(224,30,43,0.12)",   h: "h-24 sm:h-32" },
    { idx: 2, pos: 3, borderColor: "#cd7f32", textColor: "#b87333", bgColor: "rgba(205,127,50,0.12)",  h: "h-12 sm:h-20" },
  ];

  return (
    <div className="min-h-screen pt-16 sm:pt-20" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="section">

        {/* Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <div className="red-line mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight"
            style={{ color: "var(--text-primary)" }}>
            Papan <span className="text-tcb-red">Peringkat</span>
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-faint)" }}>
            {total} {isGlobal ? "anggota terdaftar" : `pemain ${activeGame?.name ?? ""}`}
          </p>
        </div>

        {/* Tabs */}
<div className="flex gap-1.5 flex-wrap justify-center mb-8 sm:mb-10">
  <Link href="/peringkat"
    className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all border whitespace-nowrap"
    style={isGlobal
      ? { backgroundColor: "#E01E2B", borderColor: "#E01E2B", color: "#fff" }
      : { backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-faint)" }
    }
  >
    Global
  </Link>
  {games.map((g) => (
    <Link key={g.id} href={`/peringkat?game=${g.slug}`}
      className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all border whitespace-nowrap"
      style={gameSlug === g.slug
        ? { backgroundColor: "#E01E2B", borderColor: "#E01E2B", color: "#fff" }
        : { backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-faint)" }
      }
    >
      {g.name}
    </Link>
  ))}
</div>

        {/* PODIUM */}
        {podium.length >= 3 && (
          <div className="mb-12 sm:mb-16">
            <div className="flex items-end justify-center gap-3 sm:gap-6 md:gap-10">
              {PODIUM_DISPLAY.map(({ idx, pos, borderColor, textColor, bgColor, h }) => {
                const player = podium[idx];
                if (!player) return null;
                const isFirst = pos === 1;
                const isMe    = player.id === myId;
                return (
                  <Link key={player.id} href={`/member/${player.username}`}
                    className="flex flex-col items-center gap-2 sm:gap-3 group">
                    <div className={isFirst ? "scale-105 sm:scale-110" : ""}>
                      <div className="relative">
                        <div className={isMe ? "ring-4 ring-tcb-red ring-offset-2 rounded-full" : ""}
                          style={isMe ? { "--tw-ring-offset-color": "var(--bg-primary)" } as React.CSSProperties : {}}>
                          <PlayerAvatar name={player.name} avatarId={player.avatarId} size="md" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border-2"
                          style={{ backgroundColor: "var(--bg-secondary)", borderColor, color: textColor }}>
                          {pos}
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <div className="font-black text-xs sm:text-sm max-w-[72px] sm:max-w-[96px] truncate"
                        style={{ color: isMe ? "#E01E2B" : "var(--text-primary)" }}>
                        {player.name}
                      </div>
                      <div className="text-xs font-bold mt-0.5" style={{ color: textColor }}>
                        {formatPoints(player.points)}
                      </div>
                      <div className="flex justify-center mt-1">
                        <RankBadge change={player.change} />
                      </div>
                    </div>
                    <div className={`w-20 sm:w-28 md:w-32 ${h} rounded-t-lg border-t-2 border-x-2 flex items-start justify-center pt-2`}
                      style={{ borderColor, backgroundColor: bgColor }}>
                      <span className="text-2xl sm:text-3xl font-black opacity-20" style={{ color: textColor }}>{pos}</span>
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
                <Link key={player.id} href={`/member/${player.username}`}
                  className={`flex items-center gap-3 rounded-xl px-3 sm:px-4 py-3 transition-all border ${!isMe ? "rank-row" : ""}`}
                  style={isMe
                    ? { backgroundColor: "rgba(224,30,43,0.12)", borderColor: "#E01E2B" }
                    : { backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }
                  }

                >
                  <span className="w-7 sm:w-8 text-center font-black text-base sm:text-lg flex-shrink-0"
                    style={{ color: isMe ? "#E01E2B" : "var(--text-faint)" }}>
                    {player.rank}
                  </span>
                  <PlayerAvatar name={player.name} avatarId={player.avatarId} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate"
                      style={{ color: isMe ? "#E01E2B" : "var(--text-primary)" }}>
                      {player.name} {isMe && <span className="text-xs font-normal">(Kamu)</span>}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-faint)" }}>@{player.username}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RankBadge change={player.change} />
                    <div className="font-black text-sm text-tcb-red">
                      {formatPoints(player.points)}{" "}
                      <span className="font-normal text-xs" style={{ color: "var(--text-faint)" }}>pts</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {ranked.length === 0 && (
          <div className="text-center py-16 text-sm" style={{ color: "var(--text-faint)" }}>
            {isGlobal ? "Belum ada member terdaftar." : `Belum ada member bermain ${activeGame?.name ?? "game ini"}.`}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8 sm:mt-10 flex-wrap">
            {page > 1 && (
              <Link href={`/peringkat?game=${gameSlug}&page=${page - 1}`} className="btn-outline text-sm px-4 py-2">
                ← Prev
              </Link>
            )}
            <span className="text-sm" style={{ color: "var(--text-faint)" }}>Hal {page} / {totalPages}</span>
            {page < totalPages && (
              <Link href={`/peringkat?game=${gameSlug}&page=${page + 1}`} className="btn-red text-sm px-4 py-2">
                Next →
              </Link>
            )}
          </div>
        )}

        {/* Keterangan rank change */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs flex-wrap"
          style={{ color: "var(--text-faint)" }}>
          <span className="flex items-center gap-1"><span className="text-green-500">▲</span> Naik peringkat minggu ini</span>
          <span className="flex items-center gap-1"><span className="text-red-400">▼</span> Turun peringkat</span>
          <span className="flex items-center gap-1"><span>●</span> Tidak berubah</span>
        </div>

      </div>
    </div>
  );
}
