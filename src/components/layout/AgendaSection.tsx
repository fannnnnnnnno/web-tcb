"use client";

import { useState } from "react";
import { formatDateTime, isUpcoming } from "@/lib/utils";

type AgendaWithCoords = {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  endDate: Date | null;
  location: string | null;
  locationType: string;
  lat: number | null;
  lng: number | null;
  mapsUrl: string | null;
  mapsEmbed: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function AgendaModal({ agenda, onClose }: { agenda: AgendaWithCoords; onClose: () => void }) {
  const upcoming  = isUpcoming(agenda.date);
  const hasCoords = agenda.lat && agenda.lng;
  const mapsLink  = hasCoords
    ? `https://www.google.com/maps?q=${agenda.lat},${agenda.lng}`
    : agenda.mapsUrl;
  const embedSrc  = hasCoords
    ? `https://maps.google.com/maps?q=${agenda.lat},${agenda.lng}&output=embed`
    : agenda.mapsEmbed;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "var(--modal-bg)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto border"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors text-xl"
          style={{ color: "var(--text-faint)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
        >
          ✕
        </button>

        <span className={`text-xs font-bold px-2.5 py-1 rounded-full mb-4 inline-block ${
          upcoming ? "badge-upcoming" : "badge-past"
        }`}>
          {upcoming ? "Akan Datang" : "Telah Berlalu"}
        </span>

        <h3 className="text-xl font-black mb-3 pr-8" style={{ color: "var(--text-primary)" }}>
          {agenda.title}
        </h3>

        {agenda.description && (
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
            {agenda.description}
          </p>
        )}

        <div className="space-y-2.5 mb-5">
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-tcb-red mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {formatDateTime(agenda.date)}
              </div>
              {agenda.endDate && (
                <div className="text-xs" style={{ color: "var(--text-faint)" }}>
                  s/d {formatDateTime(agenda.endDate)}
                </div>
              )}
            </div>
          </div>

          {agenda.location && (
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-tcb-red mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {agenda.location}
                </div>
                <div className="text-xs capitalize" style={{ color: "var(--text-faint)" }}>
                  {agenda.locationType === "OFFLINE" ? "Offline"
                    : agenda.locationType === "ONLINE" ? "Online"
                    : "Hybrid"}
                </div>
              </div>
            </div>
          )}
        </div>

        {agenda.locationType !== "ONLINE" && (hasCoords || embedSrc) && (
          <div>
            {embedSrc && (
              <div className="rounded-xl overflow-hidden mb-3 border" style={{ height: 220, borderColor: "var(--border)" }}>
                <iframe src={embedSrc} width="100%" height="220" style={{ border: 0 }}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Lokasi Agenda" />
              </div>
            )}
            {mapsLink && (
              <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                className="btn-outline text-sm w-full flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Buka di Google Maps
              </a>
            )}
          </div>
        )}

        {agenda.locationType === "ONLINE" && agenda.location && (
          <a href={agenda.location.startsWith("http") ? agenda.location : `https://${agenda.location}`}
            target="_blank" rel="noopener noreferrer"
            className="btn-outline text-sm w-full flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Buka Link Meeting
          </a>
        )}
      </div>
    </div>
  );
}

export function AgendaSection({ agendas }: { agendas: AgendaWithCoords[] }) {
  const [selected, setSelected] = useState<AgendaWithCoords | null>(null);

  return (
    <section id="agenda" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="section">
        <div className="mb-12">
          <div className="red-line mb-4" />
          <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            Agenda <span className="text-tcb-red">Kami</span>
          </h2>
          <p className="mt-2" style={{ color: "var(--text-faint)" }}>Kegiatan dan jadwal komunitas TCB</p>
        </div>

        {agendas.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-faint)" }}>
            Belum ada agenda yang dipublikasikan.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {agendas.map((agenda) => {
              const upcoming = isUpcoming(agenda.date);
              return (
                <div key={agenda.id} className="card-hover group" onClick={() => setSelected(agenda)}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      upcoming ? "badge-upcoming" : "badge-past"
                    }`}>
                      {upcoming ? "Akan Datang" : "Telah Berlalu"}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                      {agenda.locationType === "OFFLINE" ? "Offline"
                        : agenda.locationType === "ONLINE" ? "Online"
                        : "Hybrid"}
                    </span>
                  </div>

                  <h3 className="font-black text-lg mb-2 group-hover:text-tcb-red transition-colors line-clamp-2"
                    style={{ color: "var(--text-primary)" }}>
                    {agenda.title}
                  </h3>

                  {agenda.description && (
                    <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: "var(--text-faint)" }}>
                      {agenda.description}
                    </p>
                  )}

                  <div className="mt-auto pt-3 space-y-1.5" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      <svg className="w-3.5 h-3.5 text-tcb-red flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDateTime(agenda.date)}
                    </div>
                    {agenda.location && (
                      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-faint)" }}>
                        <svg className="w-3.5 h-3.5 text-tcb-red flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="truncate">{agenda.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs font-semibold text-tcb-red group-hover:underline">
                    Lihat detail →
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && <AgendaModal agenda={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
