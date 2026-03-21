"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export function HeroSection() {
  const bgRef = useRef<HTMLDivElement>(null);

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
      {/* Parallax bg */}
      <div
        ref={bgRef}
        className="absolute inset-0 will-change-transform"
        style={{ background: "radial-gradient(ellipse at 50% 40%, #3a0000 0%, #1a0000 30%, #0A0A0A 70%)" }}
      />
      {/* Grid */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "linear-gradient(rgba(224,30,43,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(224,30,43,0.3) 1px,transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-40 sm:h-48 bg-tcb-red/20 blur-3xl rounded-full" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto w-full">
        <div className="inline-block px-3 py-1 border border-tcb-red/40 rounded-full text-tcb-red text-xs font-bold tracking-widest uppercase mb-5">
          Komunitas Resmi
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 text-tcb-white">
          TCB
        </h1>
        <div className="w-12 h-1 bg-tcb-red mx-auto mb-5" />
        <p className="text-tcb-gray-200 text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-8 leading-relaxed">
          Bersatu · Berprestasi · Berkembang
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

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
        <span className="text-xs text-tcb-gray-400 tracking-widest uppercase">Scroll</span>
        <div className="w-px h-6 bg-tcb-red animate-pulse" />
      </div>
    </section>
  );
}
