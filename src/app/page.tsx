import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/layout/HeroSection";
import { AgendaSection } from "@/components/layout/AgendaSection";

async function getData() {
  const agendas = await prisma.agenda.findMany({
    where: { isPublished: true },
    orderBy: { date: "asc" },
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
      <section className="bg-tcb-black">
        <div className="section">
          <div className="max-w-3xl mx-auto text-center">
            <div className="red-line mx-auto mb-5" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-5 text-tcb-white">
              Tentang <span className="text-tcb-red">Kami</span>
            </h2>
            <p className="text-tcb-gray-200 text-base sm:text-lg leading-relaxed mb-4">
              {/* Ganti teks ini dengan deskripsi resmi komunitas TCB */}
              Fighting game community bojonegoro adalah komunitas game fighting/console yang berbasis dan berkembang di bojonegoro, Misi kami adalah membangun/mendukung ekosistem dan eksistensi game fighting di bojonegoro.
              Kami juga berkomitmen untuk menciptakan lingkungan yang inklusif, ramah, dan mendukung bagi semua anggota komunitas kami, tanpa memandang latar belakang, jenis kelamin, atau tingkat keahlian.
            </p>
            <p className="text-tcb-gray-400 leading-relaxed text-sm sm:text-base">
              {/* Paragraf kedua */}
              Based on Tekken 8, street fighter 6, naruto ultimate ninja storm 4, kimetsu no yaiba the hinokami chronicles, dan masih banyak lagi. rutinitas kami adalah mengadakan gathering mingguan, tournament, dan sparring antar komunitas game.
            </p>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-tcb-gray-700" />

      <AgendaSection agendas={agendas} />
    </>
  );
}
