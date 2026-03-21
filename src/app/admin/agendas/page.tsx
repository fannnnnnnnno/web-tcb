import { prisma } from "@/lib/prisma";
import { formatDateTime, isUpcoming } from "@/lib/utils";
import { AgendaForm } from "@/components/admin/AgendaForm";
import { AgendaActions } from "@/components/admin/AgendaActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Agenda" };

export default async function AdminAgendasPage() {
  const agendas = await prisma.agenda.findMany({ orderBy: { date: "desc" } });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-tcb-white">Agenda</h1>
        <AgendaForm mode="create" />
      </div>

      <div className="space-y-3">
        {agendas.length === 0 && (
          <div className="card text-center py-12 text-tcb-gray-400 text-sm">Belum ada agenda.</div>
        )}
        {agendas.map((agenda) => {
          const upcoming = isUpcoming(agenda.date);
          return (
            <div key={agenda.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      upcoming ? "bg-tcb-red/20 text-tcb-red border border-tcb-red/30"
                               : "bg-tcb-gray-700 text-tcb-gray-400 border border-tcb-gray-600"
                    }`}>
                      {upcoming ? "Akan Datang" : "Berlalu"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      agenda.isPublished
                        ? "bg-green-900/20 text-green-400 border-green-700/40"
                        : "bg-tcb-gray-700 text-tcb-gray-400 border-tcb-gray-600"
                    }`}>
                      {agenda.isPublished ? "Publik" : "Draft"}
                    </span>
                    <span className="text-xs text-tcb-gray-400">{agenda.locationType}</span>
                  </div>
                  <h3 className="font-black text-tcb-white text-sm sm:text-base">{agenda.title}</h3>
                  <div className="text-xs text-tcb-gray-400 mt-1">{formatDateTime(agenda.date)}</div>
                  {agenda.location && <div className="text-xs text-tcb-gray-500 truncate">{agenda.location}</div>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <AgendaForm mode="edit" agenda={agenda} />
                  <AgendaActions agendaId={agenda.id} isPublished={agenda.isPublished} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
