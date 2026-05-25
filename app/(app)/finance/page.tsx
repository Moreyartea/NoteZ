"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NbCard from "@/components/ui/NbCard";
import NbButton from "@/components/ui/NbButton";
import NbInput from "@/components/ui/NbInput";
import {
  IconArrowLeft, IconPlus, IconTrash, IconCoin,
  IconBriefcase, IconBowl, IconCar, IconShoppingBag,
  IconFileInvoice, IconMusic, IconHeartbeat, IconBook,
  IconCategory, IconPigMoney, IconTrendingUp,
} from "@tabler/icons-react";
import {
  Transaction, getTransactions, addTransaction, deleteTransaction,
} from "@/app/lib/storage";
import { createClient } from "@/app/lib/supabase";

const INCOME_CATEGORIES = ["Gaji", "Freelance", "Bisnis", "Investasi", "Hadiah", "Lainnya"];
const EXPENSE_CATEGORIES = ["Makanan", "Transport", "Belanja", "Tagihan", "Hiburan", "Kesehatan", "Pendidikan", "Lainnya"];

const CATEGORY_ICONS: Record<string, { icon: React.ReactNode; bg: string }> = {
  Gaji:       { icon: <IconBriefcase size={16} />, bg: "bg-blue-50" },
  Freelance:  { icon: <IconTrendingUp size={16} />, bg: "bg-purple-50" },
  Bisnis:     { icon: <IconBriefcase size={16} />, bg: "bg-blue-50" },
  Investasi:  { icon: <IconTrendingUp size={16} />, bg: "bg-green-50" },
  Hadiah:     { icon: <IconPigMoney size={16} />, bg: "bg-pink-50" },
  Makanan:    { icon: <IconBowl size={16} />, bg: "bg-orange-50" },
  Transport:  { icon: <IconCar size={16} />, bg: "bg-purple-50" },
  Belanja:    { icon: <IconShoppingBag size={16} />, bg: "bg-pink-50" },
  Tagihan:    { icon: <IconFileInvoice size={16} />, bg: "bg-red-50" },
  Hiburan:    { icon: <IconMusic size={16} />, bg: "bg-yellow-50" },
  Kesehatan:  { icon: <IconHeartbeat size={16} />, bg: "bg-red-50" },
  Pendidikan: { icon: <IconBook size={16} />, bg: "bg-blue-50" },
  Lainnya:    { icon: <IconCategory size={16} />, bg: "bg-gray-50" },
};

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id;
      setUserId(uid);
      setTransactions(getTransactions(uid));
    }
    init();
  }, []);

  function handleSave() {
    if (!amount || !category || !date) return;
    addTransaction({
      type, amount: parseFloat(amount),
      category, note: note || "", date,
    }, userId);
    setTransactions(getTransactions(userId));
    setAmount(""); setCategory(""); setNote("");
    setDate(new Date().toISOString().split("T")[0]);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    deleteTransaction(id, userId);
    setTransactions(getTransactions(userId));
  }

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(amount);
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((a, t) => a + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, t) => a + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  return (
    <main className="min-h-screen bg-nb-bg p-4 md:p-8">

      {/* Header */}
      <div className="border-2 border-nb-black bg-nb-black rounded-xl shadow-[4px_4px_0px_#0A0A0A] p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-nb-green border-2 border-nb-black rounded-lg p-2">
            <IconCoin size={20} className="text-nb-black" />
          </div>
          <div>
            <div className="text-nb-yellow font-bold text-base">Keuangan</div>
            <div className="text-white/50 text-xs font-medium mt-0.5">
              Catat pemasukan & pengeluaran
            </div>
          </div>
        </div>
        <NbButton variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <IconArrowLeft size={15} /> Beranda
        </NbButton>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <NbCard color="green">
          <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
            Pemasukan
          </div>
          <div className="text-xl font-black">{formatRupiah(totalIncome)}</div>
        </NbCard>
        <NbCard color="pink">
          <div className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">
            Pengeluaran
          </div>
          <div className="text-xl font-black text-white">{formatRupiah(totalExpense)}</div>
        </NbCard>
        <NbCard color={balance >= 0 ? "yellow" : "orange"}>
          <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
            Saldo Bersih
          </div>
          <div className="text-xl font-black">{formatRupiah(balance)}</div>
        </NbCard>
      </div>

      {/* Tombol Tambah */}
      {!showForm && (
        <div className="flex gap-3 mb-6">
          <NbButton variant="green"
            onClick={() => { setType("income"); setShowForm(true); }}>
            <IconPlus size={16} /> Pemasukan
          </NbButton>
          <NbButton variant="pink"
            onClick={() => { setType("expense"); setShowForm(true); }}>
            <IconPlus size={16} /> Pengeluaran
          </NbButton>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <NbCard className="mb-6">
          <div className="font-bold text-base mb-4">
            {type === "income" ? "Tambah Pemasukan" : "Tambah Pengeluaran"}
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button onClick={() => setType("income")}
                className={`flex-1 border-2 border-nb-black rounded-lg p-2.5 font-bold text-sm transition-all ${type === "income" ? "bg-nb-green" : "bg-white"}`}>
                Pemasukan
              </button>
              <button onClick={() => setType("expense")}
                className={`flex-1 border-2 border-nb-black rounded-lg p-2.5 font-bold text-sm transition-all ${type === "expense" ? "bg-nb-pink text-white" : "bg-white"}`}>
                Pengeluaran
              </button>
            </div>

            <NbInput label="Nominal (Rp)" type="number" placeholder="50000"
              value={amount} onChange={(e) => setAmount(e.target.value)} />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-nb-black/60">
                Kategori
              </label>
              <div className="flex flex-wrap gap-2">
                {(type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`border-2 border-nb-black rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${category === cat ? "bg-nb-yellow" : "bg-white"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <NbInput label="Catatan (opsional)" type="text"
              placeholder="Makan siang..." value={note}
              onChange={(e) => setNote(e.target.value)} />

            <NbInput label="Tanggal" type="date"
              value={date} onChange={(e) => setDate(e.target.value)} />

            <div className="flex gap-3 mt-1">
              <NbButton variant="black" size="lg" onClick={handleSave} className="flex-1">
                Simpan
              </NbButton>
              <NbButton variant="ghost" onClick={() => setShowForm(false)}>
                Batal
              </NbButton>
            </div>
          </div>
        </NbCard>
      )}

      {/* Riwayat */}
      <NbCard>
        <div className="font-bold text-base mb-4 flex items-center gap-2">
          <IconCoin size={18} /> Riwayat Transaksi
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-nb-black/30 font-medium text-sm">
            Belum ada transaksi. Tambahkan sekarang!
          </div>
        ) : (
          <div className="flex flex-col">
            {transactions.map((tx) => {
              const cat = CATEGORY_ICONS[tx.category] || CATEGORY_ICONS["Lainnya"];
              return (
                <div key={tx.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 group">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg border-2 border-nb-black flex items-center justify-center flex-shrink-0 ${cat.bg}`}>
                      {cat.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{tx.category}</div>
                      <div className="text-xs text-nb-black/40 font-medium mt-0.5">
                        {tx.note && `${tx.note} · `}{tx.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-black text-sm ${tx.type === "income" ? "text-green-600" : "text-red-500"}`}>
                      {tx.type === "income" ? "+" : "−"}{formatRupiah(Number(tx.amount))}
                    </span>
                    <button onClick={() => handleDelete(tx.id)}
                      className="border-2 border-nb-black rounded-lg p-1.5 bg-white hover:bg-nb-pink hover:text-white transition-all opacity-0 group-hover:opacity-100">
                      <IconTrash size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </NbCard>

    </main>
  );
}