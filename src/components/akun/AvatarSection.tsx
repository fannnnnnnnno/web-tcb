"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Avatar } from "@prisma/client";

function CooldownBadge({ sisaHari }: { sisaHari: number }) {
  return (
    <div className="flex items-center gap-2 bg-tcb-gray-900 border border-tcb-gray-700 rounded-xl px-3 py-2 text-xs text-tcb-gray-400">
      <svg className="w-4 h-4 text-tcb-red flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Upload avatar tersedia lagi dalam <span className="font-bold text-tcb-white">{sisaHari} hari</span>
    </div>
  );
}

export function AvatarSection({
  avatars,
  currentAvatarId,
  avatarLastUploadAt,
}: {
  avatars: Avatar[];
  currentAvatarId: string | null;
  avatarLastUploadAt: Date | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<"upload" | "preset">("upload");
  const [selected, setSelected] = useState(currentAvatarId);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Hitung sisa cooldown
  const sisaHari = (() => {
    if (!avatarLastUploadAt) return 0;
    const next = new Date(avatarLastUploadAt);
    next.setDate(next.getDate() + 30);
    const diff = next.getTime() - Date.now();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  })();

  const canUpload = sisaHari === 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(f.type)) {
      setMsg({ text: "Format file harus JPG atau PNG", ok: false });
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setMsg({ text: "Ukuran file maksimal 2MB", ok: false });
      return;
    }

    setFile(f);
    setMsg(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setMsg(null);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/member/avatar", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      setMsg({ text: "Avatar berhasil diupload!", ok: true });
      setFile(null);
      setPreview(null);
      router.refresh();
    } else {
      setMsg({ text: data.error || "Gagal upload. Coba lagi.", ok: false });
    }
  }

  async function handleSavePreset() {
    if (selected === currentAvatarId) return;
    setSaving(true);
    setMsg(null);

    const res = await fetch("/api/member/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarId: selected }),
    });

    setSaving(false);
    if (res.ok) {
      setMsg({ text: "Avatar diperbarui!", ok: true });
      router.refresh();
    } else {
      setMsg({ text: "Gagal menyimpan. Coba lagi.", ok: false });
    }
  }

  return (
    <div className="card">
      <h2 className="font-black text-tcb-white text-base sm:text-lg mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-tcb-red rounded-full" />
        Ganti Avatar
      </h2>

      {/* Tab */}
      <div className="flex gap-1 mb-4 bg-tcb-gray-900 rounded-xl p-1">
        {(["upload", "preset"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setMsg(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t
                ? "bg-tcb-red text-white"
                : "text-tcb-gray-400 hover:text-white"
            }`}
          >
            {t === "upload" ? "Upload Foto" : "Pilih Preset"}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {tab === "upload" && (
        <div className="space-y-3">
          {!canUpload ? (
            <CooldownBadge sisaHari={sisaHari} />
          ) : (
            <>
              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-tcb-gray-600 hover:border-tcb-red rounded-xl p-6 text-center cursor-pointer transition-colors group"
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-tcb-red" />
                ) : (
                  <>
                    <svg className="w-8 h-8 text-tcb-gray-500 group-hover:text-tcb-red mx-auto mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-tcb-gray-400 group-hover:text-white transition-colors">Klik untuk pilih foto</p>
                    <p className="text-xs text-tcb-gray-600 mt-1">JPG, PNG · Maks 2MB</p>
                  </>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                className="hidden"
                onChange={handleFileChange}
              />

              {file && (
                <p className="text-xs text-tcb-gray-400 truncate">📎 {file.name}</p>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="btn-red text-sm w-full py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {uploading ? "Mengupload..." : "Upload Avatar"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Preset Tab */}
      {tab === "preset" && (
        <div>
          {avatars.length === 0 ? (
            <p className="text-tcb-gray-400 text-sm">Belum ada avatar preset. Hubungi admin.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                {avatars.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelected(av.filename)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                      selected === av.filename
                        ? "border-tcb-red shadow-[0_0_10px_rgba(224,30,43,0.35)]"
                        : "border-tcb-gray-600 hover:border-tcb-gray-400"
                    }`}
                  >
                    <img src={`/avatars/${av.filename}`} alt={av.filename} className="w-full h-full object-cover" />
                    {selected === av.filename && (
                      <div className="absolute inset-0 bg-tcb-red/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSavePreset}
                disabled={saving || selected === currentAvatarId}
                className="btn-red text-sm w-full py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Menyimpan..." : "Simpan Avatar"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Message */}
      {msg && (
        <p className={`text-xs mt-3 ${msg.ok ? "text-green-400" : "text-red-400"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
