"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn, getAvatarUrl } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/",          label: "Beranda"   },
  { href: "/peringkat", label: "Peringkat" },
];

function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
        "border hover:border-tcb-red",
        className
      )}
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--bg-card)",
      }}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E01E2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E01E2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}

export function Navbar() {
  const { data: session }               = useSession();
  const { theme }                       = useTheme();
  const pathname                        = usePathname();
  const [scrolled,  setScrolled]        = useState(false);
  const [menuOpen,  setMenuOpen]        = useState(false);
  const [dropOpen,  setDropOpen]        = useState(false);
  const [mounted,   setMounted]         = useState(false);

  const isAdmin = session?.user.role === "ADMIN" || session?.user.role === "SUPERADMIN";
  const isDark  = !mounted || theme === "dark";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [pathname]);

  const avatarUrl = getAvatarUrl(session?.user.avatarId);

  // Glass effect styles
  const glassStyle = scrolled || menuOpen ? {
    backgroundColor: isDark
      ? "rgba(10,10,10,0.75)"
      : "rgba(251,245,247,0.75)",
    backdropFilter: "blur(16px) saturate(180%)",
    WebkitBackdropFilter: "blur(16px) saturate(180%)",
    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
    boxShadow: isDark
      ? "0 4px 24px rgba(0,0,0,0.4)"
      : "0 4px 24px rgba(0,0,0,0.08)",
  } : {
    backgroundColor: "transparent",
    backdropFilter: "none",
    WebkitBackdropFilter: "none",
    borderBottom: "1px solid transparent",
    boxShadow: "none",
  };

  // Warna teks nav link
  const navTextColor = (isActive: boolean) => {
    if (isActive) return "#E01E2B";
    return isDark ? "#CCCCCC" : "#3a3030";
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center h-[60px] transition-all duration-300"
        style={glassStyle}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="TCB Logo"
              width={80}
              height={80}
              className="h-20 w-auto transition-all duration-300"
              style={{
                filter: !isDark
                  ? "drop-shadow(0 1px 3px rgba(0,0,0,0.25)) drop-shadow(0 0 1px rgba(0,0,0,0.15))"
                  : "none",
              }}
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className="px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200"
                style={{ color: navTextColor(pathname === l.href) }}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin"
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{ color: navTextColor(pathname.startsWith("/admin")) }}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Desktop: auth + toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {!session ? (
              <Link href="/login" className="btn-red text-sm px-5 py-2">Login Member</Link>
            ) : (
              <div className="relative">
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={session.user.name ?? ""} loading="lazy"
                      className="w-8 h-8 rounded-full object-cover border-2 border-tcb-red" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-tcb-red/20 border-2 border-tcb-red flex items-center justify-center text-sm font-black text-tcb-red">
                      {session.user.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <span className="text-sm font-semibold max-w-[120px] truncate"
                    style={{ color: "var(--text-primary)" }}>
                    {session.user.name}
                  </span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    style={{ color: "var(--text-faint)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
                    <div className="absolute right-0 top-11 w-44 rounded-xl shadow-2xl py-1 z-20 border"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
                      <Link href="/akun"
                        className="block px-4 py-2.5 text-sm font-medium transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onClick={() => setDropOpen(false)}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-card-hover)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
                        Akun Saya
                      </Link>
                      {isAdmin && (
                        <Link href="/admin"
                          className="block px-4 py-2.5 text-sm font-medium text-tcb-red transition-colors"
                          onClick={() => setDropOpen(false)}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-card-hover)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
                          Dashboard Admin
                        </Link>
                      )}
                      <div className="my-1" style={{ borderTop: "1px solid var(--border)" }} />
                      <button onClick={() => { signOut({ callbackUrl: "/" }); setDropOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-400 transition-colors"
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-card-hover)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
                        Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile: toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button className="p-2 transition-colors" onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu" style={{ color: "var(--text-primary)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu — glass effect */}
      {menuOpen && (
        <div
          className="md:hidden fixed left-0 right-0 bottom-0 z-40 overflow-y-auto"
          style={{
            top: "60px",
            backgroundColor: isDark ? "rgba(10,10,10,0.95)" : "rgba(251,245,247,0.95)",
            backdropFilter: "blur(16px) saturate(180%)",
            WebkitBackdropFilter: "blur(16px) saturate(180%)",
            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          }}
        >
          <div className="px-4 pt-6 pb-10 flex flex-col">
            <nav className="space-y-1 mb-6">
              {NAV_LINKS.map((l) => {
                const isActive = pathname === l.href;
                return (
                  <Link key={l.href} href={l.href}
                    className="block px-4 py-4 rounded-xl text-base font-semibold transition-all"
                    style={{
                      color: isActive ? "#E01E2B" : "var(--text-muted)",
                      backgroundColor: isActive ? "rgba(224,30,43,0.08)" : "transparent",
                      border: isActive ? "1px solid rgba(224,30,43,0.3)" : "1px solid transparent",
                    }}
                  >
                    {l.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link href="/admin"
                  className="block px-4 py-4 rounded-xl text-base font-semibold transition-all"
                  style={{
                    color: pathname.startsWith("/admin") ? "#E01E2B" : "var(--text-muted)",
                    backgroundColor: pathname.startsWith("/admin") ? "rgba(224,30,43,0.08)" : "transparent",
                    border: pathname.startsWith("/admin") ? "1px solid rgba(224,30,43,0.3)" : "1px solid transparent",
                  }}
                >
                  Admin
                </Link>
              )}
            </nav>

            <div className="h-px mb-6" style={{ backgroundColor: "var(--border)" }} />

            {!session ? (
              <Link href="/login" className="btn-red w-full py-4 text-base">Login Member</Link>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl mb-2 border"
                  style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={session.user.name ?? ""} loading="lazy"
                      className="w-10 h-10 rounded-full object-cover border-2 border-tcb-red flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-tcb-red/20 border-2 border-tcb-red flex items-center justify-center font-black text-tcb-red text-sm flex-shrink-0">
                      {session.user.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                      {session.user.name}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-faint)" }}>
                      @{session.user.username}
                    </div>
                  </div>
                </div>
                <Link href="/akun"
                  className="block px-4 py-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ color: "var(--text-muted)" }}>
                  Akun Saya
                </Link>
                {isAdmin && (
                  <Link href="/admin"
                    className="block px-4 py-3.5 rounded-xl text-sm font-semibold text-tcb-red transition-all">
                    Dashboard Admin
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold text-red-400 transition-all">
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
