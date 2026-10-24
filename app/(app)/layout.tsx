"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, createClient } from "@/app/lib/supabase";
import {
  IconChecklist, IconCoin, IconGift,
  IconUser, IconLayoutDashboard,
} from "@tabler/icons-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Toaster } from "react-hot-toast";

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    async function fetchAvatar() {
      try {
        const user = await getCurrentUser();
        if (!isMounted) return;
        setUserId(user?.id);

        if (!user) {
          const localProfileStr = localStorage.getItem("notez_profile");
          if (localProfileStr) {
            try {
              const p = JSON.parse(localProfileStr);
              setAvatarUrl(p.avatar_url || null);
            } catch {
              setAvatarUrl(null);
            }
          }
          return;
        }

        try {
          const supabase = createClient();
          const { data } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle();
          if (!isMounted) return;
          setAvatarUrl(data?.avatar_url || null);
        } catch {
          // offline
        }
      } catch (err) {
        console.warn("Offline or Supabase unreachable in layout:", err);

        if (!isMounted) return;
        const localProfileStr = localStorage.getItem("notez_profile");
        if (localProfileStr) {
          try {
            const p = JSON.parse(localProfileStr);
            setAvatarUrl(p.avatar_url || null);
          } catch {
            setAvatarUrl(null);
          }
        }
      }
    }


    fetchAvatar();

    const handleUpdate = () => {
      fetchAvatar();
    };

    window.addEventListener("profileUpdated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("profileUpdated", handleUpdate);
    };
  }, []);

  // Label halaman aktif untuk subjudul
  const currentLabel = NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.label || "Beranda";

  async function handleNavClick(href: string) {
    router.push(href);
  }

  return (
    <div className="min-h-screen bg-nb-bg flex flex-col md:flex-row">
      <Toaster position="top-right" />

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-56 border-r-2 border-nb-black bg-white fixed top-0 left-0 h-screen z-40">

        {/* Logo & Notifikasi */}
        <div className="border-b-2 border-nb-black p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo_app.svg" alt="NoteZ" className="w-8 h-8" />
              <span className="font-black text-lg tracking-tight">NoteZ</span>
            </div>
            <NotificationBell userId={userId} />
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
                  transition-all duration-100 cursor-pointer
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

      {/* ── Main Content Container ── */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* ── Top Bar (mobile) ── */}
        <header className="md:hidden sticky top-0 left-0 right-0 z-30 bg-white border-b-2 border-nb-black px-4 py-2.5 flex items-center justify-between shadow-[0px_2px_0px_#0A0A0A]">
          <div className="flex items-center gap-2">
            <img src="/logo_app.svg" alt="NoteZ" className="w-7 h-7" />
            <span className="font-black text-base tracking-tight">NoteZ</span>
            <span className="text-[10px] font-black uppercase text-nb-black/50 px-1.5 py-0.5 bg-nb-yellow/40 rounded border border-nb-black/20">
              {currentLabel}
            </span>
          </div>
          <NotificationBell userId={userId} />
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>


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