"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Avatar } from "@prisma/client";

export function AvatarPicker({
  avatars,
  currentAvatarId,
  userId,
}: {
  avatars: Avatar[];
  currentAvatarId: string | null;
  userId: string;
}) {
  const [selected, setSelected] = useState(currentAvatarId);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState("");
  const router = useRouter();

  async function save() {
    if (selected === currentAvatarId) return;
    setSaving(true); setMsg("");
    const res = await fetch("/api/member/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarId: selected }),
    });
    setSaving(false);
    if (res.ok) { setMsg("Avatar diperbarui!"); router.refresh(); }
    else        { setMsg("Gagal menyimpan. Coba lagi."); }
  }

  return (
    <div>
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

      {msg && (
        <p className={`text-xs mb-2 ${msg.includes("diperbarui") ? "text-green-400" : "text-red-400"}`}>{msg}</p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving || selected === currentAvatarId}
        className="btn-red text-sm w-full py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? "Menyimpan..." : "Simpan Avatar"}
      </button>
    </div>
  );
}
