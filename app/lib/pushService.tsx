"use client";

import toast from "react-hot-toast";

/**
 * Service untuk menangani pengiriman notifikasi perangkat (Web Notifications API)
 * dan In-App Toast bergaya Neobrutalisme.
 */

export async function requestDeviceNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function isDeviceNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getDeviceNotificationPermissionState(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export interface ShowNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  onClickUrl?: string;
  showToast?: boolean;
  priority?: "low" | "normal" | "urgent";
}

export function dispatchNotification({
  title,
  body,
  icon = "/logo_app.svg",
  tag,
  onClickUrl,
  showToast = true,
  priority = "normal",
}: ShowNotificationOptions) {
  if (typeof window === "undefined") return;

  // 1. Tampilkan Web Notification jika diizinkan
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      const notification = new Notification(title, {
        body,
        icon,
        tag: tag || title,
        badge: icon,
      });

      if (onClickUrl) {
        notification.onclick = () => {
          window.focus();
          window.location.href = onClickUrl;
          notification.close();
        };
      }
    } catch (e) {
      console.warn("Gagal menampilkan browser notification:", e);
    }
  }

  // 2. Tampilkan Neobrutalist in-app toast jika diinginkan
  if (showToast) {
    const bgColors = {
      urgent: "#FF4DA6", // Pink
      normal: "#FFE135", // Yellow
      low: "#00E676",    // Green
    };

    toast(
      (t) => (
        <div
          onClick={() => {
            toast.dismiss(t.id);
            if (onClickUrl) {
              window.location.href = onClickUrl;
            }
          }}
          className="flex items-start gap-2.5 cursor-pointer max-w-sm"
        >
          <div className="flex-1 min-w-0">
            <div className="font-black text-sm text-[#0A0A0A] leading-tight flex items-center gap-1.5">
              <span>{title}</span>
            </div>
            <div className="text-xs text-[#0A0A0A]/80 font-medium mt-0.5 line-clamp-2">
              {body}
            </div>
          </div>
        </div>
      ),
      {
        duration: 4000,
        position: "top-right",
        style: {
          background: bgColors[priority] || "#FFE135",
          border: "2px solid #0A0A0A",
          boxShadow: "4px 4px 0px #0A0A0A",
          borderRadius: "8px",
          color: "#0A0A0A",
          padding: "10px 14px",
        },
      }
    );
  }
}
