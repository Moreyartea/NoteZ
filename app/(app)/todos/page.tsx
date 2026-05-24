"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NbCard from "@/components/ui/NbCard";
import NbButton from "@/components/ui/NbButton";
import NbInput from "@/components/ui/NbInput";
import {
  IconArrowLeft, IconPlus, IconTrash, IconCheck,
  IconChecklist, IconCalendar, IconTag,
} from "@tabler/icons-react";
import {
  Todo, getTodos, addTodo, updateTodo, deleteTodo,
} from "@/app/lib/storage";

const PRIORITY_CONFIG = {
  high: { bg: "bg-red-100", dot: "bg-red-500", label: "Tinggi" },
  med:  { bg: "bg-orange-100", dot: "bg-nb-orange", label: "Sedang" },
  low:  { bg: "bg-green-100", dot: "bg-nb-green", label: "Rendah" },
};

const CATEGORIES = ["Kuliah", "Kerja", "Pribadi", "Belanja", "Kesehatan", "Lainnya"];

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "med" | "high">("med");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const router = useRouter();

  useEffect(() => {
    setTodos(getTodos());
  }, []);

  function handleSave() {
    if (!title) return;
    addTodo({ title, description, priority, category, deadline, is_done: false });
    setTodos(getTodos());
    setTitle(""); setDescription(""); setPriority("med");
    setCategory(""); setDeadline("");
    setShowForm(false);
  }

  function handleToggle(id: string, is_done: boolean) {
    updateTodo(id, { is_done: !is_done });
    setTodos(getTodos());
  }

  function handleDelete(id: string) {
    deleteTodo(id);
    setTodos(getTodos());
  }

  const filteredTodos = todos.filter((t) =>
    filter === "active" ? !t.is_done : filter === "done" ? t.is_done : true
  );
  const doneCount = todos.filter((t) => t.is_done).length;
  const progress = todos.length > 0
    ? Math.round((doneCount / todos.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-nb-bg p-4 md:p-8">

      {/* Header */}
      <div className="border-2 border-nb-black bg-nb-black rounded-xl shadow-[4px_4px_0px_#0A0A0A] p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-nb-yellow border-2 border-nb-black rounded-lg p-2">
            <IconChecklist size={20} className="text-nb-black" />
          </div>
          <div>
            <div className="text-nb-yellow font-bold text-base">To Do List</div>
            <div className="text-white/50 text-xs font-medium mt-0.5">
              {doneCount}/{todos.length} tugas selesai
            </div>
          </div>
        </div>
        <NbButton variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <IconArrowLeft size={15} /> Dashboard
        </NbButton>
      </div>

      {/* Progress */}
      <NbCard className="mb-6">
        <div className="flex justify-between items-center mb-2.5">
          <span className="font-bold text-sm">Progress hari ini</span>
          <span className="font-black text-lg">{progress}%</span>
        </div>
        <div className="h-3 border-2 border-nb-black rounded-full bg-white overflow-hidden">
          <div
            className="h-full bg-nb-green rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </NbCard>

      {/* Tombol Tambah */}
      {!showForm && (
        <NbButton variant="yellow" size="lg" className="mb-6 w-full"
          onClick={() => setShowForm(true)}>
          <IconPlus size={18} /> Tambah Tugas Baru
        </NbButton>
      )}

      {/* Form */}
      {showForm && (
        <NbCard className="mb-6">
          <div className="font-bold text-base mb-4">Tugas Baru</div>
          <div className="flex flex-col gap-3">
            <NbInput label="Judul tugas" type="text"
              placeholder="Apa yang perlu dikerjakan?"
              value={title} onChange={(e) => setTitle(e.target.value)} />
            <NbInput label="Deskripsi (opsional)" type="text"
              placeholder="Detail tugas..."
              value={description} onChange={(e) => setDescription(e.target.value)} />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-nb-black/60">
                Prioritas
              </label>
              <div className="flex gap-2">
                {(["high", "med", "low"] as const).map((p) => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={`flex-1 border-2 border-nb-black rounded-lg p-2.5 font-bold text-xs transition-all ${priority === p ? PRIORITY_CONFIG[p].bg : "bg-white"}`}>
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-nb-black/60">
                Kategori
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`border-2 border-nb-black rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${category === cat ? "bg-nb-blue text-white" : "bg-white"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <NbInput label="Deadline (opsional)" type="date"
              value={deadline} onChange={(e) => setDeadline(e.target.value)} />

            <div className="flex gap-3 mt-1">
              <NbButton variant="black" size="lg" onClick={handleSave} className="flex-1">
                Simpan Tugas
              </NbButton>
              <NbButton variant="ghost" onClick={() => setShowForm(false)}>
                Batal
              </NbButton>
            </div>
          </div>
        </NbCard>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(["all", "active", "done"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`border-2 border-nb-black rounded-lg px-4 py-2 text-xs font-bold transition-all shadow-[2px_2px_0px_#0A0A0A] ${filter === f ? "bg-nb-yellow" : "bg-white"}`}>
            {f === "all" ? "Semua" : f === "active" ? "Aktif" : "Selesai"}
          </button>
        ))}
      </div>

      {/* Daftar Todo */}
      <div className="flex flex-col gap-2.5">
        {filteredTodos.length === 0 ? (
          <NbCard>
            <div className="text-center py-8 text-nb-black/30 font-medium text-sm">
              {filter === "done"
                ? "Belum ada tugas selesai."
                : "Tidak ada tugas. Tambahkan sekarang!"}
            </div>
          </NbCard>
        ) : (
          filteredTodos.map((todo) => (
            <div key={todo.id}
              className={`border-2 border-nb-black rounded-xl p-4 shadow-[2px_2px_0px_#0A0A0A] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0A0A0A] group ${todo.is_done ? "bg-gray-50" : "bg-white"}`}>
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggle(todo.id, todo.is_done)}
                  className={`w-5 h-5 border-2 border-nb-black rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${todo.is_done ? "bg-nb-green" : "bg-white hover:bg-nb-yellow"}`}>
                  {todo.is_done && <IconCheck size={12} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-sm ${todo.is_done ? "line-through opacity-40" : ""}`}>
                    {todo.title}
                  </div>
                  {todo.description && (
                    <div className="text-xs text-nb-black/40 font-medium mt-0.5">
                      {todo.description}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className={`inline-flex items-center gap-1 border border-nb-black/20 rounded-md px-2 py-0.5 text-xs font-bold ${PRIORITY_CONFIG[todo.priority].bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_CONFIG[todo.priority].dot}`} />
                      {PRIORITY_CONFIG[todo.priority].label}
                    </span>
                    {todo.category && (
                      <span className="inline-flex items-center gap-1 border border-nb-black/20 rounded-md px-2 py-0.5 text-xs font-bold bg-blue-50 text-blue-700">
                        <IconTag size={10} /> {todo.category}
                      </span>
                    )}
                    {todo.deadline && (
                      <span className="inline-flex items-center gap-1 border border-nb-black/20 rounded-md px-2 py-0.5 text-xs font-bold bg-gray-50">
                        <IconCalendar size={10} /> {todo.deadline}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(todo.id)}
                  className="border-2 border-nb-black rounded-lg p-1.5 bg-white hover:bg-nb-pink hover:text-white transition-all opacity-0 group-hover:opacity-100 flex-shrink-0">
                  <IconTrash size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </main>
  );
}