export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: "low" | "med" | "high";
  category: string;
  deadline: string;
  is_done: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  note: string;
  date: string;
}

export interface Wishlist {
  id: string;
  name: string;
  target_price: number;
  saved_amount: number;
  image_url: string;
  marketplace_url: string;
  priority: number;
  is_achieved: boolean;
}

export type NotificationType = "todo" | "finance" | "wishlist" | "system";
export type NotificationPriority = "low" | "normal" | "urgent";

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationSettings {
  devicePushEnabled: boolean;
  todoReminders: boolean;
  wishlistMilestones: boolean;
  financeReminders: boolean;
}


export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Key helper — pisah data offline vs per-akun
function key(base: string, userId?: string) {
  return userId ? `NoteZ_${base}_${userId}` : `NoteZ_${base}`;
}

// ============ TODO ============
export function getTodos(userId?: string): Todo[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(key("todos", userId));
  return data ? JSON.parse(data) : [];
}

export function saveTodos(todos: Todo[], userId?: string): void {
  localStorage.setItem(key("todos", userId), JSON.stringify(todos));
}

export function addTodo(todo: Omit<Todo, "id" | "created_at">, userId?: string): Todo {
  const todos = getTodos(userId);
  const newTodo: Todo = { ...todo, id: generateId(), created_at: new Date().toISOString() };
  todos.unshift(newTodo);
  saveTodos(todos, userId);
  return newTodo;
}

export function updateTodo(id: string, updates: Partial<Todo>, userId?: string): void {
  const todos = getTodos(userId);
  const idx = todos.findIndex((t) => t.id === id);
  if (idx !== -1) { todos[idx] = { ...todos[idx], ...updates }; saveTodos(todos, userId); }
}

export function deleteTodo(id: string, userId?: string): void {
  saveTodos(getTodos(userId).filter((t) => t.id !== id), userId);
}

// ============ TRANSAKSI ============
export function getTransactions(userId?: string): Transaction[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(key("transactions", userId));
  return data ? JSON.parse(data) : [];
}

export function saveTransactions(transactions: Transaction[], userId?: string): void {
  localStorage.setItem(key("transactions", userId), JSON.stringify(transactions));
}

export function addTransaction(tx: Omit<Transaction, "id">, userId?: string): Transaction {
  const transactions = getTransactions(userId);
  const newTx: Transaction = { ...tx, id: generateId() };
  transactions.unshift(newTx);
  saveTransactions(transactions, userId);
  return newTx;
}

export function deleteTransaction(id: string, userId?: string): void {
  saveTransactions(getTransactions(userId).filter((t) => t.id !== id), userId);
}

// ============ WISHLIST ============
export function getWishlists(userId?: string): Wishlist[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(key("wishlists", userId));
  return data ? JSON.parse(data) : [];
}

export function saveWishlists(wishlists: Wishlist[], userId?: string): void {
  localStorage.setItem(key("wishlists", userId), JSON.stringify(wishlists));
}

export function addWishlist(item: Omit<Wishlist, "id">, userId?: string): Wishlist {
  const wishlists = getWishlists(userId);
  const newItem: Wishlist = { ...item, id: generateId() };
  wishlists.unshift(newItem);
  saveWishlists(wishlists, userId);
  return newItem;
}

export function updateWishlist(id: string, updates: Partial<Wishlist>, userId?: string): void {
  const wishlists = getWishlists(userId);
  const idx = wishlists.findIndex((w) => w.id === id);
  if (idx !== -1) { wishlists[idx] = { ...wishlists[idx], ...updates }; saveWishlists(wishlists, userId); }
}

export function deleteWishlist(id: string, userId?: string): void {
  saveWishlists(getWishlists(userId).filter((w) => w.id !== id), userId);
}

// ============ NOTIFIKASI ============
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  devicePushEnabled: false,
  todoReminders: true,
  wishlistMilestones: true,
  financeReminders: true,
};

export function getNotificationSettings(userId?: string): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_SETTINGS;
  const data = localStorage.getItem(key("notification_settings", userId));
  return data ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(data) } : DEFAULT_NOTIFICATION_SETTINGS;
}

export function saveNotificationSettings(settings: NotificationSettings, userId?: string): void {
  localStorage.setItem(key("notification_settings", userId), JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("notificationSettingsUpdated"));
  }
}

export function getNotifications(userId?: string): NotificationItem[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(key("notifications", userId));
  return data ? JSON.parse(data) : [];
}

export function saveNotifications(notifications: NotificationItem[], userId?: string): void {
  localStorage.setItem(key("notifications", userId), JSON.stringify(notifications));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("notificationsUpdated"));
  }
}

export function addNotification(
  notif: Omit<NotificationItem, "id" | "created_at" | "is_read">,
  userId?: string
): NotificationItem {
  const notifications = getNotifications(userId);
  const newNotif: NotificationItem = {
    ...notif,
    id: generateId(),
    is_read: false,
    created_at: new Date().toISOString(),
  };
  notifications.unshift(newNotif);
  // Simpan maksimal 100 notifikasi terakhir
  saveNotifications(notifications.slice(0, 100), userId);
  return newNotif;
}

export function markNotificationAsRead(id: string, userId?: string): void {
  const notifications = getNotifications(userId);
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx !== -1) {
    notifications[idx].is_read = true;
    saveNotifications(notifications, userId);
  }
}

export function markAllNotificationsAsRead(userId?: string): void {
  const notifications = getNotifications(userId).map((n) => ({ ...n, is_read: true }));
  saveNotifications(notifications, userId);
}

export function deleteNotification(id: string, userId?: string): void {
  saveNotifications(getNotifications(userId).filter((n) => n.id !== id), userId);
}

export function clearAllNotifications(userId?: string): void {
  saveNotifications([], userId);
}