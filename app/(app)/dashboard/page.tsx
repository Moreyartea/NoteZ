"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NbCard from "@/components/ui/NbCard";
import NbButton from "@/components/ui/NbButton";
import {
  IconBolt, IconChecklist, IconCoin, IconGift,
  IconChartBar, IconWallet, IconHeart,
} from "@tabler/icons-react";
import { getTodos, getTransactions, getWishlists } from "@/app/lib/storage";

export default function DashboardPage() {
  const [todoCount, setTodoCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Ambil data dari localStorage
    const todos = getTodos();
    const todayStr = new Date().toISOString().split("T")[0];
    const todayTodos = todos.filter((t) =>
      t.created_at.startsWith(todayStr)
    );
    setTodoCount(todayTodos.length);
    setDoneCount(todayTodos.filter((t) => t.is_done).length);

    const transactions = getTransactions();
    const total = transactions.reduce((acc, tx) =>
      tx.type === "income" ? acc + Number(tx.amount) : acc - Number(tx.amount), 0
    );
    setBalance(total);

    const wishlists = getWishlists();
    setWishlistCount(wishlists.filter((w) => !w.is_achieved).length);

    setLoading(false);
  }, []);

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(amount);
  }

  const productivity = todoCount > 0
    ? Math.round((doneCount / todoCount) * 100) : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-nb-bg flex items-center justify-center">
        <NbCard color="yellow">
          <div className="font-bold text-lg">Memuat data...</div>
        </NbCard>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-nb-bg p-4 md:p-8">

      {/* Header */}
      <div className="border-2 border-nb-black bg-nb-black rounded-xl shadow-[4px_4px_0px_#0A0A0A] p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-nb-yellow border-2 border-nb-black rounded-lg p-2">
            <IconBolt size={20} className="text-nb-black" />
          </div>
          <div>
            <div className="text-nb-yellow font-bold text-base">NubApp</div>
            <div className="text-white/50 text-xs font-medium mt-0.5">
              Selamat datang!
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <NbCard color="yellow">
          <IconChecklist size={18} className="opacity-50 mb-2" />
          <div className="text-3xl font-black">{doneCount}/{todoCount}</div>
          <div className="text-xs font-bold uppercase tracking-widest mt-1 opacity-60">
            Tugas
          </div>
        </NbCard>
        <NbCard color="green">
          <IconWallet size={18} className="opacity-50 mb-2" />
          <div className="text-lg font-black leading-tight">
            {formatRupiah(balance)}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest mt-1 opacity-60">
            Saldo
          </div>
        </NbCard>
        <NbCard color="blue">
          <IconHeart size={18} className="text-white opacity-60 mb-2" />
          <div className="text-3xl font-black text-white">{wishlistCount}</div>
          <div className="text-xs font-bold uppercase tracking-widest mt-1 text-white/60">
            Wishlist
          </div>
        </NbCard>
        <NbCard color="pink">
          <IconChartBar size={18} className="text-white opacity-60 mb-2" />
          <div className="text-3xl font-black text-white">{productivity}%</div>
          <div className="text-xs font-bold uppercase tracking-widest mt-1 text-white/60">
            Produktif
          </div>
        </NbCard>
      </div>

      {/* Menu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <NbCard hover onClick={() => router.push("/todos")}>
          <div className="bg-nb-yellow border-2 border-nb-black rounded-lg p-2.5 w-fit mb-3">
            <IconChecklist size={22} />
          </div>
          <div className="font-bold text-base mb-1">To Do List</div>
          <div className="text-sm text-nb-black/50 font-medium">
            Kelola tugas harian kamu
          </div>
        </NbCard>
        <NbCard hover onClick={() => router.push("/finance")}>
          <div className="bg-nb-green border-2 border-nb-black rounded-lg p-2.5 w-fit mb-3">
            <IconCoin size={22} />
          </div>
          <div className="font-bold text-base mb-1">Keuangan</div>
          <div className="text-sm text-nb-black/50 font-medium">
            Catat pemasukan & pengeluaran
          </div>
        </NbCard>
        <NbCard hover onClick={() => router.push("/wishlist")}>
          <div className="bg-nb-pink border-2 border-nb-black rounded-lg p-2.5 w-fit mb-3">
            <IconGift size={22} className="text-white" />
          </div>
          <div className="font-bold text-base mb-1">Wishlist</div>
          <div className="text-sm text-nb-black/50 font-medium">
            Pantau target belanja kamu
          </div>
        </NbCard>
      </div>

      {/* Footer */}
      <NbCard color="black">
        <div className="flex items-center justify-center gap-2 text-nb-green text-xs font-bold">
          <IconBolt size={14} />
          NubApp v1.0 — Data tersimpan di perangkat
        </div>
      </NbCard>

    </main>
  );
}