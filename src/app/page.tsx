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
              Komunitas TCB adalah wadah bagi para anggota untuk bersatu, berkembang, dan berprestasi bersama.
              Kami hadir sebagai komunitas yang solid, penuh semangat, dan berorientasi pada kemajuan setiap
              individu maupun kelompok.
            </p>
            <p className="text-tcb-gray-400 leading-relaxed text-sm sm:text-base">
              {/* Paragraf kedua */}
              Bergabung bersama kami dan jadilah bagian dari keluarga besar TCB yang terus tumbuh dan memberikan
              dampak positif bagi anggota dan lingkungan sekitarnya.
            </p>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-tcb-gray-700" />

      <AgendaSection agendas={agendas} />
    </>
  );
}
