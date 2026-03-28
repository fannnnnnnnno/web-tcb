"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(70), 100);
    const t2 = setTimeout(() => {
      setProgress(100);
      const t3 = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(t3);
    }, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, searchParams]);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] transition-all duration-300"
      style={{
        width: `${progress}%`,
        background: "var(--tcb-red, #E01E2B)",
        opacity: loading ? 1 : 0,
        boxShadow: "0 0 8px var(--tcb-red, #E01E2B)",
        transition: `width ${progress === 100 ? 200 : 300}ms ease, opacity 300ms ease`,
      }}
    />
  );
}

// Spinner untuk tombol atau inline loading
export function Spinner({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: "spin 0.7s linear infinite", display: "inline-block", verticalAlign: "middle" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
      <path d="M12 3a9 9 0 0 1 9 9" />
    </svg>
  );
}

// Skeleton loader untuk card
export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="h-4 bg-tcb-gray-700 rounded-lg w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 bg-tcb-gray-700 rounded-lg" style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );
}

// Full screen overlay loader
export function OverlayLoader({ text = "Memuat..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-tcb-black/80 backdrop-blur-sm">
      <Spinner size={40} color="#E01E2B" />
      <p className="text-tcb-gray-300 text-sm mt-4 font-medium">{text}</p>
    </div>
  );
}
