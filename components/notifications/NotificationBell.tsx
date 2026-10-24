"use client";

import { useEffect, useState } from "react";
import { NotificationItem, getNotifications } from "@/app/lib/storage";
import { checkAndTriggerSmartNotifications } from "@/app/lib/notificationEngine";
import { IconBell } from "@tabler/icons-react";
import NotificationDrawer from "./NotificationDrawer";
import NotificationSettingsModal from "./NotificationSettingsModal";

interface Props {
  userId?: string;
  className?: string;
}

export default function NotificationBell({ userId, className = "" }: Props) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    function refresh() {
      setNotifications(getNotifications(userId));
    }

    refresh();
    // Jalankan pengecekan notifikasi cerdas saat komponen dimuat
    checkAndTriggerSmartNotifications(userId);

    // Dengar event saat notifikasi diperbarui di storage
    window.addEventListener("notificationsUpdated", refresh);

    // Cek berkala setiap 60 detik untuk mendeteksi deadline tugas yang baru masuk
    const interval = setInterval(() => {
      checkAndTriggerSmartNotifications(userId);
    }, 60000);

    return () => {
      window.removeEventListener("notificationsUpdated", refresh);
      clearInterval(interval);
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className={`relative p-2 rounded-xl border-2 border-nb-black bg-white hover:bg-nb-yellow transition-all duration-100 cursor-pointer shadow-[2px_2px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center ${className}`}
        title="Notifikasi"
        aria-label="Pusat Notifikasi"
      >
        <IconBell
          size={20}
          className={`text-nb-black transition-transform ${
            unreadCount > 0 ? "animate-wiggle" : ""
          }`}
        />

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-nb-pink text-white text-[11px] font-black rounded-full border-2 border-nb-black shadow-[1px_1px_0px_#0A0A0A] flex items-center justify-center animate-bounce-short">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Drawer */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        userId={userId}
        onOpenSettings={() => {
          setIsDrawerOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      {/* Settings Modal */}
      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userId={userId}
      />
    </>
  );
}
