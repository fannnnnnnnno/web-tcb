"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AgendaActions({ agendaId, isPublished }: { agendaId: string; isPublished: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/agendas/${agendaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    setLoading(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Hapus agenda ini?")) return;
    setLoading(true);
    await fetch(`/api/admin/agendas/${agendaId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={toggle}
        disabled={loading}
        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
          isPublished
            ? "border-tcb-gray-600 text-tcb-gray-400 hover:border-tcb-gray-400"
            : "border-green-700/40 text-green-400 hover:bg-green-900/20"
        }`}
      >
        {isPublished ? "Sembunyikan" : "Publikasi"}
      </button>
      <button
        onClick={remove}
        disabled={loading}
        className="text-xs px-3 py-1.5 rounded-lg border border-red-700/40 text-red-400 hover:bg-red-900/20 transition-all font-semibold"
      >
        Hapus
      </button>
    </div>
  );
}
