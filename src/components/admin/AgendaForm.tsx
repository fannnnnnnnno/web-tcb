"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Agenda } from "@prisma/client";

type Props = { mode: "create" | "edit"; agenda?: Agenda };

function splitDateTime(iso: string | null | undefined) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: "", time: "" };
  return {
    date: d.toLocaleDateString("en-CA"),   // YYYY-MM-DD
    time: d.toTimeString().slice(0, 5),    // HH:MM
  };
}

function combineDateTime(date: string, time: string): string | null {
  if (!date) return null;
  return new Date(`${date}T${time || "00:00"}:00`).toISOString();
}

const EMPTY = {
  title: "", description: "",
  startDate: "", startTime: "",
  endDate:   "", endTime:   "",
  location: "", locationType: "OFFLINE",
  lat: "", lng: "",
};

declare global { interface Window { L: any } }

// ── Peta picker ──────────────────────────────────────────────────────────────
function MapPicker({ lat, lng, onPick }: {
  lat: string; lng: string;
  onPick: (lat: number, lng: number, address: string) => void;
}) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapObj    = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [ready,   setReady]   = useState(false);
  const [picking, setPicking] = useState(false);

  const reverseGeocode = useCallback(async (lt: number, ln: number) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lt}&lon=${ln}&format=json`,
        { headers: { "Accept-Language": "id" } }
      );
      const d = await r.json();
      return d.display_name ?? `${lt.toFixed(5)}, ${ln.toFixed(5)}`;
    } catch { return `${lt.toFixed(5)}, ${ln.toFixed(5)}`; }
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;

    if (!document.getElementById("leaflet-css")) {
      const l = document.createElement("link");
      l.id = "leaflet-css"; l.rel = "stylesheet";
      l.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(l);
    }

    const s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload = () => {
      const L = window.L;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initLat = lat ? parseFloat(lat) : -2.5;
      const initLng = lng ? parseFloat(lng) : 117.0;
      const map = L.map(mapRef.current!).setView([initLat, initLng], lat ? 15 : 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      if (lat && lng) {
        markerRef.current = L.marker([parseFloat(lat), parseFloat(lng)])
          .addTo(map).bindPopup("Lokasi dipilih").openPopup();
      }

      map.on("click", async (e: any) => {
        const { lat: lt, lng: ln } = e.latlng;
        setPicking(true);
        if (markerRef.current) markerRef.current.setLatLng([lt, ln]);
        else markerRef.current = L.marker([lt, ln]).addTo(map);
        const addr = await reverseGeocode(lt, ln);
        markerRef.current.bindPopup(addr).openPopup();
        onPick(lt, ln, addr);
        setPicking(false);
      });

      mapObj.current = map;
      setReady(true);
    };
    document.head.appendChild(s);
    return () => { if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; } };
  }, []); // eslint-disable-line

  return (
    <div className="relative">
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-tcb-gray-900 rounded-xl">
          <span className="text-sm text-tcb-gray-400">Memuat peta...</span>
        </div>
      )}
      {picking && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-tcb-black/80 text-xs text-white px-3 py-1.5 rounded-full pointer-events-none">
          Mencari alamat...
        </div>
      )}
      <div ref={mapRef} className="rounded-xl overflow-hidden border border-tcb-gray-600" style={{ height: 240 }} />
      <p className="text-xs text-tcb-gray-500 mt-1">Klik pada peta untuk menentukan lokasi.</p>
    </div>
  );
}

// ── Split date + time input ──────────────────────────────────────────────────
function DateTimeInput({ label, required = false, dateVal, timeVal, onDateChange, onTimeChange }: {
  label: string; required?: boolean;
  dateVal: string; timeVal: string;
  onDateChange: (v: string) => void;
  onTimeChange: (v: string) => void;
}) {
  const preview = dateVal
    ? new Date(`${dateVal}T${timeVal || "00:00"}:00`).toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      }) + (timeVal ? ` · ${timeVal}` : "")
    : null;

  return (
    <div>
      <label className="text-xs font-semibold text-tcb-gray-400 block mb-1.5">
        {label}{required && <span className="text-tcb-red ml-0.5">*</span>}
      </label>
      <div className="flex gap-2">
        {/* Tanggal */}
        <input
          type="date"
          className="input text-sm flex-1"
          value={dateVal}
          onChange={(e) => onDateChange(e.target.value)}
          required={required}
          style={{ colorScheme: "dark" }}
        />
        {/* Jam */}
        <input
          type="time"
          className="input text-sm w-28"
          value={timeVal}
          onChange={(e) => onTimeChange(e.target.value)}
          style={{ colorScheme: "dark" }}
        />
      </div>
      {preview && (
        <p className="text-xs text-tcb-red mt-1 font-medium">{preview}</p>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function AgendaForm({ mode, agenda }: Props) {
  const s = splitDateTime(agenda?.date?.toString());
  const e = splitDateTime(agenda?.endDate?.toString());

  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState("");
  const [form, setForm] = useState(
    agenda ? {
      title:        agenda.title,
      description:  agenda.description ?? "",
      startDate:    s.date, startTime: s.time,
      endDate:      e.date, endTime:   e.time,
      location:     agenda.location ?? "",
      locationType: agenda.locationType,
      lat:          (agenda as any).lat?.toString() ?? "",
      lng:          (agenda as any).lng?.toString() ?? "",
    } : EMPTY
  );
  const router = useRouter();

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function handleMapPick(lat: number, lng: number, addr: string) {
    setForm((f) => ({ ...f, lat: lat.toString(), lng: lng.toString(), location: addr }));
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
          endDate:      combineDateTime(form.endDate,   form.endTime),
          location:     form.location || null,
          locationType: form.locationType,
          mapsUrl:      form.lat && form.lng ? `https://www.google.com/maps?q=${form.lat},${form.lng}` : null,
          mapsEmbed:    form.lat && form.lng ? `https://maps.google.com/maps?q=${form.lat},${form.lng}&output=embed` : null,
          lat:          form.lat ? parseFloat(form.lat) : null,
          lng:          form.lng ? parseFloat(form.lng) : null,
        }),
      }
    );

    setLoading(false);
    const data = await res.json();
    if (res.ok) {
      setMsg(mode === "create" ? "Agenda berhasil dibuat!" : "Agenda berhasil diperbarui!");
      if (mode === "create") setForm(EMPTY);
      router.refresh();
    } else {
      setMsg(data.error ?? "Gagal menyimpan.");
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setMsg(""); }}
        className={mode === "create"
          ? "btn-red text-sm px-5 py-2"
          : "text-xs px-3 py-1.5 rounded-lg border border-tcb-gray-600 text-tcb-gray-200 hover:border-tcb-red hover:text-tcb-red transition-all font-semibold"}
      >
        {mode === "create" ? "+ Tambah Agenda" : "Edit"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-tcb-gray-800 border border-tcb-gray-700 rounded-2xl w-full max-w-lg my-6"
            onClick={(ev) => ev.stopPropagation()}
          >
            {/* Header */}
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

              {/* Judul */}
              <div>
                <label className="text-xs font-semibold text-tcb-gray-400 block mb-1.5">
                  Judul<span className="text-tcb-red ml-0.5">*</span>
                </label>
                <input className="input text-sm" placeholder="Nama kegiatan..." value={form.title}
                  onChange={(e) => set("title", e.target.value)} required />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="text-xs font-semibold text-tcb-gray-400 block mb-1.5">Deskripsi</label>
                <textarea className="input text-sm resize-none" rows={3} placeholder="Deskripsi kegiatan..."
                  value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>

              {/* Tanggal Mulai */}
              <DateTimeInput
                label="Tanggal Mulai" required
                dateVal={form.startDate} timeVal={form.startTime}
                onDateChange={(v) => set("startDate", v)}
                onTimeChange={(v) => set("startTime", v)}
              />

              {/* Tanggal Selesai */}
              <DateTimeInput
                label="Tanggal Selesai"
                dateVal={form.endDate} timeVal={form.endTime}
                onDateChange={(v) => set("endDate", v)}
                onTimeChange={(v) => set("endTime", v)}
              />

              {/* Tipe Lokasi — tombol toggle */}
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
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Online */}
              {form.locationType === "ONLINE" && (
                <div>
                  <label className="text-xs font-semibold text-tcb-gray-400 block mb-1.5">Link Meeting</label>
                  <input className="input text-sm" placeholder="https://zoom.us/j/... atau discord.gg/..."
                    value={form.location} onChange={(e) => set("location", e.target.value)} />
                </div>
              )}

              {/* Offline / Hybrid: peta */}
              {form.locationType !== "ONLINE" && (
                <div>
                  <label className="text-xs font-semibold text-tcb-gray-400 block mb-1.5">Pilih Lokasi di Peta</label>
                  <MapPicker lat={form.lat} lng={form.lng} onPick={handleMapPick} />
                  <div className="mt-3">
                    <label className="text-xs font-semibold text-tcb-gray-400 block mb-1.5">
                      Nama / Alamat <span className="text-tcb-gray-500 font-normal">(terisi otomatis, bisa diedit)</span>
                    </label>
                    <input className="input text-sm" placeholder="Klik peta untuk mengisi otomatis..."
                      value={form.location} onChange={(e) => set("location", e.target.value)} />
                  </div>
                  {form.lat && form.lng && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-tcb-gray-500">
                      <svg className="w-3.5 h-3.5 text-tcb-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{parseFloat(form.lat).toFixed(5)}, {parseFloat(form.lng).toFixed(5)}</span>
                      <a href={`https://www.google.com/maps?q=${form.lat},${form.lng}`} target="_blank"
                        rel="noopener noreferrer" className="text-tcb-red hover:underline ml-1">
                        Cek di Maps ↗
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
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
