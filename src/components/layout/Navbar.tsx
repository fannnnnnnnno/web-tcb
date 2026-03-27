"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

function getAvatarUrl(avatarId: string | null | undefined): string {
  if (!avatarId) return "";
  return `/avatars/${avatarId}`;
}

const NAV_LINKS = [
  { href: "/",          label: "Beranda"   },
  { href: "/peringkat", label: "Peringkat" },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname          = usePathname();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);

  const isAdmin = session?.user.role === "ADMIN" || session?.user.role === "SUPERADMIN";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close everything on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [pathname]);

  const avatarUrl = getAvatarUrl(session?.user.avatarId);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex items-center h-[60px]",
          scrolled || menuOpen
            ? "bg-tcb-black/98 backdrop-blur-md border-b border-tcb-gray-700"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between">

          {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="TCB Logo" className="h-20 w-auto" />
        </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all",
                  pathname === l.href ? "text-tcb-red" : "text-tcb-gray-200 hover:text-white"
                )}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="px-4 py-2 rounded-lg text-sm font-semibold text-tcb-red hover:text-white transition-all">
                Admin
              </Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {!session ? (
              <Link href="/login" className="btn-red text-sm px-5 py-2">Login Member</Link>
            ) : (
              <div className="relative">
                <button onClick={() => setDropOpen(!dropOpen)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={session.user.name} className="w-8 h-8 rounded-full object-cover border-2 border-tcb-red" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-tcb-red/20 border-2 border-tcb-red flex items-center justify-center text-sm font-black text-tcb-red">
                      {session.user.name[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-tcb-white max-w-[120px] truncate">{session.user.name}</span>
                  <svg className="w-3.5 h-3.5 text-tcb-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
                    <div className="absolute right-0 top-11 w-44 bg-tcb-gray-800 border border-tcb-gray-700 rounded-xl shadow-2xl py-1 z-20">
                      <Link href="/akun" className="block px-4 py-2.5 text-sm font-medium text-tcb-gray-200 hover:text-white hover:bg-tcb-gray-700 transition-colors" onClick={() => setDropOpen(false)}>
                        Akun Saya
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" className="block px-4 py-2.5 text-sm font-medium text-tcb-red hover:bg-tcb-gray-700 transition-colors" onClick={() => setDropOpen(false)}>
                          Dashboard Admin
                        </Link>
                      )}
                      <div className="border-t border-tcb-gray-700 my-1" />
                      <button onClick={() => { signOut({ callbackUrl: "/" }); setDropOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-tcb-gray-700 transition-colors">
                        Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 text-tcb-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile full-screen menu — starts below navbar */}
      {menuOpen && (
        <div
          className="md:hidden fixed left-0 right-0 bottom-0 z-40 bg-tcb-black overflow-y-auto"
          style={{ top: "60px" }}
        >
          <div className="px-4 pt-6 pb-10 flex flex-col">

            {/* Nav links */}
            <nav className="space-y-1 mb-6">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href}
                  className={cn(
                    "block px-4 py-4 rounded-xl text-base font-semibold transition-all",
                    pathname === l.href
                      ? "bg-tcb-red/10 text-tcb-red border border-tcb-red/30"
                      : "text-tcb-gray-200 hover:bg-tcb-gray-800"
                  )}
                >
                  {l.label}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" className="block px-4 py-4 rounded-xl text-base font-semibold text-tcb-red hover:bg-tcb-gray-800 transition-all">
                  Admin
                </Link>
              )}
            </nav>

            <div className="h-px bg-tcb-gray-700 mb-6" />

            {/* Auth section */}
            {!session ? (
              <Link href="/login" className="btn-red w-full py-4 text-base">
                Login Member
              </Link>
            ) : (
              <div className="space-y-1.5">
                {/* User card */}
                <div className="flex items-center gap-3 px-4 py-3.5 bg-tcb-gray-800 border border-tcb-gray-700 rounded-xl mb-2">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={session.user.name} className="w-10 h-10 rounded-full object-cover border-2 border-tcb-red flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-tcb-red/20 border-2 border-tcb-red flex items-center justify-center font-black text-tcb-red text-sm flex-shrink-0">
                      {session.user.name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-tcb-white text-sm truncate">{session.user.name}</div>
                    <div className="text-xs text-tcb-gray-400">@{session.user.username}</div>
                  </div>
                </div>

                <Link href="/akun" className="block px-4 py-3.5 rounded-xl text-sm font-semibold text-tcb-gray-200 hover:bg-tcb-gray-800 transition-all">
                  Akun Saya
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="block px-4 py-3.5 rounded-xl text-sm font-semibold text-tcb-red hover:bg-tcb-gray-800 transition-all">
                    Dashboard Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-tcb-gray-800 transition-all"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
