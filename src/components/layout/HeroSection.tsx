"use client";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";

export function HeroSection() {
  const bgRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isDark = !mounted || resolvedTheme !== "light";

  useEffect(() => {
    const handle = () => {
      if (!bgRef.current) return;
      bgRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <section className="relative h-screen min-h-[500px] flex items-center justify-center overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-0 will-change-transform transition-all duration-500"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at 50% 40%, #3a0000 0%, #1a0000 30%, #0A0A0A 70%)"
            : "radial-gradient(ellipse at 50% 40%, #ffe0e3 0%, #fdf0f2 40%, #fbf5f7 80%)",
        }}
      />
      <div className="absolute inset-0" style={{
        opacity: isDark ? 0.10 : 0.06,
        backgroundImage: "linear-gradient(rgba(224,30,43,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(224,30,43,0.3) 1px,transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-40 sm:h-48 blur-3xl rounded-full transition-all duration-500"
        style={{ backgroundColor: isDark ? "rgba(224,30,43,0.20)" : "rgba(224,30,43,0.10)" }} />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto w-full">
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 transition-colors duration-300"
          style={{ color: isDark ? "#ffffff" : "#0a100d" }}
        >
          TCB
        </h1>
        <div className="w-12 h-1 bg-tcb-red mx-auto mb-5" />
        <p
          className="text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-8 leading-relaxed transition-colors duration-300"
          style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(10,16,13,0.7)" }}
        >
          Combo, Respect, Repeat.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/peringkat" className="btn-red px-6 py-3 text-sm sm:text-base">
            Lihat Peringkat
          </Link>
          <Link href="/#agenda" className="btn-outline px-6 py-3 text-sm sm:text-base">
            Agenda Kami
          </Link>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
        <span className="text-xs tracking-widest uppercase transition-colors duration-300"
          style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(10,16,13,0.5)" }}>
          Scroll
        </span>
        <div className="w-px h-6 bg-tcb-red animate-pulse" />
      </div>
    </section>
  );
}
