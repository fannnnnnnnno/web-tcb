"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// ─── Page transition bar ───────────────────────────────────────────────────────
export function PageLoader() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible,  setVisible]  = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(0);
    const t1 = setTimeout(() => setProgress(30),  10);
    const t2 = setTimeout(() => setProgress(55),  150);
    const t3 = setTimeout(() => setProgress(85),  400);
    const t4 = setTimeout(() => {
      setProgress(100);
      const t5 = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t5);
    }, 700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [pathname, searchParams]);

  if (!visible && progress === 0) return null;

  return (
    <>
      <div
        className="fixed top-0 left-0 z-[9999] h-[2px]"
        style={{
          width: `${progress}%`,
          background: "#E01E2B",
          opacity: visible ? 1 : 0,
          transition: progress === 0
            ? "none"
            : progress === 100
            ? "width 200ms ease, opacity 300ms ease 100ms"
            : "width 400ms cubic-bezier(0.4,0,0.2,1)",
        }}
      />
      <div
        className="fixed top-0 z-[9999]"
        style={{
          left: `${progress}%`,
          width: "60px",
          height: "2px",
          background: "linear-gradient(to right, #E01E2B, transparent)",
          opacity: visible && progress < 100 ? 1 : 0,
          transform: "translateX(-100%)",
          transition: "left 400ms cubic-bezier(0.4,0,0.2,1), opacity 300ms",
          boxShadow: "0 0 8px 2px rgba(224,30,43,0.6)",
          filter: "blur(1px)",
        }}
      />
    </>
  );
}

// ─── Spinner (inline/tombol) ──────────────────────────────────────────────────
export function Spinner({ size = 16, color = "#E01E2B" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: "tcb-spin 0.65s linear infinite", display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
      <style>{`@keyframes tcb-spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="9" stroke={color} strokeOpacity="0.15" strokeWidth="2.5" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Skeleton shimmer ─────────────────────────────────────────────────────────
function Shimmer({ width = "100%", height = "14px", rounded = "6px" }: {
  width?: string; height?: string; rounded?: string;
}) {
  return (
    <div style={{ width, height, borderRadius: rounded, background: "var(--skeleton-bg)", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
        animation: "tcb-shimmer 1.6s ease-in-out infinite",
      }} />
      <style>{`@keyframes tcb-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Shimmer width="40%" height="16px" />
      {Array.from({ length: rows }).map((_, i) => (
        <Shimmer key={i} width={`${65 + (i % 3) * 12}%`} height="12px" />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px" }}>
      <Shimmer width="32px" height="32px" rounded="50%" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <Shimmer width="45%" height="13px" />
        <Shimmer width="28%" height="10px" />
      </div>
      <Shimmer width="48px" height="13px" />
    </div>
  );
}

// ─── Fighting Combo Dots ──────────────────────────────────────────────────────
// Titik-titik yang muncul seperti input combo fighting game
export function ComboDots({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dotSize = size === "sm" ? 6 : size === "lg" ? 12 : 8;
  const gap     = size === "sm" ? 4 : size === "lg" ? 8 : 6;

  return (
    <>
      <style>{`
        @keyframes tcb-combo-pop {
          0%   { transform: scale(0.3) translateY(6px); opacity: 0; }
          35%  { transform: scale(1.3) translateY(-2px); opacity: 1; }
          65%  { transform: scale(1)   translateY(0);    opacity: 1; }
          85%  { transform: scale(1)   translateY(0);    opacity: 1; }
          100% { transform: scale(0.7) translateY(-5px); opacity: 0; }
        }
        @keyframes tcb-glitch {
          0%,100% { transform: translateX(0) skewX(0deg); }
          20%     { transform: translateX(-1px) skewX(-2deg); }
          40%     { transform: translateX(1px) skewX(2deg); }
          60%     { transform: translateX(-1px) skewX(-1deg); }
          80%     { transform: translateX(0) skewX(0deg); }
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: `${gap}px` }}>
        {[
          { delay: "0s",     color: "#E01E2B" },
          { delay: "0.15s",  color: "#ff3d4d" },
          { delay: "0.30s",  color: "#ff7a85" },
          { delay: "0.45s",  color: "#E01E2B" },
        ].map((dot, i) => (
          <div key={i} style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            borderRadius: "50%",
            backgroundColor: dot.color,
            animation: `tcb-combo-pop 1.1s ease-in-out ${dot.delay} infinite`,
            boxShadow: `0 0 ${dotSize}px rgba(224,30,43,0.5)`,
          }} />
        ))}
      </div>
    </>
  );
}

// ─── Overlay Loader — pakai Combo Dots ───────────────────────────────────────
export function OverlayLoader({ text = "Memuat..." }: { text?: string }) {
  return (
    <div
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center"
      style={{
        backgroundColor: "var(--modal-bg)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <style>{`
        @keyframes tcb-text-glitch {
          0%,90%,100% { transform: translateX(0) skewX(0deg); opacity: 1; }
          92%          { transform: translateX(-2px) skewX(-3deg); opacity: 0.8; }
          94%          { transform: translateX(2px) skewX(3deg); opacity: 1; }
          96%          { transform: translateX(-1px) skewX(0deg); opacity: 0.9; }
        }
      `}</style>

      {/* Teks TCB dengan glitch */}
      <div style={{
        fontSize: "28px",
        fontWeight: 900,
        color: "#E01E2B",
        letterSpacing: "6px",
        marginBottom: "20px",
        animation: "tcb-text-glitch 2.5s ease-in-out infinite",
        textShadow: "0 0 20px rgba(224,30,43,0.4)",
      }}>
        TCB
      </div>

      {/* Combo dots */}
      <ComboDots size="lg" />

      {/* Label */}
      <p style={{
        marginTop: "20px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "4px",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        animation: "tcb-text-glitch 3s ease-in-out 0.5s infinite",
      }}>
        {text}
      </p>
    </div>
  );
}
