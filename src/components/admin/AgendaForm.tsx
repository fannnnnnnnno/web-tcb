"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Agenda } from "@prisma/client";

type Props = { mode: "create" | "edit"; agenda?: Agenda };

function splitDateTime(iso: string | null | undefined) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: "", time: "" };
  return {
    date: d.toLocaleDateString("en-CA"),
    time: d.toTimeString().slice(0, 5),
  };
}

function combineDateTime(date: string, time: string): string | null {
  if (!date) return null;
  return new Date(`${date}T${time || "00:00"}:00`).toISOString();
}

function extractEmbedSrc(embedCode: string): string | null {
  const match = embedCode.match(/src="([^"]+)"/);
  return match ? match[1] : null;
}

const EMPTY = {
  title: "", description: "",
  startDate: "", startTime: "",
  endDate: "", endTime: "",
  location: "", locationType: "OFFLINE",
  mapsEmbed: "",
};

function DateTimeInput({ label, required = false, dateVal, timeVal, onDateChange, onTimeChange }: {
  label: string; required?: boolean;
  dateVal: string; timeVal: string;
  onDateChange: (v: string) => void;
  onTimeChange: (v: string) => void;
}) {
  const hours   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];
  const [hh, mm] = timeVal ? timeVal.split(":") : ["", ""];

  const preview = dateVal
    ? new Date(`${dateVal}T${timeVal || "00:00"}:00`).toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      }) + (timeVal ? ` · ${timeVal} WIB` : "")
    : null;

  return (
    <div>
      <label className="text-xs font-semibold text-tcb-gray-400 block mb-1.5">
        {label}{required && <span className="text-tcb-red ml-0.5">*</span>}
      </label>
      <div className="flex gap-2">
        <input type="date" className="input text-sm flex-1" value={dateVal}
          onChange={(e) => onDateChange(e.target.value)} required={required}
          style={{ colorScheme: "dark" }} />
        <select className="input text-sm w-20" value={hh || ""}
          onChange={(e) => onTimeChange(`${e.target.value}:${mm || "00"}`)}>
          <option value="">Jam</option>
          {hours.map((h) => <option key={h} value={h}>{h}:00</option>)}
        </select>
        <select className="input text-sm w-20" value={mm || ""}
          onChange={(e) => onTimeChange(`${hh || "00"}:${e.target.value}`)}>
          <option value="">Menit</option>
          {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      {preview && <p className="text-xs text-tcb-red mt-1 font-medium">{preview}</p>}
    </div>
  );
}

export function AgendaForm({ mode, agenda }: Props) {
  const s = splitDateTime(agenda?.date?.toString());
  const e = splitDateTime(agenda?.endDate?.toString());

  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState("");
  const [embedMsg, setEmbedMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [embedSrc, setEmbedSrc] = useState<string | null>((agenda as any)?.mapsEmbed ?? null);

  const [form, setForm] = useState(
    agenda ? {
      title:        agenda.title,
      description:  agenda.description ?? "",
      startDate:    s.date, startTime: s.time,
      endDate:      e.date, endTime:   e.time,
      location:     agenda.location ?? "",
      locationType: agenda.locationType,
      mapsEmbed:    (agenda as any).mapsEmbed ?? "",
    } : EMPTY
  );

  const router = useRouter();
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function handleEmbedChange(value: string) {
    set("mapsEmbed", value);
    setEmbedMsg(null);

    if (!value.trim()) {
      setEmbedSrc(null);
      return;
    }

    if (value.includes("<iframe")) {
      const src = extractEmbedSrc(value);
      if (src) {
        setEmbedSrc(src);
        setEmbedMsg({ text: "✓ Embed map berhasil dibaca.", ok: true });
      } else {
        setEmbedSrc(null);
        setEmbedMsg({ text: "Format tidak dikenali. Pastikan paste langsung dari Google Maps → Share → Embed a map.", ok: false });
      }
      return;
    }

    if (value.includes("google.com/maps/embed") || value.includes("maps.google.com/maps")) {
      setEmbedSrc(value);
      setEmbedMsg({ text: "✓ URL embed ditemukan.", ok: true });
      return;
    }

    setEmbedSrc(null);
    setEmbedMsg({ text: "Paste embed code dari Google Maps (Share → Embed a map → Copy HTML).", ok: false });
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setLoading(true); setMsg("");

    const res = await fetch(
      mode === "create" ? "/api/admin/agendas" : `/api/admin/agendas/${agenda!.id}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:        form.title,
          description:  form.description || null,
          date:         combineDateTime(form.startDate, form.startTime),
          endDate:      combineDateTime(form.endDate, form.endTime),
          location:     form.location || null,
          locationType: form.locationType,
          mapsEmbed:    embedSrc ?? null,
          mapsUrl:      null,
          lat:          null,
          lng:          null,
        }),
      }
    );

    setLoading(false);
    const data = await res.json();
    if (res.ok) {
      setMsg(mode === "create" ? "Agenda berhasil dibuat!" : "Agenda berhasil diperbarui!");
      if (mode === "create") { setForm(EMPTY); setEmbedSrc(null); setEmbedMsg(null); }
      router.refresh();
    } else {
      setMsg(data.error ?? "Gagal menyimpan.");
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setMsg(""); setEmbedMsg(null); }}
        className={mode === "create"
          ? "btn-red text-sm px-5 py-2"
          : "text-xs px-3 py-1.5 rounded-lg border border-tcb-gray-600 text-tcb-gray-200 hover:border-tcb-red hover:text-tcb-red transition-all font-semibold"}
      >
        {mode === "create" ? "+ Tambah Agenda" : "Edit"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setOpen(false)}>
          <div className="bg-tcb-gray-800 border border-tcb-gray-700 rounded-2xl w-full max-w-lg my-6"
            onClick={(ev) => ev.stopPropagation()}>

            <div className="flex justify-between items-center p-5 border-b border-tcb-gray-700">
              <h2 className="font-black text-tcb-white text-lg">
                {mode === "create" ? "Tambah Agenda" : "Edit Agenda"}
              </h2>
              <button onClick={() => setOpen(false)} className="text-tcb-gray-400 hover:text-white text-xl">✕</button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-5">
              {msg && (
                <p className={`text-xs px-3 py-2 rounded-lg ${
                  msg.includes("berhasil") ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400"
                }`}>{msg}</p>
              )}

              <div>
                <label className="text-xs font-semibold text-tcb-gray-400 block mb-1.5">
                  Judul<span className="text-tcb-red ml-0.5">*</span>
                </label>
                <input className="input text-sm" placeholder="Nama kegiatan..."
                  value={form.title} onChange={(e) => set("title", e.target.value)} required />
              </div>

              <div>
                <label className="text-xs font-semibold text-tcb-gray-400 block mb-1.5">Deskripsi</label>
                <textarea className="input text-sm resize-none" rows={3} placeholder="Deskripsi kegiatan..."
                  value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>

              <DateTimeInput label="Tanggal Mulai" required
                dateVal={form.startDate} timeVal={form.startTime}
                onDateChange={(v) => set("startDate", v)} onTimeChange={(v) => set("startTime", v)} />
              <DateTimeInput label="Tanggal Selesai"
                dateVal={form.endDate} timeVal={form.endTime}
                onDateChange={(v) => set("endDate", v)} onTimeChange={(v) => set("endTime", v)} />

              <div>
                <label className="text-xs font-semibold text-tcb-gray-400 block mb-1.5">Tipe Lokasi</label>
                <div className="flex gap-2">
                  {[
                    { v: "OFFLINE", l: "📍 Offline" },
                    { v: "ONLINE",  l: "💻 Online"  },
                    { v: "HYBRID",  l: "🔀 Hybrid"  },
                  ].map(({ v, l }) => (
                    <button key={v} type="button" onClick={() => set("locationType", v)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                        form.locationType === v
                          ? "bg-tcb-red border-tcb-red text-white"
                          : "border-tcb-gray-600 text-tcb-gray-400 hover:border-tcb-gray-400 hover:text-tcb-gray-200"
                      }`}>{l}</button>
                  ))}
                </div>
              </div>

              {form.locationType === "ONLINE" && (
                <div>
                  <label className="text-xs font-semibold text-tcb-gray-400 block mb-1.5">Link Meeting</label>
                  <input className="input text-sm" placeholder="https://zoom.us/j/... atau discord.gg/..."
                    value={form.location} onChange={(e) => set("location", e.target.value)} />
                </div>
              )}

              {form.locationType !== "ONLINE" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-tcb-gray-400 block mb-1.5">Nama Tempat</label>
                    <input className="input text-sm" placeholder="contoh: Warnet Dota, GOR Bojonegoro..."
                      value={form.location} onChange={(e) => set("location", e.target.value)} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-tcb-gray-400 block mb-1.5">
                      Embed Google Maps
                      <span className="text-tcb-gray-500 font-normal ml-1">(opsional)</span>
                    </label>
                    <textarea
                      className="input text-sm resize-none font-mono text-xs"
                      rows={3}
                      placeholder='Paste embed code di sini...'
                      value={form.mapsEmbed}
                      onChange={(e) => handleEmbedChange(e.target.value)}
                    />

                    {embedMsg && (
                      <p className={`text-xs mt-1.5 ${embedMsg.ok ? "text-green-400" : "text-amber-400"}`}>
                        {embedMsg.text}
                      </p>
                    )}

                    {!form.mapsEmbed && (
                      <div className="mt-2 bg-tcb-gray-900 border border-tcb-gray-700 rounded-xl p-3 text-xs text-tcb-gray-400 space-y-1">
                        <p className="font-semibold text-tcb-gray-300">Cara mendapatkan embed code:</p>
                        <p>1. Buka <span className="text-tcb-red">Google Maps</span> di browser</p>
                        <p>2. Cari lokasi → klik <span className="text-tcb-red">Share</span></p>
                        <p>3. Pilih tab <span className="text-tcb-red">Embed a map</span></p>
                        <p>4. Klik <span className="text-tcb-red">Copy HTML</span> → paste di sini</p>
                      </div>
                    )}

                    {embedSrc && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-tcb-gray-700" style={{ height: 200 }}>
                        <iframe src={embedSrc} width="100%" height="200"
                          style={{ border: 0 }} allowFullScreen loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade" title="Preview Lokasi" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1 text-sm py-2.5">Batal</button>
                <button type="submit" disabled={loading} className="btn-red flex-1 text-sm py-2.5">
                  {loading ? "Menyimpan..." : mode === "create" ? "Tambah" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
