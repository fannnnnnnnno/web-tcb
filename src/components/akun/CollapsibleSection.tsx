"use client";

import { useState } from "react";

function AvatarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

export function CollapsibleSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: "avatar" | "edit";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-tcb-gray-800 border border-tcb-gray-700 rounded-2xl overflow-hidden">
      {/* Header / Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-tcb-gray-700/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-tcb-red">{icon === "avatar" ? <AvatarIcon /> : <EditIcon />}</span>
          <span className="font-bold text-tcb-white text-sm">{title}</span>
        </div>
        <svg
          className={`w-4 h-4 text-tcb-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {open && (
        <div className="border-t border-tcb-gray-700 p-4 sm:p-5">
          {children}
        </div>
      )}
    </div>
  );
}
