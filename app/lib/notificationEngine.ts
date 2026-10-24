import {
  getTodos,
  getTransactions,
  getWishlists,
  getNotificationSettings,
  addNotification,
} from "./storage";
import { dispatchNotification } from "./pushService";

interface DedupStore {
  [tag: string]: number; // timestamp saat dikirim
}

function getDedupStore(userId?: string): DedupStore {
  if (typeof window === "undefined") return {};
  const key = userId ? `notez_notif_dedup_${userId}` : "notez_notif_dedup_guest";
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveDedupStore(store: DedupStore, userId?: string) {
  if (typeof window === "undefined") return;
  const key = userId ? `notez_notif_dedup_${userId}` : "notez_notif_dedup_guest";
  // Bersihkan key yang lebih dari 7 hari
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const cleaned: DedupStore = {};
  for (const [tag, time] of Object.entries(store)) {
    if (now - time < sevenDaysMs) {
      cleaned[tag] = time;
    }
  }
  localStorage.setItem(key, JSON.stringify(cleaned));
}

/**
 * Memeriksa seluruh kondisi data dan menghasilkan notifikasi otomatis yang relevan.
 * Dipanggil saat aplikasi dimuat dan secara berkala di latar belakang.
 */
export function checkAndTriggerSmartNotifications(userId?: string) {
  if (typeof window === "undefined") return;

  const settings = getNotificationSettings(userId);
  const dedupStore = getDedupStore(userId);
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM
  const currentHour = now.getHours();

  let hasNew = false;

  function trigger(
    tag: string,
    title: string,
    message: string,
    type: "todo" | "finance" | "wishlist" | "system",
    priority: "low" | "normal" | "urgent",
    link: string
  ) {
    if (dedupStore[tag]) return; // Sudah pernah dikirim, hindari spam

    // Simpan ke notifikasi in-app
    addNotification({
      title,
      message,
      type,
      priority,
      link,
      userId,
    }, userId);

    // Kirim notifikasi sistem/browser jika diizinkan
    if (settings.devicePushEnabled) {
      dispatchNotification({
        title,
        body: message,
        onClickUrl: link,
        tag,
        priority,
        showToast: true,
      });
    }

    dedupStore[tag] = Date.now();
    hasNew = true;
  }

  // 1. Pengecekan To-Do
  if (settings.todoReminders) {
    const todos = getTodos(userId);
    const activeTodos = todos.filter((t) => !t.is_done);

    // Periksa deadline
    for (const todo of activeTodos) {
      if (!todo.deadline) continue;
      const todoDeadline = todo.deadline.split("T")[0];

      if (todoDeadline < todayStr) {
        // Terlewat (Overdue)
        trigger(
          `todo_overdue_${todo.id}_${todayStr}`,
          "⚠️ Tugas Terlewat!",
          `Tugas "${todo.title}" telah melewati batas waktu (${todo.deadline}).`,
          "todo",
          "urgent",
          "/todos"
        );
      } else if (todoDeadline === todayStr) {
        // Jatuh tempo hari ini
        trigger(
          `todo_today_${todo.id}_${todayStr}`,
          "⏰ Deadline Hari Ini!",
          `Tugas "${todo.title}" dijadwalkan selesai hari ini.`,
          "todo",
          "normal",
          "/todos"
        );
      }
    }

    // Periksa jika semua tugas hari ini selesai
    const todayCreated = todos.filter((t) => t.created_at.startsWith(todayStr));
    if (todayCreated.length > 0 && todayCreated.every((t) => t.is_done)) {
      trigger(
        `todo_all_done_${todayStr}`,
        "🎉 Produktivitas Maksimal!",
        `Luar biasa! Semua ${todayCreated.length} tugas hari ini berhasil kamu tuntaskan!`,
        "todo",
        "low",
        "/todos"
      );
    }
  }

  // 2. Pengecekan Wishlist
  if (settings.wishlistMilestones) {
    const wishlists = getWishlists(userId);
    for (const item of wishlists) {
      if (!item.target_price || item.target_price <= 0) continue;
      const ratio = item.saved_amount / item.target_price;

      if (ratio >= 1) {
        // Tercapai penuh
        trigger(
          `wishlist_achieved_${item.id}`,
          "🎁 Target Wishlist Tercapai!",
          `Hore! Tabungan untuk impian "${item.name}" sudah mencapai 100%!`,
          "wishlist",
          "normal",
          "/wishlist"
        );
      } else if (ratio >= 0.75) {
        trigger(
          `wishlist_75_${item.id}`,
          "🚀 Impian Semakin Dekat!",
          `Tabungan untuk "${item.name}" sudah mencapai ${Math.round(ratio * 100)}%. Sedikit lagi!`,
          "wishlist",
          "low",
          "/wishlist"
        );
      } else if (ratio >= 0.5) {
        trigger(
          `wishlist_50_${item.id}`,
          "✨ Setengah Jalan Tercapai!",
          `Tabungan untuk "${item.name}" sudah melewati 50%. Pertahankan!`,
          "wishlist",
          "low",
          "/wishlist"
        );
      }
    }
  }

  // 3. Pengecekan Keuangan
  if (settings.financeReminders) {
    const transactions = getTransactions(userId);

    // Pengingat harian pada malam hari (19:00+) jika belum ada transaksi
    if (currentHour >= 19) {
      const hasTodayTx = transactions.some((tx) => tx.date && tx.date.startsWith(todayStr));
      if (!hasTodayTx) {
        trigger(
          `finance_daily_reminder_${todayStr}`,
          "📝 Jangan Lupa Catat Keuangan",
          "Sudahkah mencatat pengeluaran atau pemasukan hari ini? Yuk luangkan 1 menit untuk evaluasi.",
          "finance",
          "low",
          "/finance"
        );
      }
    }

    // Peringatan pengeluaran bulan ini melebihi pemasukan
    const monthTx = transactions.filter((tx) => tx.date && tx.date.startsWith(currentMonthStr));
    const incomeMonth = monthTx.filter((t) => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0);
    const expenseMonth = monthTx.filter((t) => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0);

    if (expenseMonth > incomeMonth && expenseMonth > 100000 && incomeMonth > 0) {
      trigger(
        `finance_deficit_${currentMonthStr}`,
        "⚠️ Pengeluaran Melebihi Pemasukan",
        `Pengeluaran bulan ini (Rp ${expenseMonth.toLocaleString("id-ID")}) telah melampaui pemasukanmu.`,
        "finance",
        "normal",
        "/finance"
      );
    }
  }

  if (hasNew) {
    saveDedupStore(dedupStore, userId);
  }
}
