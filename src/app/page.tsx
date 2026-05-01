import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/layout/HeroSection";
import { AgendaSection } from "@/components/layout/AgendaSection";
import Link from "next/link";

async function getData() {
  const agendas = await prisma.agenda.findMany({
    where: { isPublished: true },
    orderBy: { date: "desc" },
    take: 6,
  });
  return { agendas };
}

export default async function HomePage() {
  const { agendas } = await getData();
  return (
    <>
      <HeroSection />

      {/* Tentang Kami */}
      <section style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="section">
          <div className="max-w-3xl mx-auto text-center">
            <div className="red-line mx-auto mb-5" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-5"
              style={{ color: "var(--text-primary)" }}>
              Tentang <span className="text-tcb-red">Kami</span>
            </h2>
            <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
              Fighting game community bojonegoro adalah komunitas game fighting/console
              yang berbasis dan berkembang di bojonegoro. Misi kami adalah
              membangun/mendukung ekosistem dan eksistensi game fighting di bojonegoro.
              Kami juga berkomitmen untuk menciptakan lingkungan yang inklusif, ramah,
              dan mendukung bagi semua anggota komunitas kami, tanpa memandang latar
              belakang, jenis kelamin, atau tingkat keahlian.
            </p>
            <p className="leading-relaxed text-sm sm:text-base mb-8" style={{ color: "var(--text-faint)" }}>
              Based on Tekken 8, street fighter 6, naruto ultimate ninja storm 4,
              kimetsu no yaiba the hinokami chronicles, dan masih banyak lagi.
              Rutinitas kami adalah mengadakan gathering mingguan, tournament, dan
              sparring antar komunitas game.
            </p>
            <Link
              href="/history"
              className="inline-flex items-center gap-2 border border-tcb-red text-tcb-red hover:bg-tcb-red hover:text-white transition-colors duration-200 px-6 py-2.5 text-sm font-semibold tracking-wide uppercase"
            >
              Lihat Selengkapnya
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <div className="w-full h-px" style={{ backgroundColor: "var(--divider)" }} />
      <AgendaSection agendas={agendas} />
    </>
  );
}
