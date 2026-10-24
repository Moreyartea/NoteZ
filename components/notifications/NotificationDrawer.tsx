"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  NotificationItem,
  NotificationType,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/app/lib/storage";
import {
  IconX,
  IconCheck,
  IconTrash,
  IconSettings,
  IconChecklist,
  IconCoin,
  IconGift,
  IconBell,
  IconExternalLink,
  IconInbox,
} from "@tabler/icons-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  userId?: string;
  onOpenSettings: () => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  userId,
  onOpenSettings,
}: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread" | NotificationType>("all");

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "all") return true;
    return n.type === filter;
  });

  function handleItemClick(item: NotificationItem) {
    if (!item.is_read) {
      markNotificationAsRead(item.id, userId);
    }
    if (item.link) {
      onClose();
      router.push(item.link);
    }
  }

  function handleMarkAllRead() {
    markAllNotificationsAsRead(userId);
  }

  function handleClearAll() {
    if (window.confirm("Hapus semua riwayat notifikasi?")) {
      clearAllNotifications(userId);
    }
  }

  function formatRelativeTime(dateString: string) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Baru saja";
      if (diffMins < 60) return `${diffMins} mnt lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return "Kemarin";
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  }

  const categoryIcons = {
    todo: <IconChecklist size={16} className="text-nb-black" />,
    wishlist: <IconGift size={16} className="text-white" />,
    finance: <IconCoin size={16} className="text-nb-black" />,
    system: <IconBell size={16} className="text-white" />,
  };

  const categoryBadgeColors = {
    todo: "bg-nb-yellow border-nb-black",
    wishlist: "bg-nb-pink border-nb-black text-white",
    finance: "bg-nb-green border-nb-black",
    system: "bg-nb-blue border-nb-black text-white",
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-md h-full bg-nb-bg border-l-3 border-nb-black shadow-[-6px_0px_0px_#0A0A0A] flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 bg-white border-b-3 border-nb-black">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-nb-yellow border-2 border-nb-black rounded-xl shadow-[2px_2px_0px_#0A0A0A]">
                <IconBell size={20} className="text-nb-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-lg text-nb-black leading-none">
                    Pusat Notifikasi
                  </h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-black bg-nb-pink text-white rounded-full border-2 border-nb-black shadow-[1px_1px_0px_#0A0A0A]">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-nb-black/50 mt-0.5">
                  Pengingat tugas, tabungan, & keuangan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenSettings}
                className="p-2 bg-white hover:bg-neutral-100 border-2 border-nb-black rounded-lg shadow-[2px_2px_0px_#0A0A0A] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                title="Pengaturan Notifikasi"
              >
                <IconSettings size={18} />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white hover:bg-nb-pink hover:text-white border-2 border-nb-black rounded-lg shadow-[2px_2px_0px_#0A0A0A] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                title="Tutup"
              >
                <IconX size={18} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-black">
            {[
              { id: "all", label: "Semua" },
              { id: "unread", label: `Belum Dibaca (${unreadCount})` },
              { id: "todo", label: "Tugas" },
              { id: "finance", label: "Keuangan" },
              { id: "wishlist", label: "Wishlist" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg border-2 whitespace-nowrap cursor-pointer transition-all ${
                  filter === tab.id
                    ? "bg-nb-black text-white border-nb-black shadow-[2px_2px_0px_#FFE135]"
                    : "bg-white text-nb-black border-nb-black hover:bg-neutral-100 shadow-[1px_1px_0px_#0A0A0A]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick action bar */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-nb-yellow/40 border-b-2 border-nb-black flex items-center justify-between text-xs font-bold">
            <span className="text-nb-black/70">
              Menampilkan {filteredNotifications.length} notifikasi
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-nb-black font-black hover:underline cursor-pointer"
              >
                <IconCheck size={14} />
                Tandai semua dibaca
              </button>
            )}
          </div>
        )}

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-white border-3 border-nb-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#0A0A0A] mb-3">
                <IconInbox size={32} className="text-nb-black/40" />
              </div>
              <h4 className="font-black text-base text-nb-black">Tidak Ada Notifikasi</h4>
              <p className="text-xs text-nb-black/60 font-medium max-w-xs mt-1">
                {filter === "unread"
                  ? "Semua notifikasi sudah dibaca!"
                  : "Semua tugas dan target Anda terkendali dengan baik. 🎉"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`relative group p-3.5 rounded-xl border-2 border-nb-black transition-all cursor-pointer ${
                  !item.is_read
                    ? "bg-white shadow-[4px_4px_0px_#0A0A0A] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    : "bg-neutral-50/80 opacity-80 hover:opacity-100 shadow-[2px_2px_0px_#0A0A0A]"
                }`}
              >
                {/* Unread indicator */}
                {!item.is_read && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-nb-pink border border-nb-black shadow-[1px_1px_0px_#0A0A0A]" />
                )}

                <div className="flex items-start gap-3">
                  {/* Category Icon */}
                  <div
                    className={`p-2 rounded-lg border-2 shadow-[1px_1px_0px_#0A0A0A] shrink-0 ${
                      categoryBadgeColors[item.type] || "bg-white border-nb-black"
                    }`}
                  >
                    {categoryIcons[item.type] || <IconBell size={16} />}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-sm text-nb-black leading-tight">
                        {item.title}
                      </span>
                      {item.priority === "urgent" && (
                        <span className="px-1.5 py-0.2 bg-red-100 text-red-700 border border-red-400 rounded text-[10px] font-black">
                          Mendesak
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-nb-black/80 font-medium mt-1 leading-snug">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-nb-black/50">
                      <span>{formatRelativeTime(item.created_at)}</span>
                      {item.link && (
                        <span className="flex items-center gap-0.5 text-nb-blue hover:underline">
                          Lihat detail <IconExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id, userId);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 rounded border border-transparent hover:border-nb-black transition-all cursor-pointer"
                    title="Hapus"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-white border-t-3 border-nb-black flex items-center justify-between">
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-600 rounded-lg transition-colors cursor-pointer"
            >
              <IconTrash size={14} />
              Hapus Semua Riwayat
            </button>
            <span className="text-[11px] font-bold text-nb-black/40">
              Maksimal 100 tersimpan
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
