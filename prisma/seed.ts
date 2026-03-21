import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TCB database...");

  // Superadmin
  await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      username: "superadmin",
      password: await bcrypt.hash("superadmin123", 12),
      name: "Super Admin",
      role: "SUPERADMIN",
      totalPoints: 0,
    },
  });

  // Admin
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: await bcrypt.hash("admin123", 12),
      name: "Admin TCB",
      role: "ADMIN",
      totalPoints: 0,
    },
  });

  // Sample members
  const members = [
    { username: "rajawali99",  name: "Rajawali",    points: 4200 },
    { username: "naga_merah",  name: "Naga Merah",  points: 3800 },
    { username: "elang_biru",  name: "Elang Biru",  points: 3100 },
    { username: "harimau01",   name: "Harimau",     points: 2700 },
    { username: "garuda_emas", name: "Garuda Emas", points: 2300 },
    { username: "singa_putih", name: "Singa Putih", points: 1900 },
    { username: "macan_tutul", name: "Macan Tutul", points: 1500 },
    { username: "kancil_cepat",name: "Kancil Cepat",points: 1100 },
    { username: "banteng_baja",name: "Banteng Baja", points: 800 },
    { username: "rusa_perak",  name: "Rusa Perak",  points: 450  },
  ];

  for (const m of members) {
    await prisma.user.upsert({
      where: { username: m.username },
      update: {},
      create: {
        username: m.username,
        password: await bcrypt.hash("member123", 12),
        name: m.name,
        role: "MEMBER",
        totalPoints: m.points,
      },
    });
  }

  // Sample badges
  const badges = [
    { name: "Pendiri",      description: "Member pendiri komunitas TCB" },
    { name: "Top Performer",description: "Meraih poin tertinggi bulan ini" },
    { name: "Aktif",        description: "Aktif mengikuti kegiatan komunitas" },
  ];
  for (const b of badges) {
    await prisma.badge.upsert({
      where: { id: b.name },
      update: {},
      create: b,
    }).catch(() => prisma.badge.create({ data: b }));
  }

  // Sample agendas
  const now = new Date();
  await prisma.agenda.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "Gathering Bulanan TCB",
        description: "Pertemuan rutin bulanan seluruh member TCB. Silaturahmi dan diskusi program ke depan.",
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        location: "Sekretariat TCB, Jl. Contoh No. 1",
        locationType: "OFFLINE",
        mapsUrl: "https://maps.google.com",
        isPublished: true,
      },
      {
        title: "Webinar Kepemimpinan",
        description: "Sesi online membahas kepemimpinan dan pengembangan diri.",
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        locationType: "ONLINE",
        location: "Zoom Meeting",
        isPublished: true,
      },
      {
        title: "Turnamen Internal #3",
        description: "Kompetisi internal antar member TCB. Pemenang mendapatkan poin dan badge eksklusif.",
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        location: "GOR Serbaguna, Jl. Contoh No. 5",
        locationType: "OFFLINE",
        mapsUrl: "https://maps.google.com",
        isPublished: true,
      },
    ],
  });

  console.log("✅ Seed selesai!");
  console.log("   superadmin / superadmin123");
  console.log("   admin      / admin123");
  console.log("   rajawali99 / member123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
