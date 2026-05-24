"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  IconBolt, IconChecklist, IconCoin, IconGift,
  IconUser, IconLayoutDashboard,
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: IconLayoutDashboard },
  { label: "To Do",     href: "/todos",     icon: IconChecklist },
  { label: "Keuangan",  href: "/finance",   icon: IconCoin },
  { label: "Wishlist",  href: "/wishlist",  icon: IconGift },
  { label: "Profil",    href: "/profile",   icon: IconUser },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-nb-bg flex">

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-56 border-r-2 border-nb-black bg-white fixed top-0 left-0 h-screen z-40">

        {/* Logo */}
        <div className="border-b-2 border-nb-black p-4 flex items-center gap-2.5">
          <div className="bg-nb-yellow border-2 border-nb-black rounded-lg p-1.5">
            <IconBolt size={18} className="text-nb-black" />
          </div>
          <span className="font-black text-lg tracking-tight">NubApp</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  border-2 font-bold text-sm text-left w-full
                  transition-all duration-100
                  ${active
                    ? "bg-nb-yellow border-nb-black shadow-[2px_2px_0px_#0A0A0A]"
                    : "border-transparent hover:bg-gray-50 hover:border-nb-black/20"
                  }
                `}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t-2 border-nb-black p-4">
          <div className="text-xs font-bold text-nb-black/30 text-center">v1.0</div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 md:ml-56 pb-20 md:pb-0">
        {children}
      </main>

      {/* ── Bottom Bar (mobile) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-nb-black flex">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`
                flex-1 flex flex-col items-center justify-center py-2.5 gap-1
                text-xs font-bold transition-all
                ${active ? "text-nb-black bg-nb-yellow" : "text-nb-black/40"}
              `}
            >
              <Icon size={20} />
              <span className="text-[10px]">{label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}