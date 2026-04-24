import Link from "next/link";
import Image from "next/image";

// ============================================================
//  PANDUAN MENAMBAH EVENT
//  type: "major" | "minor"
//  image: "/nama-file.jpg" atau null
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
  {
    date: "2025",
    title: "TCB MASA KINI",
    description: "TCB terus berkembang dengan member aktif yang terus bertambah. Rutin mengadakan gathering mingguan, tournament lokal hingga antar kota, serta sparring antar komunitas game fighting se-Jawa Timur.",
    type: "major",
    image: null,
    isLatest: true,
  },
  {
    date: "Februari 2025",
    title: "LOGO PERTAMA",
    description: "Logo pertama TCB resmi diperkenalkan.",
    type: "major",
    image: "/logopertama.jpg",
  },
  {
    date: "16 Januari 2025",
    title: "BERDIRINYA TCB",
    description: "Setelah mengadakan turnamen tekken, dibentuklah komunitas 'TEKKEN COMMUNITY BOJONEGORO (TCB)'.",
    type: "major",
    image: null,
  },
  {
    date: "12 Januari 2025",
    title: "TURNAMEN TEKKEN 8 PERTAMA",
    description: "Berkolaborasi dengan 3s Corner, mengadakan turnamen Tekken 8 kecil-kecilan.",
    type: "minor",
    image: null,
  },
];

export default function HistoryPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Header */}
      <div className="px-4 pt-10 pb-8 sm:pt-14">
        <div className="max-w-2xl mx-auto text-center">
          <Link href="/"
            className="inline-flex items-center gap-2 text-sm mb-10 transition-colors hover:text-tcb-red"
            style={{ color: "var(--text-faint)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Kembali
          </Link>
          <div className="w-10 h-0.5 bg-tcb-red mx-auto mb-5" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3"
            style={{ color: "var(--text-primary)" }}>
            Sejarah <span className="text-tcb-red">TCB</span>
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-faint)" }}>
            Perjalanan komunitas fighting game terbaik di Bojonegoro.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Garis vertikal */}
            <div className="absolute top-0 bottom-0 w-px left-[7px] md:left-1/2 md:-translate-x-1/2"
              style={{ backgroundColor: "var(--border)" }} />

            <div className="flex flex-col">
              {timelineEvents.map((event, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div key={event.date + event.title} className="relative flex mb-8 md:mb-10">
                    {/* Mobile: titik + card */}
                    <div className="md:hidden flex gap-4 items-start w-full">
                      <div className="flex flex-col items-center mt-1.5 shrink-0">
                        <Dot event={event} />
                      </div>
                      <div className="flex-1">
                        <TimelineCard event={event} />
                      </div>
                    </div>

                    {/* Desktop: zigzag */}
                    <div className={`hidden md:flex w-1/2 pr-10 justify-end ${!isLeft ? "invisible" : ""}`}>
                      {isLeft && <div className="w-full max-w-sm"><TimelineCard event={event} /></div>}
                    </div>
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-5 z-10">
                      <Dot event={event} />
                    </div>
                    <div className={`hidden md:flex w-1/2 pl-10 justify-start ${isLeft ? "invisible" : ""}`}>
                      {!isLeft && <div className="w-full max-w-sm"><TimelineCard event={event} /></div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cap bawah */}
            <div className="flex md:justify-center ml-[3px] md:ml-0">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--border)" }} />
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
    return <span className="w-4 h-4 rounded-full border-2 border-tcb-red shrink-0"
      style={{ backgroundColor: "var(--bg-primary)" }} />;
  }
  return <span className="w-3 h-3 rounded-full border-2 shrink-0 mt-0.5"
    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-mid)" }} />;
}

function TimelineCard({ event }: { event: TimelineEvent }) {
  const isMajor = event.type === "major";

  return (
    <div
      className="w-full rounded-sm overflow-hidden border transition-colors"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: event.isLatest ? "#E01E2B" : isMajor ? "var(--border-mid)" : "var(--border)",
      }}
    >
      {/* Gambar */}
      {event.image && event.image.trim() !== "" && (
        <div className={`relative w-full overflow-hidden ${isMajor ? "h-44" : "h-28"}`}
          style={{ backgroundColor: "var(--bg-secondary)" }}>
          <Image src={event.image} alt="" fill aria-hidden
            className="object-cover scale-110 blur-lg opacity-30" />
          <Image src={event.image} alt={event.title} fill className="object-contain p-2" />
        </div>
      )}

      {/* Konten */}
      <div className={isMajor ? "p-4" : "p-3"}>
        {/* Badge tanggal */}
        <div
          className="inline-block font-black tracking-widest mb-2 px-2.5 py-0.5"
          style={{
            fontSize: isMajor ? "10px" : "9px",
            backgroundColor: event.isLatest ? "#E01E2B" : "transparent",
            color: event.isLatest ? "#fff" : isMajor ? "#E01E2B" : "var(--text-faint)",
            border: event.isLatest ? "none" : `1px solid ${isMajor ? "#E01E2B" : "var(--border-mid)"}`,
          }}
        >
          {event.date}
        </div>

        {/* Aktif */}
        {event.isLatest && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-tcb-red animate-pulse" />
            <span className="text-tcb-red text-[10px] font-bold tracking-widest uppercase">Aktif</span>
          </div>
        )}

        {/* Judul */}
        <h3
          className={`font-black tracking-tight leading-snug mb-1.5 ${isMajor ? "text-sm" : "text-xs"}`}
          style={{ color: "var(--text-primary)" }}
        >
          {event.title}
        </h3>

        {/* Deskripsi */}
        <p
          className={`leading-relaxed text-justify ${isMajor ? "text-xs" : "text-[11px]"}`}
          style={{ color: "var(--text-faint)" }}
        >
          {event.description}
        </p>
      </div>
    </div>
  );
}
