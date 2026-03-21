"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Badge } from "@prisma/client";

export function BadgeForm({ mode, badge }: { mode: "create" | "edit"; badge?: Badge }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name:        badge?.name        ?? "",
    description: badge?.description ?? "",
    imageUrl:    badge?.imageUrl    ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg("");
    const url    = mode === "create" ? "/api/admin/badges" : `/api/admin/badges/${badge!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setMsg(mode === "create" ? "Lencana dibuat!" : "Diperbarui!");
      if (mode === "create") setForm({ name: "", description: "", imageUrl: "" });
      router.refresh();
    } else {
      const d = await res.json();
      setMsg(d.error ?? "Gagal.");
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setMsg(""); }}
        className={mode === "create" ? "btn-red text-sm px-5 py-2" : "text-xs px-3 py-1.5 rounded-lg border border-tcb-gray-600 text-tcb-gray-200 hover:border-tcb-red hover:text-tcb-red transition-all font-semibold"}
      >
        {mode === "create" ? "+ Buat Lencana" : "Edit"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setOpen(false)}>
          <div className="bg-tcb-gray-800 border border-tcb-gray-700 rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-black text-tcb-white">{mode === "create" ? "Buat Lencana" : "Edit Lencana"}</h2>
              <button onClick={() => setOpen(false)} className="text-tcb-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              {msg && <p className={`text-xs ${msg.includes("!") ? "text-green-400" : "text-red-400"}`}>{msg}</p>}
              <div>
                <label className="text-xs text-tcb-gray-400 block mb-1">Nama Lencana *</label>
                <input className="input text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs text-tcb-gray-400 block mb-1">Deskripsi</label>
                <input className="input text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-tcb-gray-400 block mb-1">URL Gambar Lencana</label>
                <input className="input text-sm" placeholder="https://... atau /avatars/badge.png" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1 text-sm py-2.5">Batal</button>
                <button type="submit" disabled={loading} className="btn-red flex-1 text-sm py-2.5">
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function BadgeDeleteButton({ badgeId }: { badgeId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function remove() {
    if (!confirm("Hapus lencana ini? Lencana yang sudah diberikan ke member juga akan terhapus.")) return;
    setLoading(true);
    await fetch(`/api/admin/badges/${badgeId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={remove} disabled={loading} className="text-xs px-3 py-1.5 rounded-lg border border-red-700/40 text-red-400 hover:bg-red-900/20 transition-all font-semibold">
      {loading ? "..." : "Hapus"}
    </button>
  );
}
