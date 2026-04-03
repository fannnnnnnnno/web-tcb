"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/LoadingComponents";

type Member = { id: string; name: string; username: string; totalPoints: number };
type Game   = { id: string; name: string; slug: string };

type PointEntry = {
  [memberId: string]: {
    [gameId: string]: string; // nilai string agar bisa kosong
  };
};

export function BulkPointsForm({ members, games }: { members: Member[]; games: Game[] }) {
  const router  = useRouter();
  const [reason, setReason]   = useState("");
  const [entries, setEntries] = useState<PointEntry>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ name: string; status: "ok" | "skip" | "error" }[]>([]);
  const [done, setDone]       = useState(false);

  const QUICK_REASONS = [
    "Juara 1 turnamen", "Juara 2 turnamen", "Juara 3 turnamen",
    "Aktif gathering", "Penyesuaian poin",
  ];

  function setEntry(memberId: string, gameId: string, value: string) {
    setEntries((prev) => ({
      ...prev,
      [memberId]: { ...(prev[memberId] ?? {}), [gameId]: value },
    }));
  }

  function fillAllGame(gameId: string, value: string) {
    setEntries((prev) => {
      const next = { ...prev };
      for (const m of members) {
        next[m.id] = { ...(next[m.id] ?? {}), [gameId]: value };
      }
      return next;
    });
  }

  function clearAll() {
    setEntries({});
    setResults([]);
    setDone(false);
  }

  // Hitung berapa entry yang terisi
  const filledCount = members.filter((m) =>
    games.some((g) => {
      const v = entries[m.id]?.[g.id];
      return v !== undefined && v !== "" && !isNaN(parseInt(v));
    })
  ).length;

  async function handleSubmit() {
    if (!reason.trim()) return alert("Isi alasan dulu!");
    if (filledCount === 0) return alert("Belum ada poin yang diisi.");

    setLoading(true);
    setDone(false);
    const res: typeof results = [];

    for (const member of members) {
      let hasEntry = false;
      let hasError = false;

      for (const game of games) {
        const raw = entries[member.id]?.[game.id];
        if (raw === undefined || raw === "") continue;
        const amount = parseInt(raw);
        if (isNaN(amount)) continue;

        hasEntry = true;
        const r = await fetch(`/api/admin/members/${member.id}/game-points`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, reason, gameId: game.id }),
        });
        if (!r.ok) hasError = true;
      }

      if (!hasEntry) res.push({ name: member.name, status: "skip" });
      else if (hasError) res.push({ name: member.name, status: "error" });
      else res.push({ name: member.name, status: "ok" });
    }

    setResults(res);
    setLoading(false);
    setDone(true);
    router.refresh();
  }

  const okCount    = results.filter((r) => r.status === "ok").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-6">

      {/* Alasan */}
      <div className="card">
        <h2 className="font-black text-tcb-white text-sm mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-tcb-red rounded-full" /> Alasan Pemberian Poin
        </h2>
        <div className="flex gap-1.5 flex-wrap mb-2">
          {QUICK_REASONS.map((r) => (
            <button key={r} onClick={() => setReason(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                reason === r
                  ? "bg-tcb-red border-tcb-red text-white"
                  : "border-tcb-gray-600 text-tcb-gray-400 hover:text-white hover:border-tcb-gray-400"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <input type="text" className="input text-sm" placeholder="atau ketik alasan sendiri..."
          value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} />
      </div>

      {/* Tabel input massal */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tcb-gray-700">
                <th className="px-4 py-3 text-left text-xs text-tcb-gray-400 font-semibold sticky left-0 bg-tcb-gray-800 z-10 min-w-[160px]">
                  Member
                </th>
                {games.map((g) => (
                  <th key={g.id} className="px-3 py-3 text-center text-xs text-tcb-gray-400 font-semibold min-w-[130px]">
                    <div>{g.name}</div>
                    {/* Isi semua baris game ini */}
                    <div className="flex gap-1 justify-center mt-1">
                      {[10, 25, 50, 100].map((v) => (
                        <button key={v} onClick={() => fillAllGame(g.id, String(v))}
                          className="px-1.5 py-0.5 rounded text-[10px] border border-tcb-gray-600 text-tcb-gray-500 hover:text-green-400 hover:border-green-700 transition-all">
                          +{v}
                        </button>
                      ))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-tcb-gray-700/50 hover:bg-tcb-gray-700/10 transition-colors">
                  <td className="px-4 py-2.5 sticky left-0 bg-tcb-gray-800 z-10">
                    <div className="font-semibold text-tcb-white text-xs">{m.name}</div>
                    <div className="text-[10px] text-tcb-gray-500">@{m.username}</div>
                  </td>
                  {games.map((g) => (
                    <td key={g.id} className="px-3 py-2.5 text-center">
                      <input
                        type="number"
                        className="w-24 bg-tcb-gray-900 border border-tcb-gray-700 rounded-lg px-2 py-1.5 text-sm text-center text-tcb-white focus:border-tcb-red focus:outline-none transition-colors"
                        placeholder="—"
                        value={entries[m.id]?.[g.id] ?? ""}
                        onChange={(e) => setEntry(m.id, g.id, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-xs text-tcb-gray-400">
          {filledCount > 0
            ? <span className="text-tcb-white font-semibold">{filledCount} member</span>
            : "Belum ada"} yang akan diupdate
        </div>
        <div className="flex gap-2">
          <button onClick={clearAll} className="btn-outline text-sm px-4 py-2">Reset</button>
          <button
            onClick={handleSubmit}
            disabled={loading || filledCount === 0 || !reason.trim()}
            className="btn-red text-sm px-6 py-2 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <><Spinner size={14} /> Menyimpan...</> : `Simpan ${filledCount > 0 ? `(${filledCount})` : ""}`}
          </button>
        </div>
      </div>

      {/* Hasil */}
      {done && (
        <div className="card space-y-2">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-green-400 font-bold text-sm">✓ {okCount} berhasil</span>
            {errorCount > 0 && <span className="text-red-400 font-bold text-sm">✗ {errorCount} gagal</span>}
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {results.filter((r) => r.status !== "skip").map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={r.status === "ok" ? "text-green-400" : "text-red-400"}>
                  {r.status === "ok" ? "✓" : "✗"}
                </span>
                <span className="text-tcb-gray-200">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
