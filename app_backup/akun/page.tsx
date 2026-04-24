
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate, formatPoints, getAvatarUrl } from "@/lib/utils";
import { AvatarSection } from "@/components/akun/AvatarSection";
import { ProfileEditForm } from "@/components/akun/ProfileEditForm";
import { CollapsibleSection } from "@/components/akun/CollapsibleSection";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Akun Saya" };

export default async function AkunPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [user, avatars] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        badges: { include: { badge: true }, orderBy: { awardedAt: "desc" } },
        pointLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    }),
    prisma.avatar.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  if (!user) redirect("/login");

  const rank =
    (await prisma.user.count({
      where: { role: "MEMBER", totalPoints: { gt: user.totalPoints } },
    })) + 1;

  const avatarUrl = getAvatarUrl(user.avatarId);

  return (
    <div className="min-h-screen pt-20 pb-12" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8">
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-tcb-red" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-tcb-red flex items-center justify-center text-3xl sm:text-4xl font-black"
                style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-primary)" }}>
                {user.name[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              {user.name}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-faint)" }}>@{user.username}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
              Bergabung {formatDate(user.joinedAt)}
            </p>
            <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start flex-wrap">
              <span className="text-tcb-red font-black text-lg sm:text-xl">
                {formatPoints(user.totalPoints)}
              </span>
              <span className="text-sm" style={{ color: "var(--text-faint)" }}>poin</span>
              <span style={{ color: "var(--border-mid)" }}>·</span>
              <span className="font-bold text-sm" style={{ color: "var(--text-muted)" }}>
                Peringkat #{rank}
              </span>
            </div>
          </div>
        </div>

        {/* Grid utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">

          {/* Statistik */}
          <div className="card">
            <h2 className="font-black text-base sm:text-lg mb-4 flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}>
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
                <div key={s.label} className="rounded-xl p-3 text-center border"
                  style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                  <div className="text-lg sm:text-xl font-black text-tcb-red">{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lencana */}
          <div className="card">
            <h2 className="font-black text-base sm:text-lg mb-4 flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}>
              <span className="w-1 h-5 bg-tcb-red rounded-full" />
              Lencana ({user.badges.length})
            </h2>
            {user.badges.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                Belum ada lencana. Terus berprestasi!
              </p>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
                {user.badges.map(({ badge, note }) => (
                  <div key={badge.id} className="rounded-xl p-3 flex items-center gap-3 border"
                    style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
                    title={note ?? badge.description ?? ""}>
                    {badge.imageUrl ? (
                      <img src={badge.imageUrl} alt={badge.name}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-tcb-red/20 border border-tcb-red/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-tcb-red" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                        {badge.name}
                      </div>
                      {badge.description && (
                        <div className="text-xs truncate" style={{ color: "var(--text-faint)" }}>
                          {badge.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Riwayat Poin */}
          <div className="card md:col-span-2">
            <h2 className="font-black text-base sm:text-lg mb-4 flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}>
              <span className="w-1 h-5 bg-tcb-red rounded-full" />
              Riwayat Poin
            </h2>
            {user.pointLogs.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                Belum ada perubahan poin.
              </p>
            ) : (
              <div className="space-y-1.5">
                {user.pointLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center py-2 gap-3 last:border-0"
                    style={{ borderBottom: "1px solid var(--border)" }}>
                    <span className="text-sm flex-1 min-w-0 truncate" style={{ color: "var(--text-muted)" }}>
                      {log.reason}
                    </span>
                    <span className={`text-sm font-bold flex-shrink-0 ${log.amount >= 0 ? "text-green-500" : "text-red-400"}`}>
                      {log.amount >= 0 ? "+" : ""}{formatPoints(log.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Collapsible */}
        <div className="space-y-3">
          <CollapsibleSection title="Ganti Avatar" icon="avatar">
            <AvatarSection avatars={avatars} currentAvatarId={user.avatarId}
              avatarLastUploadAt={user.avatarLastUploadAt} />
          </CollapsibleSection>
          <CollapsibleSection title="Edit Profil" icon="edit">
            <ProfileEditForm currentName={user.name} />
          </CollapsibleSection>
        </div>

      </div>
    </div>
  );
}
