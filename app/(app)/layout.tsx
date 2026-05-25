"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase";
import {
  IconChecklist, IconCoin, IconGift,
  IconUser, IconLayoutDashboard,
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { label: "Beranda",   href: "/dashboard", icon: IconLayoutDashboard },
  { label: "To Do",     href: "/todos",     icon: IconChecklist },
  { label: "Keuangan",  href: "/finance",   icon: IconCoin },
  { label: "Wishlist",  href: "/wishlist",  icon: IconGift },
  { label: "Profil",    href: "/profile",   icon: IconUser },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const loadAvatar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const localProfileStr = localStorage.getItem("notez_profile");
      if (localProfileStr) {
        const p = JSON.parse(localProfileStr);
        setAvatarUrl(p.avatar_url || null);
      }
      return;
    }
    const { data } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle();
    if (data?.avatar_url) {
      setAvatarUrl(data.avatar_url);
    } else {
      setAvatarUrl(null);
    }
  };

  useEffect(() => {
    loadAvatar();
    window.addEventListener("profileUpdated", loadAvatar);
    return () => window.removeEventListener("profileUpdated", loadAvatar);
  }, []);

  // Label halaman aktif untuk subjudul
  const currentLabel = NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.label || "Beranda";

  async function handleNavClick(href: string) {
    // Bypass pengecekan sesi login sementara untuk testing UI Profile
    // if (href === "/profile") {
    //   const { data: { user } } = await supabase.auth.getUser();
    //   if (!user) {
    //     router.push("/login");
    //     return;
    //   }
    // }
    router.push(href);
  }

  return (
    <div className="min-h-screen bg-nb-bg flex">

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-56 border-r-2 border-nb-black bg-white fixed top-0 left-0 h-screen z-40">

        {/* Logo */}
        <div className="border-b-2 border-nb-black p-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo_app.svg" alt="NoteZ" className="w-8 h-8" />
            <span className="font-black text-lg tracking-tight">NoteZ</span>
          </div>
          {/* Subjudul halaman aktif */}
          <div className="mt-1.5 ml-0.5 text-xs font-bold text-nb-black/40 uppercase tracking-widest">
            {currentLabel}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <button
                key={href}
                onClick={() => handleNavClick(href)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  border-2 font-bold text-sm text-left w-full
                  transition-all duration-100
                  ${active
                    ? "bg-nb-yellow border-nb-black shadow-[2px_2px_0px_#0A0A0A] border-l-4 border-l-nb-black"
                    : "border-transparent border-l-4 hover:bg-gray-50 hover:border-nb-black/20"
                  }
                `}
              >
              {href === "/profile" && avatarUrl ? (
                <img src={avatarUrl} alt="Profil" className="w-5 h-5 rounded-full object-cover border border-nb-black shadow-[1px_1px_0px_#0A0A0A]" />
              ) : (
                <Icon size={18} />
              )}
                {label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t-2 border-nb-black p-4">
          <div className="text-xs font-bold text-nb-black/30 text-center">v1.1</div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 md:ml-56 pb-20 md:pb-0">
        {children}
      </main>

      {/* ── Bottom Bar (mobile) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-nb-black flex">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <button
              key={href}
              onClick={() => handleNavClick(href)}
              className={`
                flex-1 flex flex-col items-center justify-center py-2.5 gap-1
                text-xs font-bold transition-all
                ${active
                  ? "text-nb-black bg-nb-yellow border-t-4 border-nb-black"
                  : "border-t-4 border-transparent text-nb-black/40 hover:text-nb-black/60"
                }
              `}
            >
            {href === "/profile" && avatarUrl ? (
              <img src={avatarUrl} alt="Profil" className="w-[22px] h-[22px] rounded-full object-cover border border-nb-black shadow-[1px_1px_0px_#0A0A0A]" />
            ) : (
              <Icon size={20} />
            )}
              <span className="text-[10px]">{label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}