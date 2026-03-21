"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function AvatarUploader() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/png","image/jpeg","image/webp"].includes(f.type)) {
      setMsg("Format harus PNG, JPG, atau WebP"); return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setMsg("Ukuran file maksimal 2MB"); return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMsg("");
  }

  async function upload() {
    if (!file) return;
    setLoading(true); setMsg("");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/avatars", { method: "POST", body: formData });
    setLoading(false);
    const data = await res.json();
    if (res.ok) {
      setMsg("Avatar berhasil diupload!");
      setFile(null); setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } else {
      setMsg(data.error ?? "Gagal upload.");
    }
  }

  return (
    <>
      <button onClick={() => { setOpen(true); setMsg(""); }} className="btn-red text-sm px-5 py-2">
        + Upload Avatar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setOpen(false)}>
          <div className="bg-tcb-gray-800 border border-tcb-gray-700 rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-black text-tcb-white">Upload Avatar</h2>
              <button onClick={() => setOpen(false)} className="text-tcb-gray-400 hover:text-white">✕</button>
            </div>

            <div
              className="border-2 border-dashed border-tcb-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-tcb-red transition-colors mb-4"
              onClick={() => inputRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-24 h-24 rounded-xl object-cover mx-auto" />
              ) : (
                <div>
                  <svg className="w-10 h-10 text-tcb-gray-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-tcb-gray-400">Klik untuk pilih gambar</p>
                  <p className="text-xs text-tcb-gray-500 mt-1">PNG, JPG, WebP · Maks 2MB</p>
                </div>
              )}
            </div>

            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onFileChange} />

            {msg && <p className={`text-xs mb-3 ${msg.includes("berhasil") ? "text-green-400" : "text-red-400"}`}>{msg}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1 text-sm py-2.5">Batal</button>
              <button onClick={upload} disabled={!file || loading} className="btn-red flex-1 text-sm py-2.5 disabled:opacity-50">
                {loading ? "Mengupload..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AvatarDeleteButton({ avatarId, filename }: { avatarId: string; filename: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function remove() {
    if (!confirm(`Hapus avatar "${filename}"?`)) return;
    setLoading(true);
    await fetch(`/api/admin/avatars/${avatarId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={remove} disabled={loading} className="text-xs px-2 py-1 rounded border border-red-700/40 text-red-400 hover:bg-red-900/20 transition-all">
      {loading ? "..." : "Hapus"}
    </button>
  );
}
