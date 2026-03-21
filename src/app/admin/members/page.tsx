import { prisma } from "@/lib/prisma";
import { formatPoints, formatDate } from "@/lib/utils";
import { AdminMemberActions } from "@/components/admin/AdminMemberActions";
import { AddMemberForm } from "@/components/admin/AddMemberForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Member" };

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const page   = Math.max(1, parseInt(params.page ?? "1"));
  const limit  = 20;

  const where = search
    ? { role: "MEMBER", OR: [{ name: { contains: search } }, { username: { contains: search } }] }
    : { role: "MEMBER" };

  const [members, total, badges] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { totalPoints: "desc" },
      include: { _count: { select: { badges: true } } },
    }),
    prisma.user.count({ where }),
    prisma.badge.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-tcb-white">Member</h1>
        <AddMemberForm />
      </div>

      <form className="flex gap-2 mb-5 flex-wrap">
        <input name="search" defaultValue={search} placeholder="Cari nama atau username..." className="input text-sm max-w-xs flex-1 min-w-0" />
        <button type="submit" className="btn-outline text-sm px-4 py-2">Cari</button>
        {search && <a href="/admin/members" className="btn-ghost text-sm px-4 py-2">Reset</a>}
      </form>

      {/* Desktop table */}
      <div className="hidden sm:block card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tcb-gray-700">
                {["#", "Nama", "Username", "Poin", "Lencana", "Bergabung", "Aksi"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-tcb-gray-400 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.id} className="border-b border-tcb-gray-700/50 hover:bg-tcb-gray-700/20 transition-colors">
                  <td className="px-4 py-3 text-tcb-gray-400 font-mono text-xs">{(page - 1) * limit + i + 1}</td>
                  <td className="px-4 py-3 font-bold text-tcb-white">{m.name}</td>
                  <td className="px-4 py-3 text-tcb-gray-400">@{m.username}</td>
                  <td className="px-4 py-3 text-tcb-red font-black">{formatPoints(m.totalPoints)}</td>
                  <td className="px-4 py-3 text-tcb-gray-200">{m._count.badges}</td>
                  <td className="px-4 py-3 text-tcb-gray-400 text-xs whitespace-nowrap">{formatDate(m.joinedAt)}</td>
                  <td className="px-4 py-3"><AdminMemberActions member={m} badges={badges} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {members.map((m, i) => (
          <div key={m.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-tcb-gray-500 font-mono">{(page - 1) * limit + i + 1}.</span>
                  <span className="font-bold text-tcb-white text-sm truncate">{m.name}</span>
                </div>
                <div className="text-xs text-tcb-gray-400">@{m.username}</div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-tcb-red font-black text-sm">{formatPoints(m.totalPoints)} pts</span>
                  <span className="text-xs text-tcb-gray-400">{m._count.badges} lencana</span>
                </div>
              </div>
              <AdminMemberActions member={m} badges={badges} />
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="card text-center py-10 text-tcb-gray-400 text-sm">Tidak ada member ditemukan.</div>
      )}

      {total > limit && (
        <div className="flex gap-2 mt-5 items-center flex-wrap">
          {page > 1 && <a href={`/admin/members?page=${page - 1}&search=${search}`} className="btn-outline text-sm px-4 py-2">← Prev</a>}
          <span className="text-xs text-tcb-gray-400">Hal {page} / {Math.ceil(total / limit)}</span>
          {page * limit < total && <a href={`/admin/members?page=${page + 1}&search=${search}`} className="btn-red text-sm px-4 py-2">Next →</a>}
        </div>
      )}
    </div>
  );
}
