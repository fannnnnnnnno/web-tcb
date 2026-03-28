"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Badge, User } from "@prisma/client";
import { Spinner } from "@/components/ui/LoadingComponents";

type Props = {
  member: User & { _count: { badges: number } };
  badges: Badge[];
  isSuperAdmin?: boolean;
};

export function AdminMemberActions({ member, badges, isSuperAdmin = false }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"points" | "badge" | "avatar" | "delete">("points");
  const [pointAmount, setPointAmount] = useState("");
  const [pointReason, setPointReason] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");
  const [badgeNote, setBadgeNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const tabs = [
    { key: "points", label: "Poin" },
    { key: "badge",  label: "Lencana" },
    ...(isSuperAdmin ? [{ key: "avatar", label: "Avatar" }] : []),
    { key: "delete", label: "Hapus" },
  ] as const;

  async function submitPoints() {
    const amount = parseInt(pointAmount);
    if (!amount || !pointReason.trim()) return setMsg("Isi jumlah dan alasan.");
    setLoading(true);
    const res = await fetch(`/api/admin/members/${member.id}/points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, reason: pointReason }),
    });
    setLoading(false);
    if (res.ok) { setMsg("Poin berhasil diperbarui!"); setPointAmount(""); setPointReason(""); router.refresh(); }
    else { const d = await res.json(); setMsg(d.error ?? "Gagal."); }
  }

  async function submitBadge() {
    if (!selectedBadge) return setMsg("Pilih lencana.");
    setLoading(true);
    const res = await fetch(`/api/admin/members/${member.id}/badges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ badgeId: selectedBadge, note: badgeNote }),
    });
    setLoading(false);
    if (res.ok) { setMsg("Lencana diberikan!"); setSelectedBadge(""); router.refresh(); }
    else { const d = await res.json(); setMsg(d.error ?? "Gagal."); }
  }

  async function resetAvatarCooldown() {
    if (!confirm(`Reset cooldown avatar "${member.name}"?`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/members/${member.id}/reset-avatar-cooldown`, {
      method: "POST",
    });
    setLoading(false);
    if (res.ok) { setMsg("Cooldown avatar direset!"); router.refresh(); }
    else { setMsg("Gagal mereset cooldown."); }
  }

  async function deleteMember() {
    if (!confirm(`Hapus member "${member.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/members/${member.id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.refresh();
    else setMsg("Gagal menghapus.");
  }

  const isOk = msg.includes("berhasil") || msg.includes("diberikan") || msg.includes("direset");

  return (
    <>
      <button
        onClick={() => { setOpen(true); setMsg(""); setTab("points"); }}
        className="text-xs px-3 py-1.5 rounded-lg border border-tcb-red/40 text-tcb-red hover:bg-tcb-red/10 transition-all font-semibold"
      >
        Kelola
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-tcb-gray-800 border border-tcb-gray-700 rounded-2xl w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-black text-tcb-white">{member.name}</div>
                <div className="text-xs text-tcb-gray-400">@{member.username} · {member.totalPoints} pts</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-tcb-gray-400 hover:text-white text-lg leading-none">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-tcb-gray-900 rounded-lg p-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key as any); setMsg(""); }}
                  className={`flex-1 text-xs py-1.5 rounded-md font-semibold transition-all ${
                    tab === t.key ? "bg-tcb-red text-white" : "text-tcb-gray-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Message */}
            {msg && (
              <p className={`text-xs mb-3 ${isOk ? "text-green-400" : "text-red-400"}`}>{msg}</p>
            )}

            {/* Tab: Poin */}
            {tab === "points" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-tcb-gray-400 block mb-1">Jumlah (+ tambah / - kurangi)</label>
                  <input type="number" className="input text-sm" placeholder="contoh: 100 atau -50" value={pointAmount} onChange={(e) => setPointAmount(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-tcb-gray-400 block mb-1">Alasan</label>
                  <input type="text" className="input text-sm" placeholder="Juara turnamen, dst..." value={pointReason} onChange={(e) => setPointReason(e.target.value)} />
                </div>
                <button onClick={submitPoints} disabled={loading} className="btn-red w-full text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <><Spinner size={14} /> Menyimpan...</> : "Simpan Poin"}
                </button>
              </div>
            )}

            {/* Tab: Lencana */}
            {tab === "badge" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-tcb-gray-400 block mb-1">Pilih Lencana</label>
                  <select className="input text-sm" value={selectedBadge} onChange={(e) => setSelectedBadge(e.target.value)}>
                    <option value="">-- pilih --</option>
                    {badges.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-tcb-gray-400 block mb-1">Catatan (opsional)</label>
                  <input type="text" className="input text-sm" placeholder="Catatan pemberian lencana..." value={badgeNote} onChange={(e) => setBadgeNote(e.target.value)} />
                </div>
                <button onClick={submitBadge} disabled={loading} className="btn-red w-full text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <><Spinner size={14} /> Memberikan...</> : "Beri Lencana"}
                </button>
              </div>
            )}

            {/* Tab: Avatar (SUPERADMIN only) */}
            {tab === "avatar" && isSuperAdmin && (
              <div className="space-y-3">
                <div className="bg-tcb-gray-900 border border-tcb-gray-700 rounded-xl p-4 text-sm text-tcb-gray-200">
                  <p className="font-semibold text-tcb-white mb-1">Reset Cooldown Avatar</p>
                  <p className="text-xs text-tcb-gray-400">
                    Member ini {member.avatarLastUploadAt
                      ? `terakhir upload avatar pada ${new Date(member.avatarLastUploadAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.`
                      : "belum pernah upload avatar."}
                  </p>
                </div>
                <button
                  onClick={resetAvatarCooldown}
                  disabled={loading || !member.avatarLastUploadAt}
                  className="btn-red w-full text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? <><Spinner size={14} /> Mereset...</> : "Reset Cooldown Avatar"}
                </button>
                {!member.avatarLastUploadAt && (
                  <p className="text-xs text-tcb-gray-500 text-center">Tidak ada cooldown aktif</p>
                )}
              </div>
            )}

            {/* Tab: Hapus */}
            {tab === "delete" && (
              <div className="space-y-3">
                <p className="text-sm text-tcb-gray-200">
                  Hapus akun <span className="font-bold text-white">{member.name}</span> beserta semua data poin dan lencana?
                </p>
                <p className="text-xs text-red-400">Tindakan ini tidak dapat dibatalkan.</p>
                <button
                  onClick={deleteMember}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold w-full py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <><Spinner size={14} /> Menghapus...</> : "Ya, Hapus Member"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
