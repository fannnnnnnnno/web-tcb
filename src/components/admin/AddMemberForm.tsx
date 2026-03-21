"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddMemberForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg("");
    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg("Member berhasil ditambahkan!");
      setForm({ name: "", username: "", password: "" });
      router.refresh();
    } else {
      setMsg(data.error ?? "Gagal menambahkan.");
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-red text-sm px-5 py-2">
        + Tambah Member
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setOpen(false)}>
          <div className="bg-tcb-gray-800 border border-tcb-gray-700 rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-black text-tcb-white text-lg">Tambah Member</h2>
              <button onClick={() => setOpen(false)} className="text-tcb-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {msg && <p className={`text-xs ${msg.includes("berhasil") ? "text-green-400" : "text-red-400"}`}>{msg}</p>}
              <div>
                <label className="text-xs text-tcb-gray-400 block mb-1">Nama Lengkap</label>
                <input className="input text-sm" placeholder="Nama member" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs text-tcb-gray-400 block mb-1">Username</label>
                <input className="input text-sm" placeholder="username_unik" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs text-tcb-gray-400 block mb-1">Password</label>
                <input type="password" className="input text-sm" placeholder="Min. 6 karakter" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <button type="submit" disabled={loading} className="btn-red w-full py-2.5 text-sm">
                {loading ? "Menyimpan..." : "Tambah Member"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
