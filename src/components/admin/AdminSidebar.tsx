"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin",              label: "Dashboard",    icon: "▦", super: false },
  { href: "/admin/members",      label: "Member",       icon: "◉", super: false },
  { href: "/admin/bulk-points",  label: "Input Poin",   icon: "◈", super: false },
  { href: "/admin/agendas",      label: "Agenda",       icon: "◈", super: false },
  { href: "/admin/badges",       label: "Lencana",      icon: "◆", super: false },
  { href: "/admin/avatars",      label: "Avatar",       icon: "◎", super: true  },
];

export function AdminSidebar({ role, name }: { role: string; name: string }) {
  const pathname     = usePathname();
  const isSuperAdmin = role === "SUPERADMIN";
  const visible      = NAV.filter((n) => !n.super || isSuperAdmin);
  const [open, setOpen] = useState(false);

  const NavLinks = () => (
    <>
      {visible.map((item) => {
        const active = item.href === "/admin"
          ? pathname === "/admin"
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
              active
                ? "bg-tcb-red/20 text-tcb-red border border-tcb-red/30"
                : "text-tcb-gray-400 hover:text-white hover:bg-tcb-gray-700"
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 min-h-screen bg-tcb-gray-900 border-r border-tcb-gray-700 flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-tcb-gray-700">
          <Link href="/" className="text-tcb-red font-black text-xl tracking-widest">TCB</Link>
          <div className="text-xs text-tcb-gray-400 mt-1">Admin Panel</div>
          <div className="text-xs text-tcb-gray-200 font-semibold truncate mt-0.5">{name}</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavLinks />
        </nav>
        <div className="px-3 py-4 border-t border-tcb-gray-700 space-y-1.5">
          <Link href="/" className="btn-ghost w-full text-sm py-2 justify-start">← Ke Situs</Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-tcb-gray-700 rounded-lg transition-colors font-semibold"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-tcb-gray-900 border-b border-tcb-gray-700 flex items-center justify-between px-4 h-14">
        <Link href="/" className="text-tcb-red font-black text-lg tracking-widest">TCB</Link>
        <span className="text-xs text-tcb-gray-400 font-semibold">Admin</span>
        <button onClick={() => setOpen(!open)} className="text-tcb-white p-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/70" onClick={() => setOpen(false)} />
          <div className="md:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-tcb-gray-900 border-r border-tcb-gray-700 flex flex-col overflow-y-auto">
            <div className="px-4 py-4 border-b border-tcb-gray-700">
              <div className="text-xs text-tcb-gray-400">Masuk sebagai</div>
              <div className="text-sm text-tcb-white font-semibold">{name}</div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              <NavLinks />
            </nav>
            <div className="px-3 py-4 border-t border-tcb-gray-700 space-y-1.5">
              <Link href="/" onClick={() => setOpen(false)} className="btn-ghost w-full text-sm py-2 justify-start">← Ke Situs</Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-tcb-gray-700 rounded-lg transition-colors font-semibold"
              >
                Keluar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile spacer */}
      <div className="md:hidden h-14 flex-shrink-0 w-0" />
    </>
  );
}
