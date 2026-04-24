"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileEditForm({ currentName }: { currentName: string }) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  async function handleSave() {
    setMsg(null);
    if (name.trim().length < 2) { setMsg({ text: "Nama minimal 2 karakter", ok: false }); return; }
    if (newPassword) {
      if (newPassword.length < 6) { setMsg({ text: "Password baru minimal 6 karakter", ok: false }); return; }
      if (newPassword !== confirmPassword) { setMsg({ text: "Konfirmasi password tidak cocok", ok: false }); return; }
      if (!currentPassword) { setMsg({ text: "Password lama wajib diisi untuk ganti password", ok: false }); return; }
    }
    const payload: Record<string, string> = {};
    if (name.trim() !== currentName) payload.name = name.trim();
    if (newPassword) { payload.currentPassword = currentPassword; payload.newPassword = newPassword; }
    if (Object.keys(payload).length === 0) { setMsg({ text: "Tidak ada perubahan", ok: false }); return; }
    setSaving(true);
    const res = await fetch("/api/member/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMsg({ text: "Profil berhasil diperbarui!", ok: true });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      router.refresh();
    } else {
      setMsg({ text: data.error || "Gagal menyimpan. Coba lagi.", ok: false });
    }
  }

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  return (
    <div className="card">
      <h2 className="font-black text-base sm:text-lg mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
        <span className="w-1 h-5 bg-tcb-red rounded-full" />
        Edit Profil
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
            Nama Tampilan
          </label>
          <input type="text" className="input text-sm" value={name}
            onChange={(e) => setName(e.target.value)} maxLength={50} placeholder="Nama tampilan" />
        </div>

        <div className="h-px" style={{ backgroundColor: "var(--border)" }} />

        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
          Ganti Password
        </p>

        {[
          { label: "Password Lama", val: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(!showCurrent), auto: "current-password" },
          { label: "Password Baru", val: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(!showNew), auto: "new-password", placeholder: "Minimal 6 karakter" },
        ].map((f) => (
          <div key={f.label}>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>{f.label}</label>
            <div className="relative">
              <input type={f.show ? "text" : "password"} className="input text-sm pr-10"
                value={f.val} onChange={(e) => f.set(e.target.value)}
                placeholder={f.placeholder || `Masukkan ${f.label.toLowerCase()}`} autoComplete={f.auto} />
              <button type="button" onClick={f.toggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "var(--text-faint)" }}>
                <EyeIcon open={f.show} />
              </button>
            </div>
          </div>
        ))}

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
            Konfirmasi Password Baru
          </label>
          <input type="password"
            className={`input text-sm ${confirmPassword && confirmPassword !== newPassword ? "border-red-500" : ""}`}
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password baru" autoComplete="new-password" />
          {confirmPassword && confirmPassword !== newPassword && (
            <p className="text-xs text-red-400 mt-1">Password tidak cocok</p>
          )}
        </div>

        {msg && (
          <p className={`text-xs ${msg.ok ? "text-green-500" : "text-red-400"}`}>{msg.text}</p>
        )}

        <button type="button" onClick={handleSave} disabled={saving}
          className="btn-red text-sm w-full py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
