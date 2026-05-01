"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type Game = { id: string; name: string; slug: string };

export function GameTabSelect({ gameSlug, games }: { gameSlug: string; games: Game[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const allOptions = [{ id: "__global__", name: "Global", slug: "global" }, ...games];
  const active = allOptions.find((g) => g.slug === gameSlug) ?? allOptions[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(slug: string) {
    setOpen(false);
    router.push(slug === "global" ? "/peringkat" : `/peringkat?game=${slug}`);
  }

  return (
    <div ref={ref} className="relative w-full" style={{ fontFamily: "inherit" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1.5px solid",
          borderColor: open ? "#E01E2B" : "var(--border)",
          color: "var(--text-primary)",
          boxShadow: open ? "0 0 0 3px rgba(224,30,43,0.15)" : "none",
        }}
      >
        <span className="flex items-center gap-2">
          {gameSlug === "global" && (
            <span className="w-2 h-2 rounded-full bg-tcb-red inline-block flex-shrink-0" />
          )}
          {active.name}
        </span>
        <svg
          className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
          style={{
            color: "var(--text-faint)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1.5px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {allOptions.map((g) => {
            const isActive = g.slug === gameSlug;
            return (
              <button
                key={g.id}
                onClick={() => select(g.slug)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left transition-colors"
                style={{
                  backgroundColor: isActive ? "rgba(224,30,43,0.12)" : "transparent",
                  color: isActive ? "#E01E2B" : "var(--text-primary)",
                  borderBottom: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isActive ? "#E01E2B" : "var(--border-mid)" }}
                />
                {g.name}
                {isActive && (
                  <svg className="w-3.5 h-3.5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}