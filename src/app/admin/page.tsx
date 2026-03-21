import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [members, agendas, badges, avatars] = await Promise.all([
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.agenda.count({ where: { isPublished: true } }),
    prisma.badge.count(),
    prisma.avatar.count(),
  ]);

  const recentMembers = await prisma.user.findMany({
    where: { role: "MEMBER" },
    orderBy: { joinedAt: "desc" },
    take: 5,
    select: { id: true, name: true, username: true, totalPoints: true, joinedAt: true },
  });

  const stats = [
    { label: "Total Member", value: members,  href: "/admin/members", color: "text-tcb-red" },
    { label: "Agenda Aktif", value: agendas,  href: "/admin/agendas", color: "text-blue-400" },
    { label: "Lencana",      value: badges,   href: "/admin/badges",  color: "text-yellow-400" },
    { label: "Avatar",       value: avatars,  href: "/admin/avatars", color: "text-green-400" },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-black text-tcb-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card-hover text-center py-4">
            <div className={`text-3xl sm:text-4xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-tcb-gray-400">{s.label}</div>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-black text-tcb-white text-sm sm:text-base">Member Terbaru</h2>
          <Link href="/admin/members" className="text-xs text-tcb-red hover:underline">Lihat semua</Link>
        </div>
        <div className="card p-0 overflow-hidden">
          {/* Desktop */}
          <table className="hidden sm:table w-full text-sm">
            <thead>
              <tr className="border-b border-tcb-gray-700">
                <th className="px-4 py-3 text-left text-xs text-tcb-gray-400 font-semibold">Nama</th>
                <th className="px-4 py-3 text-left text-xs text-tcb-gray-400 font-semibold">Username</th>
                <th className="px-4 py-3 text-left text-xs text-tcb-gray-400 font-semibold">Poin</th>
              </tr>
            </thead>
            <tbody>
              {recentMembers.map((m) => (
                <tr key={m.id} className="border-b border-tcb-gray-700/50 hover:bg-tcb-gray-700/20">
                  <td className="px-4 py-3 font-semibold text-tcb-white">{m.name}</td>
                  <td className="px-4 py-3 text-tcb-gray-400">@{m.username}</td>
                  <td className="px-4 py-3 text-tcb-red font-bold">{m.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Mobile */}
          <div className="sm:hidden divide-y divide-tcb-gray-700">
            {recentMembers.map((m) => (
              <div key={m.id} className="flex justify-between items-center px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-tcb-white">{m.name}</div>
                  <div className="text-xs text-tcb-gray-400">@{m.username}</div>
                </div>
                <div className="text-tcb-red font-bold text-sm">{m.totalPoints} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
