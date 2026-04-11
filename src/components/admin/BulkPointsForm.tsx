"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/LoadingComponents";

type Member = { id: string; name: string; username: string; totalPoints: number };
type Game   = { id: string; name: string; slug: string };
type PointEntry = { [memberId: string]: { [gameId: string]: string } };

// Opsi dropdown sesuai sistem poin
const POINT_OPTIONS = [
  { label: "—",          value: ""  },
  { label: "Pos 1 (+5)", value: "5" },
  { label: "Pos 2 (+4)", value: "4" },
  { label: "Pos 3 (+4)", value: "4" },
  { label: "Pos 4 (+3)", value: "3" },
  { label: "Pos 5 (+3)", value: "3" },
  { label: "Pos 6 (+2)", value: "2" },
  { label: "Pos 7+ (+1)",value: "1" },
  { label: "Hadir (+1)", value: "1" },
  { label: "Kustom...",  value: "custom" },
];

const QUICK_REASONS = [
  "Juara 1 turnamen", "Juara 2 turnamen", "Juara 3 turnamen",
  "Aktif gathering", "Hadir gathering", "Penyesuaian poin",
];

// State per cell: value string (angka) atau "custom" mode
type CellState = { mode: "preset" | "custom"; value: string };
type CellMap = { [memberId: string]: { [gameId: string]: CellState } };

function ResetAllModal({ onClose, onConfirm, loading }: {
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const [step, setStep]   = useState<1 | 2>(1);
  const [input, setInput] = useState("");
  const step1Valid = input.trim().toUpperCase() === "RESET";
  const step2Valid = input.trim().toUpperCase() === "YAKIN";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.9)" }} onClick={onClose}>
      <div className="bg-tcb-gray-800 border border-red-700 rounded-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-black text-white text-lg">Reset Semua Poin</h3>
          <p className="text-tcb-gray-400 text-xs mt-1">Semua poin & riwayat member akan dihapus. Tidak dapat dibatalkan.</p>
        </div>
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-xs text-tcb-gray-300 text-center">Ketik <span className="font-black text-red-400">RESET</span> untuk melanjutkan</p>
            <input className="input text-sm text-center font-mono tracking-widest" placeholder="RESET"
              value={input} onChange={(e) => setInput(e.target.value.toUpperCase())} />
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-ghost flex-1 text-sm py-2.5">Batal</button>
              <button onClick={() => { setStep(2); setInput(""); }} disabled={!step1Valid}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg text-sm transition-all">
                Lanjut
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs text-red-400 text-center font-semibold">KONFIRMASI TERAKHIR</p>
            <p className="text-xs text-tcb-gray-300 text-center">Ketik <span className="font-black text-red-400">YAKIN</span> untuk mereset</p>
            <input className="input text-sm text-center font-mono tracking-widest border-red-700" placeholder="YAKIN"
              value={input} onChange={(e) => setInput(e.target.value.toUpperCase())} />
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-ghost flex-1 text-sm py-2.5">Batal</button>
              <button onClick={onConfirm} disabled={!step2Valid || loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                {loading ? <><Spinner size={14} /> Mereset...</> : "Ya, Reset Semua"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BulkPointsForm({
  members,
  games,
  isSuperAdmin = false,
}: {
  members: Member[];
  games: Game[];
  isSuperAdmin?: boolean;
}) {
  const router = useRouter();
  const [reason, setReason]       = useState("");
  const [cells, setCells]         = useState<CellMap>({});
  const [loading, setLoading]     = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [results, setResults]     = useState<{ name: string; status: "ok" | "skip" | "error" }[]>([]);
  const [done, setDone]           = useState(false);

  function getCell(memberId: string, gameId: string): CellState {
    return cells[memberId]?.[gameId] ?? { mode: "preset", value: "" };
  }

  function setCell(memberId: string, gameId: string, update: Partial<CellState>) {
    setCells((prev) => ({
      ...prev,
      [memberId]: {
        ...(prev[memberId] ?? {}),
        [gameId]: { ...getCell(memberId, gameId), ...update },
      },
    }));
  }

  function handleDropdownChange(memberId: string, gameId: string, val: string) {
    if (val === "custom") {
      setCell(memberId, gameId, { mode: "custom", value: "" });
    } else {
      setCell(memberId, gameId, { mode: "preset", value: val });
    }
  }

  function fillAllGame(gameId: string, value: string) {
    setCells((prev) => {
      const next = { ...prev };
      for (const m of members) {
        next[m.id] = {
          ...(next[m.id] ?? {}),
          [gameId]: { mode: "preset", value },
        };
      }
      return next;
    });
  }

  function clearAll() {
    setCells({});
    setResults([]);
    setDone(false);
  }

  // Ambil nilai akhir per cell
  function getCellValue(memberId: string, gameId: string): string {
    const cell = getCell(memberId, gameId);
    return cell.value;
  }

  const filledCount = members.filter((m) =>
    games.some((g) => {
      const v = getCellValue(m.id, g.id);
      return v !== "" && !isNaN(parseInt(v));
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
        const raw = getCellValue(member.id, game.id);
        if (raw === "" || isNaN(parseInt(raw))) continue;
        const amount = parseInt(raw);
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
    clearAll();
    router.refresh();
  }

  async function handleResetAll() {
    setResetting(true);
    const res = await fetch("/api/admin/reset-all-points", { method: "POST" });
    setResetting(false);
    setShowReset(false);
    if (res.ok) { alert("Semua poin berhasil direset!"); router.refresh(); }
    else alert("Gagal mereset poin. Coba lagi.");
  }

  const okCount    = results.filter((r) => r.status === "ok").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-6">

      {/* Reset All */}
      {isSuperAdmin && (
        <div className="flex items-center justify-between bg-red-900/10 border border-red-800/40 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-bold text-red-400">Reset Semua Poin</p>
            <p className="text-xs text-tcb-gray-500">Nolkan semua poin & riwayat member</p>
          </div>
          <button onClick={() => setShowReset(true)}
            className="text-xs px-3 py-1.5 rounded-lg border border-red-700 text-red-400 hover:bg-red-900/20 transition-all font-semibold">
            Reset Semua
          </button>
        </div>
      )}

      {/* Alasan */}
      <div className="card">
        <h2 className="font-black text-tcb-white text-sm mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-tcb-red rounded-full" /> Alasan Pemberian Poin
        </h2>
        <div className="flex gap-1.5 flex-wrap mb-2">
          {QUICK_REASONS.map((r) => (
            <button key={r} onClick={() => setReason(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                reason === r ? "bg-tcb-red border-tcb-red text-white" : "border-tcb-gray-600 text-tcb-gray-400 hover:text-white hover:border-tcb-gray-400"
              }`}>
              {r}
            </button>
          ))}
        </div>
        <input type="text" className="input text-sm" placeholder="atau ketik alasan sendiri..."
          value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} />
      </div>

      {/* Tabel */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tcb-gray-700">
                <th className="px-4 py-3 text-left text-xs text-tcb-gray-400 font-semibold sticky left-0 bg-tcb-gray-800 z-10 min-w-[160px]">
                  Member
                </th>
                {games.map((g) => (
                  <th key={g.id} className="px-3 py-3 text-center text-xs text-tcb-gray-400 font-semibold min-w-[180px]">
                    <div>{g.name}</div>
                    {/* Isi semua member dengan nilai sama */}
                    <div className="flex gap-1 justify-center mt-1 flex-wrap">
                      {["1","2","3","4","5"].map((v) => (
                        <button key={v} onClick={() => fillAllGame(g.id, v)}
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
                  {games.map((g) => {
                    const cell = getCell(m.id, g.id);
                    return (
                      <td key={g.id} className="px-3 py-2 text-center">
                        {cell.mode === "preset" ? (
                          <select
                            className="w-full bg-tcb-gray-900 border border-tcb-gray-700 rounded-lg px-2 py-1.5 text-xs text-tcb-white focus:border-tcb-red focus:outline-none transition-colors"
                            value={cell.value === "" ? "" : cell.value}
                            onChange={(e) => handleDropdownChange(m.id, g.id, e.target.value)}
                          >
                            {POINT_OPTIONS.map((opt) => (
                              <option key={opt.label} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex gap-1 items-center">
                            <input
                              type="number"
                              autoFocus
                              className="flex-1 bg-tcb-gray-900 border border-tcb-red rounded-lg px-2 py-1.5 text-xs text-center text-tcb-white focus:outline-none"
                              placeholder="0"
                              value={cell.value}
                              onChange={(e) => setCell(m.id, g.id, { value: e.target.value })}
                            />
                            <button
                              onClick={() => setCell(m.id, g.id, { mode: "preset", value: "" })}
                              className="text-tcb-gray-500 hover:text-white text-xs px-1"
                              title="Kembali ke dropdown"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </td>
                    );
                  })}
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
          <button onClick={clearAll} className="btn-outline text-sm px-4 py-2">Reset Form</button>
          <button onClick={handleSubmit}
            disabled={loading || filledCount === 0 || !reason.trim()}
            className="btn-red text-sm px-6 py-2 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? <><Spinner size={14} /> Menyimpan...</> : `Simpan${filledCount > 0 ? ` (${filledCount})` : ""}`}
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

      {showReset && (
        <ResetAllModal onClose={() => setShowReset(false)} onConfirm={handleResetAll} loading={resetting} />
      )}
    </div>
  );
}
