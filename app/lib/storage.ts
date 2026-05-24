// Tipe data
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

// Helper generate ID unik
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============ TODO ============
export function getTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("nubapp_todos");
  return data ? JSON.parse(data) : [];
}

export function saveTodos(todos: Todo[]): void {
  localStorage.setItem("nubapp_todos", JSON.stringify(todos));
}

export function addTodo(todo: Omit<Todo, "id" | "created_at">): Todo {
  const todos = getTodos();
  const newTodo: Todo = {
    ...todo,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  todos.unshift(newTodo);
  saveTodos(todos);
  return newTodo;
}

export function updateTodo(id: string, updates: Partial<Todo>): void {
  const todos = getTodos();
  const idx = todos.findIndex((t) => t.id === id);
  if (idx !== -1) {
    todos[idx] = { ...todos[idx], ...updates };
    saveTodos(todos);
  }
}

export function deleteTodo(id: string): void {
  const todos = getTodos().filter((t) => t.id !== id);
  saveTodos(todos);
}

// ============ TRANSAKSI ============
export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("nubapp_transactions");
  return data ? JSON.parse(data) : [];
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem("nubapp_transactions", JSON.stringify(transactions));
}

export function addTransaction(tx: Omit<Transaction, "id">): Transaction {
  const transactions = getTransactions();
  const newTx: Transaction = { ...tx, id: generateId() };
  transactions.unshift(newTx);
  saveTransactions(transactions);
  return newTx;
}

export function deleteTransaction(id: string): void {
  const transactions = getTransactions().filter((t) => t.id !== id);
  saveTransactions(transactions);
}

// ============ WISHLIST ============
export function getWishlists(): Wishlist[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("nubapp_wishlists");
  return data ? JSON.parse(data) : [];
}

export function saveWishlists(wishlists: Wishlist[]): void {
  localStorage.setItem("nubapp_wishlists", JSON.stringify(wishlists));
}

export function addWishlist(item: Omit<Wishlist, "id">): Wishlist {
  const wishlists = getWishlists();
  const newItem: Wishlist = { ...item, id: generateId() };
  wishlists.unshift(newItem);
  saveWishlists(wishlists);
  return newItem;
}

export function updateWishlist(id: string, updates: Partial<Wishlist>): void {
  const wishlists = getWishlists();
  const idx = wishlists.findIndex((w) => w.id === id);
  if (idx !== -1) {
    wishlists[idx] = { ...wishlists[idx], ...updates };
    saveWishlists(wishlists);
  }
}

export function deleteWishlist(id: string): void {
  const wishlists = getWishlists().filter((w) => w.id !== id);
  saveWishlists(wishlists);
}