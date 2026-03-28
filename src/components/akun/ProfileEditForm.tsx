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

  // Tampilkan/sembunyikan password
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  async function handleSave() {
    setMsg(null);

    // Validasi client-side
    if (name.trim().length < 2) {
      setMsg({ text: "Nama minimal 2 karakter", ok: false });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setMsg({ text: "Password baru minimal 6 karakter", ok: false });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMsg({ text: "Konfirmasi password tidak cocok", ok: false });
        return;
      }
      if (!currentPassword) {
        setMsg({ text: "Password lama wajib diisi untuk ganti password", ok: false });
        return;
      }
    }

    const payload: Record<string, string> = {};
    if (name.trim() !== currentName) payload.name = name.trim();
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    if (Object.keys(payload).length === 0) {
      setMsg({ text: "Tidak ada perubahan", ok: false });
      return;
    }

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
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    } else {
      setMsg({ text: data.error || "Gagal menyimpan. Coba lagi.", ok: false });
    }
  }

  return (
    <div className="card">
      <h2 className="font-black text-tcb-white text-base sm:text-lg mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-tcb-red rounded-full" />
        Edit Profil
      </h2>

      <div className="space-y-4">
        {/* Nama */}
        <div>
          <label className="block text-sm font-semibold text-tcb-gray-200 mb-1.5">
            Nama Tampilan
          </label>
          <input
            type="text"
            className="input text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            placeholder="Nama tampilan"
          />
        </div>

        <div className="h-px bg-tcb-gray-700" />

        <p className="text-xs text-tcb-gray-400 font-semibold uppercase tracking-wider">Ganti Password</p>

        {/* Password Lama */}
        <div>
          <label className="block text-sm font-semibold text-tcb-gray-200 mb-1.5">
            Password Lama
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              className="input text-sm pr-10"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password lama"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-tcb-gray-400 hover:text-white"
            >
              {showCurrent ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Password Baru */}
        <div>
          <label className="block text-sm font-semibold text-tcb-gray-200 mb-1.5">
            Password Baru
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              className="input text-sm pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-tcb-gray-400 hover:text-white"
            >
              {showNew ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Konfirmasi Password */}
        <div>
          <label className="block text-sm font-semibold text-tcb-gray-200 mb-1.5">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            className={`input text-sm ${
              confirmPassword && confirmPassword !== newPassword
                ? "border-red-500"
                : ""
            }`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password baru"
            autoComplete="new-password"
          />
          {confirmPassword && confirmPassword !== newPassword && (
            <p className="text-xs text-red-400 mt-1">Password tidak cocok</p>
          )}
        </div>

        {/* Message */}
        {msg && (
          <p className={`text-xs ${msg.ok ? "text-green-400" : "text-red-400"}`}>
            {msg.text}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-red text-sm w-full py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
