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

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
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