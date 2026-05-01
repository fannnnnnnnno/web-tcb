import Link from "next/link";
import Image from "next/image";

// ============================================================
//  PANDUAN MENAMBAH EVENT
// ============================================================
//  type: "major" → milestone utama (card lebih besar)
//  type: "minor" → event biasa (card lebih kecil)
//
//  image: "/nama-file.jpg"  → taruh file di folder public/
//  image: null              → tidak ada gambar
//
//  Contoh:
//  {
//    date: "10 Maret 2025",
//    title: "JUDUL EVENT",
//    description: "Deskripsi singkat.",
//    type: "major",
//    image: "/foto.jpg",
//    isLatest: false,
//  },
// ============================================================

type TimelineEvent = {
  date: string;
  title: string;
  description: string;
  type: "major" | "minor";
  image: string | null;
  isLatest?: boolean;
};

const timelineEvents: TimelineEvent[] = [
  // ── TERBARU (paling atas) ─────────────────────────────────

  {
    date: "18 April 2026",
    title: "FUN MATCH TOURNAMENT — MAJU HARDWARE MADIUN",
    description:
      "TCB menurunkan 13 roster terbaiknya dalam Fun Match Tournament yang diselenggarakan di Maju Hardware, Madiun. Keikutsertaan ini menjadi bukti nyata komitmen TCB dalam memperluas jaringan kompetisi ke luar kota Bojonegoro.",
    type: "minor",
    image: null,
  },
  {
    date: "7 Maret 2026",
    title: "FRIENDLY MATCH TCB vs TDC (TEKKEN DUMAI COMMUNITY)",
    description:
      "TCB Bojonegoro menghadapi Tekken Dumai Community (TDC) dari Riau dalam sebuah friendly match lintas pulau. Pertandingan disiarkan secara langsung melalui kanal YouTube @TCBBojonegoro, dengan TCB menurunkan 10 roster pilihan.",
    type: "minor",
    image: null,
  },
  {
    date: "18 Januari 2026",
    title: "TEKKEN BOJONEGORO TOUR",
    description:
      "Dalam rangka memperingati Anniversary pertama TCB, diselenggarakan turnamen Tekken 8 bertajuk Tekken Bojonegoro Tour. Kompetisi ini terbuka untuk peserta dari dalam maupun luar kota, dengan total prizepool Rp 700.000 beserta sertifikat. Diselenggarakan di QQ Gaming Bojonegoro.",
    type: "major",
    image: null,
  },
  {
    date: "18 Januari 2026",
    title: "BREAK THE LIMIT INDO",
    description:
      "TCB mendapat kehormatan untuk bergabung dalam Break The Limit Indo, sebuah liga resmi Tekken 8 yang mempertemukan berbagai komunitas dari seluruh Indonesia. Seluruh pertandingan disiarkan secara langsung melalui platform YouTube.",
    type: "major",
    image: null,
  },
  {
    date: "18 Januari 2026",
    title: "FRIENDLY MATCH TCB vs TWK (TEKKEN WARRIOR KOBAR)",
    description:
      "TCB menjalin hubungan persahabatan antar komunitas dengan menggelar friendly match melawan Tekken Warrior Kobar (TWK), komunitas Tekken yang berbasis di Kalimantan.",
    type: "minor",
    image: null,
  },
  {
    date: "11 Desember 2025",
    title: "LOGO KETIGA & REBRANDING",
    description:
      "Memasuki penghujung tahun pertamanya, TCB melakukan pembaruan identitas visual dengan merilis logo ketiga sekaligus rebranding komunitas secara menyeluruh, sebagai langkah persiapan menuju perayaan TCB First Anniversary.",
    type: "major",
    image: "/logoketiga.png",
  },
  {
    date: "9 November 2025",
    title: "TEKKEN ZOEL PLAYSTATION TOURNAMENT",
    description:
      "TCB bersama Zoel Playstation menyelenggarakan turnamen Tekken 8 di Sukorejo, Bojonegoro. Kompetisi ini menawarkan prizepool senilai Rp 300.000 beserta sertifikat, dengan biaya pendaftaran Rp 15.000 yang sudah mencakup satu minuman gratis untuk setiap peserta.",
    type: "minor",
    image: null,
  },
  {
    date: "November 2025",
    title: "PIALA IESPA KABUPATEN BOJONEGORO",
    description:
      "TCB berpartisipasi dalam Piala IESPA Kabupaten Bojonegoro, turnamen Tekken 8 resmi yang diselenggarakan di bawah naungan IESPA. Dengan total hadiah mencapai jutaan rupiah ditambah 25.500 diamonds, piala, serta uang pembinaan.",
    type: "minor",
    image: null,
  },
  {
    date: "14 September 2025",
    title: "TCB × COCOBO — OPEN BOOTH",
    description:
      "TCB berkolaborasi dengan Cocobo dalam rangka perayaan ulang tahun Cocobo ke-11 yang digelar di Gedung SSC Bojonegoro. Dalam kesempatan ini, TCB membuka booth khusus sebagai sarana memperkenalkan komunitas fighting game kepada khalayak yang lebih luas.",
    type: "major",
    image: null,
  },
  {
    date: "17 Mei 2025",
    title: "OPEN GATHERING PERTAMA & TCB AMATEUR LEAGUE",
    description:
      "TCB menggelar open gathering perdana yang terbuka untuk umum, sekaligus menandai lahirnya TCB Amateur League — kompetisi Tekken internal pertama yang dirancang khusus untuk pemain amatir di lingkungan komunitas. Acara berlangsung di OPK 2 Bojonegoro.",
    type: "minor",
    image: null,
  },
  {
    date: "1 Mei 2025",
    title: "FRIENDLY MATCH PERTAMA TCB",
    description:
      "TCB Bojonegoro mengukir sejarah dengan menggelar friendly match perdana melawan SGX (Semarang Gelud Xtreme Esports). Pertandingan ini menjadi babak awal TCB dalam menjalin relasi kompetitif dengan komunitas fighting game dari kota lain, dan disiarkan langsung melalui kanal YouTube SGX e-Sports.",
    type: "minor",
    image: null,
  },
  {
    date: "Februari 2025",
    title: "LOGO KEDUA",
    description:
      "Seiring pertumbuhan komunitas, TCB melakukan pembaruan identitas visual pertamanya dengan memperkenalkan logo kedua yang mencerminkan semangat dan perkembangan komunitas.",
    type: "major",
    image: "/logokedua.png",
  },
  {
    date: "16 Januari 2025",
    title: "BERDIRINYA TCB",
    description:
      "Atas antusiasme yang luar biasa dari para peserta turnamen Tekken 8, secara resmi dibentuklah Tekken Community Bojonegoro (TCB) sebagai wadah bagi para penggiat fighting game di Bojonegoro. Komunitas ini berdiri dengan tagline 'Combo, Respect, Repeat' sebagai landasan nilai bersama.",
    type: "major",
    image: "/logopertama.jpg",
  },
  {
    date: "12 Januari 2025",
    title: "TURNAMEN TEKKEN 8 PERTAMA",
    description:
      "Menyikapi tingginya minat masyarakat Bojonegoro terhadap Tekken 8, digelarlah turnamen pertama yang bertempat di 3s Corner. Kompetisi ini sepenuhnya diikuti oleh peserta dari dalam kota dan menjadi tonggak awal perjalanan komunitas TCB.",
    type: "minor",
    image: null,
  },
  {
    date: "20 Desember 2024",
    title: "GATHERING KEDUA COCOBO GAMING",
    description:
      "Menyusul keberhasilan gathering pertama, sesi kedua kali ini difokuskan sepenuhnya pada Tekken 8 mengingat animo peserta terhadap game tersebut jauh melampaui game lainnya.",
    type: "minor",
    image: null,
  },
  {
    date: "5 November 2024",
    title: "GATHERING PERTAMA COCOBO GAMING",
    description:
      "Sebuah gathering gaming perdana digelar di 3s Corner, Bojonegoro, menampilkan tiga judul game: Tekken 8, Naruto Ultimate Ninja Storm 4, dan Jump Force. Momen inilah yang menjadi cikal bakal lahirnya Tekken Community Bojonegoro (TCB).",
    type: "major",
    image: null,
  },
  // ── TERLAMA (paling bawah) ────────────────────────────────
];

export default function HistoryPage() {
  return (
    <main className="bg-tcb-black min-h-screen">
      {/* ── Header ── */}
      <div className="px-4 pt-10 pb-8 sm:pt-14">
        <div className="max-w-2xl mx-auto text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-tcb-gray-400 hover:text-tcb-red transition-colors text-sm mb-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Kembali
          </Link>
          <div className="w-10 h-0.5 bg-tcb-red mx-auto mb-5" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 text-tcb-white">
            Sejarah <span className="text-tcb-red">TCB</span>
          </h1>
          <p className="text-tcb-gray-400 text-sm sm:text-base leading-relaxed">
            Perjalanan komunitas fighting game terbaik di Bojonegoro.
          </p>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="relative">

            {/* ── Garis vertikal ── */}
            {/* Mobile: sisi kiri | Desktop: tengah */}
            <div className="
              absolute top-0 bottom-0 w-px bg-tcb-gray-700
              left-[7px]
              md:left-1/2 md:-translate-x-1/2
            " />

            <div className="flex flex-col">
              {timelineEvents.map((event, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div
                    key={event.date + event.title}
                    className="relative flex mb-8 md:mb-10"
                  >
                    {/* ── Mobile: titik kiri ── */}
                    <div className="md:hidden flex flex-col items-center mr-4 mt-1 shrink-0">
                      <Dot event={event} />
                    </div>

                    {/* ── Mobile: card full width ── */}
                    <div className="md:hidden flex-1">
                      <TimelineCard event={event} />
                    </div>

                    {/* ── Desktop: layout zigzag ── */}
                    {/* Sisi kiri */}
                    <div className={`hidden md:flex w-1/2 pr-10 justify-end ${!isLeft ? "invisible" : ""}`}>
                      {isLeft && (
                        <div className="w-full max-w-sm">
                          <TimelineCard event={event} />
                        </div>
                      )}
                    </div>

                    {/* Titik tengah desktop */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-5 z-10">
                      <Dot event={event} />
                    </div>

                    {/* Sisi kanan */}
                    <div className={`hidden md:flex w-1/2 pl-10 justify-start ${isLeft ? "invisible" : ""}`}>
                      {!isLeft && (
                        <div className="w-full max-w-sm">
                          <TimelineCard event={event} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cap bawah */}
            <div className="flex md:justify-center ml-[3px] md:ml-0">
              <div className="w-3 h-3 rounded-full bg-tcb-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Dot({ event }: { event: TimelineEvent }) {
  if (event.isLatest) {
    return (
      <span className="flex h-4 w-4 relative shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tcb-red opacity-40" />
        <span className="relative inline-flex rounded-full h-4 w-4 bg-tcb-red" />
      </span>
    );
  }
  if (event.type === "major") {
    return <span className="w-4 h-4 rounded-full border-2 border-tcb-red bg-tcb-black shrink-0" />;
  }
  return <span className="w-3 h-3 rounded-full border-2 border-tcb-gray-600 bg-tcb-black shrink-0 mt-0.5" />;
}

function TimelineCard({ event }: { event: TimelineEvent }) {
  const isMajor = event.type === "major";

  return (
    <div className={`
      w-full rounded-sm overflow-hidden
      ${event.isLatest
        ? "border border-tcb-red bg-tcb-gray-900"
        : isMajor
        ? "border border-tcb-gray-600 bg-tcb-gray-900"
        : "border border-tcb-gray-700 bg-tcb-gray-800"
      }
    `}>

      {/* Gambar */}
      {event.image && event.image.trim() !== "" && (
        <div className={`relative w-full overflow-hidden ${isMajor ? "h-44" : "h-28"}`}>
          <Image src={event.image} alt="" fill aria-hidden className="object-cover scale-110 blur-lg opacity-30" />
          <Image src={event.image} alt={event.title} fill className="object-contain p-2" />
        </div>
      )}

      {/* Konten */}
      <div className={isMajor ? "p-4" : "p-3"}>

        {/* Badge tanggal */}
        <div className={`
          inline-block font-black tracking-widest mb-2
          ${event.isLatest
            ? "bg-tcb-red text-tcb-white text-[10px] px-2.5 py-0.5"
            : isMajor
            ? "border border-tcb-red text-tcb-red text-[10px] px-2.5 py-0.5"
            : "border border-tcb-gray-600 text-tcb-gray-400 text-[9px] px-2 py-0.5"
          }
        `}>
          {event.date}
        </div>

        {/* Badge aktif */}
        {event.isLatest && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-tcb-red animate-pulse" />
            <span className="text-tcb-red text-[10px] font-bold tracking-widest">AKTIF</span>
          </div>
        )}

        {/* Judul */}
        <h3 className={`text-tcb-white font-black tracking-tight leading-snug mb-1.5 ${isMajor ? "text-sm" : "text-xs"}`}>
          {event.title}
        </h3>

        {/* Deskripsi */}
        <p className={`text-tcb-gray-400 leading-relaxed text-justify ${isMajor ? "text-xs" : "text-[11px]"}`}>
          {event.description}
        </p>

      </div>
    </div>
  );
}