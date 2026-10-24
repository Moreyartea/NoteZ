"use client";

import { useEffect, useState } from "react";
import {
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
} from "@/app/lib/storage";
import {
  requestDeviceNotificationPermission,
  getDeviceNotificationPermissionState,
  dispatchNotification,
} from "@/app/lib/pushService";
import {
  IconX,
  IconBell,
  IconChecklist,
  IconGift,
  IconCoin,
  IconDeviceMobile,
  IconSend,
  IconCheck,
} from "@tabler/icons-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export default function NotificationSettingsModal({ isOpen, onClose, userId }: Props) {
  const [settings, setSettings] = useState<NotificationSettings>(() => getNotificationSettings(userId));
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">(() =>
    getDeviceNotificationPermissionState()
  );
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    function handleSync() {
      setSettings(getNotificationSettings(userId));
      setPermissionState(getDeviceNotificationPermissionState());
    }

    window.addEventListener("notificationSettingsUpdated", handleSync);
    return () => {
      window.removeEventListener("notificationSettingsUpdated", handleSync);
    };
  }, [userId]);

  if (!isOpen) return null;

  async function handleToggleDevicePush() {
    if (!settings.devicePushEnabled) {
      const granted = await requestDeviceNotificationPermission();
      setPermissionState(getDeviceNotificationPermissionState());
      const updated = { ...settings, devicePushEnabled: granted };
      setSettings(updated);
      saveNotificationSettings(updated, userId);
    } else {
      const updated = { ...settings, devicePushEnabled: false };
      setSettings(updated);
      saveNotificationSettings(updated, userId);
    }
  }

  function handleToggleSetting(key: keyof Omit<NotificationSettings, "devicePushEnabled">) {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveNotificationSettings(updated, userId);
  }

  function handleSendTest() {
    dispatchNotification({
      title: "🎉 Uji Coba Notifikasi NoteZ",
      body: "Fitur notifikasi Anda sudah aktif dan bekerja dengan sempurna!",
      onClickUrl: "/dashboard",
      priority: "normal",
      showToast: true,
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white border-3 border-nb-black rounded-2xl shadow-[6px_6px_0px_#0A0A0A] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-nb-yellow border-b-3 border-nb-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white border-2 border-nb-black rounded-lg shadow-[2px_2px_0px_#0A0A0A]">
              <IconBell size={18} className="text-nb-black" />
            </div>
            <div>
              <h3 className="font-black text-base leading-none text-nb-black">
                Pengaturan Notifikasi
              </h3>
              <p className="text-[11px] font-bold text-nb-black/60 mt-0.5">
                Kelola izin dan preferensi pemberitahuan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white hover:bg-nb-pink hover:text-white border-2 border-nb-black rounded-lg transition-colors cursor-pointer shadow-[2px_2px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5"
            title="Tutup"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Izin Notifikasi Perangkat */}
          <div className="p-3.5 bg-nb-bg border-2 border-nb-black rounded-xl shadow-[3px_3px_0px_#0A0A0A]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 bg-nb-blue text-white border-2 border-nb-black rounded-lg shrink-0 mt-0.5">
                  <IconDeviceMobile size={18} />
                </div>
                <div>
                  <div className="font-black text-sm text-nb-black">
                    Notifikasi Sistem / Browser
                  </div>
                  <div className="text-xs text-nb-black/70 font-medium mt-0.5 leading-relaxed">
                    Tampilkan pop-up notifikasi perangkat saat deadline tiba.
                  </div>
                  <div className="mt-2 text-[11px] font-bold">
                    Status Izin:{" "}
                    {permissionState === "granted" ? (
                      <span className="text-green-700 bg-green-100 px-1.5 py-0.5 rounded border border-green-400">
                        Diizinkan
                      </span>
                    ) : permissionState === "denied" ? (
                      <span className="text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-400">
                        Diblokir di Browser
                      </span>
                    ) : (
                      <span className="text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded border border-yellow-400">
                        Belum Diatur
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleDevicePush}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-nb-black transition-colors duration-200 ease-in-out ${
                  settings.devicePushEnabled ? "bg-nb-green" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white border border-nb-black shadow transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                    settings.devicePushEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Kategori Notifikasi */}
          <div className="space-y-2">
            <div className="text-xs font-black text-nb-black uppercase tracking-wider px-1">
              Preferensi Kategori
            </div>

            {/* To-Do */}
            <div className="flex items-center justify-between p-3 bg-white border-2 border-nb-black rounded-xl shadow-[2px_2px_0px_#0A0A0A]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-nb-yellow border-2 border-nb-black rounded-lg">
                  <IconChecklist size={16} className="text-nb-black" />
                </div>
                <div>
                  <div className="font-bold text-xs text-nb-black">Pengingat To-Do</div>
                  <div className="text-[11px] text-nb-black/60 font-medium">
                    Deadline hari ini & tugas terlewat
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.todoReminders}
                onChange={() => handleToggleSetting("todoReminders")}
                className="w-4 h-4 accent-nb-black cursor-pointer"
              />
            </div>

            {/* Wishlist */}
            <div className="flex items-center justify-between p-3 bg-white border-2 border-nb-black rounded-xl shadow-[2px_2px_0px_#0A0A0A]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-nb-pink border-2 border-nb-black rounded-lg">
                  <IconGift size={16} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-xs text-nb-black">Milestone Wishlist</div>
                  <div className="text-[11px] text-nb-black/60 font-medium">
                    Target tabungan tercapai & progress 50%/75%
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.wishlistMilestones}
                onChange={() => handleToggleSetting("wishlistMilestones")}
                className="w-4 h-4 accent-nb-black cursor-pointer"
              />
            </div>

            {/* Keuangan */}
            <div className="flex items-center justify-between p-3 bg-white border-2 border-nb-black rounded-xl shadow-[2px_2px_0px_#0A0A0A]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-nb-green border-2 border-nb-black rounded-lg">
                  <IconCoin size={16} className="text-nb-black" />
                </div>
                <div>
                  <div className="font-bold text-xs text-nb-black">Pengingat Keuangan</div>
                  <div className="text-[11px] text-nb-black/60 font-medium">
                    Peringatan defisit & evaluasi harian
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.financeReminders}
                onChange={() => handleToggleSetting("financeReminders")}
                className="w-4 h-4 accent-nb-black cursor-pointer"
              />
            </div>
          </div>

          {/* Tombol Uji Coba */}
          <div className="pt-2">
            <button
              onClick={handleSendTest}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-nb-black text-white hover:bg-neutral-800 font-black text-xs uppercase tracking-wider rounded-xl border-2 border-nb-black shadow-[3px_3px_0px_#FFE135] transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              {testSent ? (
                <>
                  <IconCheck size={16} className="text-nb-green" />
                  Notifikasi Terkirim!
                </>
              ) : (
                <>
                  <IconSend size={16} />
                  Kirim Notifikasi Uji Coba
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
