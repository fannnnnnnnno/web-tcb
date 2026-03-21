"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Badge, User } from "@prisma/client";

type Props = {
  member: User & { _count: { badges: number } };
  badges: Badge[];
};

export function AdminMemberActions({ member, badges }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"points" | "badge" | "delete">("points");
  const [pointAmount, setPointAmount] = useState("");
  const [pointReason, setPointReason] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");
  const [badgeNote, setBadgeNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

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

  async function deleteMember() {
    if (!confirm(`Hapus member "${member.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/members/${member.id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.refresh();
    else setMsg("Gagal menghapus.");
  }

  return (
    <>
      <button onClick={() => { setOpen(true); setMsg(""); }} className="text-xs px-3 py-1.5 rounded-lg border border-tcb-red/40 text-tcb-red hover:bg-tcb-red/10 transition-all font-semibold">
        Kelola
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setOpen(false)}>
          <div className="bg-tcb-gray-800 border border-tcb-gray-700 rounded-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-black text-tcb-white">{member.name}</div>
                <div className="text-xs text-tcb-gray-400">@{member.username} · {member.totalPoints} pts</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-tcb-gray-400 hover:text-white">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-tcb-gray-900 rounded-lg p-1">
              {(["points", "badge", "delete"] as const).map((t) => (
                <button key={t} onClick={() => { setTab(t); setMsg(""); }}
                  className={`flex-1 text-xs py-1.5 rounded-md font-semibold transition-all ${tab === t ? "bg-tcb-red text-white" : "text-tcb-gray-400 hover:text-white"}`}>
                  {t === "points" ? "Poin" : t === "badge" ? "Lencana" : "Hapus"}
                </button>
              ))}
            </div>

            {msg && <p className={`text-xs mb-3 ${msg.includes("berhasil") || msg.includes("diberikan") ? "text-green-400" : "text-red-400"}`}>{msg}</p>}

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
                <button onClick={submitPoints} disabled={loading} className="btn-red w-full text-sm py-2.5">
                  {loading ? "Menyimpan..." : "Simpan Poin"}
                </button>
              </div>
            )}

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
                <button onClick={submitBadge} disabled={loading} className="btn-red w-full text-sm py-2.5">
                  {loading ? "Memberikan..." : "Beri Lencana"}
                </button>
              </div>
            )}

            {tab === "delete" && (
              <div className="space-y-3">
                <p className="text-sm text-tcb-gray-200">Hapus akun <span className="font-bold text-white">{member.name}</span> beserta semua data poin dan lencana?</p>
                <p className="text-xs text-red-400">Tindakan ini tidak dapat dibatalkan.</p>
                <button onClick={deleteMember} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-bold w-full py-2.5 rounded-lg text-sm transition-all">
                  {loading ? "Menghapus..." : "Ya, Hapus Member"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
