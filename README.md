# TCB Community Web

Web komunitas TCB — hitam, putih, merah. Dibangun dengan Next.js 15, Prisma, NextAuth.

## Stack
- **Next.js 15** + TypeScript + App Router
- **Tailwind CSS** + font Montserrat
- **Prisma** + SQLite (dev) → PostgreSQL (prod)
- **NextAuth.js** — credentials only (username + password)
- **Framer Motion** — animasi hero parallax

## Fitur

### Publik
- Hero section dengan efek parallax
- Tentang Kami
- Agenda (dengan detail lokasi + Google Maps embed)
- Papan Peringkat — podium top 3, list 4–10, halaman berikutnya

### Member (login)
- Halaman Akun — ganti avatar, lihat poin, lencana, riwayat poin
- Tidak ada self-register — akun dibuat admin

### Admin Panel `/admin`
| Fitur           | Admin | Superadmin |
|-----------------|-------|------------|
| Tambah member   | ✓     | ✓          |
| Edit poin       | ✓     | ✓          |
| Beri lencana    | ✓     | ✓          |
| Hapus member    | ✓     | ✓          |
| Kelola agenda   | ✓     | ✓          |
| Kelola lencana  | ✓     | ✓          |
| Upload avatar   | ✗     | ✓          |
| Hapus avatar    | ✗     | ✓          |

## Cara Jalankan

```bash
# 1. Install
npm install

# 2. Env
cp .env.example .env.local
cp .env.example .env
# Edit keduanya — isi NEXTAUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 3. Database
npm run db:migrate   # ketik "init" saat diminta nama migrasi
npm run db:seed

# 4. Dev
npm run dev
```

Buka http://localhost:3000

## Akun Default
| Role       | Username    | Password       |
|------------|-------------|----------------|
| Superadmin | superadmin  | superadmin123  |
| Admin      | admin       | admin123       |
| Member     | rajawali99  | member123      |

## Deploy ke Production

1. Ganti SQLite → PostgreSQL di `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Set environment variables di Vercel:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — string random baru
- `NEXTAUTH_URL` — URL production

3. Deploy:
```bash
npx vercel deploy
```

## Struktur Penting
```
src/
├── app/
│   ├── page.tsx              # Beranda (hero + tentang + agenda)
│   ├── login/page.tsx        # Login username+password
│   ├── peringkat/page.tsx    # Leaderboard + podium
│   ├── akun/page.tsx         # Profil member
│   ├── admin/                # Dashboard admin
│   └── api/                  # API routes
├── components/
│   ├── layout/               # Navbar, HeroSection, AgendaSection
│   ├── akun/                 # AvatarPicker
│   └── admin/                # Semua komponen admin
├── lib/
│   ├── auth.ts               # NextAuth config
│   ├── prisma.ts             # Prisma singleton
│   └── utils.ts              # Helper functions
└── middleware.ts              # Route protection
```
