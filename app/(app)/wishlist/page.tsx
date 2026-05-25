"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NbCard from "@/components/ui/NbCard";
import NbButton from "@/components/ui/NbButton";
import NbInput from "@/components/ui/NbInput";
import {
  IconArrowLeft, IconPlus, IconTrash, IconGift,
  IconExternalLink, IconPigMoney, IconStar, IconCheck,
} from "@tabler/icons-react";
import {
  Wishlist, getWishlists, addWishlist, updateWishlist, deleteWishlist,
} from "@/app/lib/storage";
import { createClient } from "@/app/lib/supabase";

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [marketplaceUrl, setMarketplaceUrl] = useState("");
  const [priority, setPriority] = useState(3);
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id;
      setUserId(uid);
      setWishlists(getWishlists(uid));
    }
    init();
  }, []);

  function handleSave() {
    if (!name || !targetPrice) return;
    addWishlist({
      name,
      target_price: parseFloat(targetPrice),
      saved_amount: parseFloat(savedAmount || "0"),
      image_url: imageUrl || "",
      marketplace_url: marketplaceUrl || "",
      priority,
      is_achieved: false,
    }, userId);
    setWishlists(getWishlists(userId));
    setName(""); setTargetPrice(""); setSavedAmount("");
    setImageUrl(""); setMarketplaceUrl(""); setPriority(3);
    setShowForm(false);
  }

  function handleUpdateSaved(id: string, current: number) {
    const input = prompt("Tambah tabungan (Rp):");
    if (!input) return;
    const add = parseFloat(input);
    if (isNaN(add)) return;
    updateWishlist(id, { saved_amount: current + add }, userId);
    setWishlists(getWishlists(userId));
  }

  function handleAchieve(id: string) {
    updateWishlist(id, { is_achieved: true }, userId);
    setWishlists(getWishlists(userId));
  }

  function handleDelete(id: string) {
    deleteWishlist(id, userId);
    setWishlists(getWishlists(userId));
  }

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(amount);
  }

  function getProgress(saved: number, target: number) {
    return Math.min(Math.round((saved / target) * 100), 100);
  }

  return (
    <main className="min-h-screen bg-nb-bg p-4 md:p-8">

      {/* Header */}
      <div className="border-2 border-nb-black bg-nb-black rounded-xl shadow-[4px_4px_0px_#0A0A0A] p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-nb-pink border-2 border-nb-black rounded-lg p-2">
            <IconGift size={20} className="text-white" />
          </div>
          <div>
            <div className="text-nb-yellow font-bold text-base">Wishlist</div>
            <div className="text-white/50 text-xs font-medium mt-0.5">
              {wishlists.filter((w) => !w.is_achieved).length} item aktif
            </div>
          </div>
        </div>
        <NbButton variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <IconArrowLeft size={15} /> Beranda
        </NbButton>
      </div>

      {/* Tombol Tambah */}
      {!showForm && (
        <NbButton variant="pink" size="lg" className="mb-6 w-full"
          onClick={() => setShowForm(true)}>
          <IconPlus size={18} /> Tambah Wishlist
        </NbButton>
      )}

      {/* Form */}
      {showForm && (
        <NbCard className="mb-6">
          <div className="font-bold text-base mb-4">Wishlist Baru</div>
          <div className="flex flex-col gap-3">
            <NbInput label="Nama barang" type="text"
              placeholder="MacBook Air M4..."
              value={name} onChange={(e) => setName(e.target.value)} />
            <NbInput label="Harga target (Rp)" type="number"
              placeholder="18000000"
              value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
            <NbInput label="Tabungan saat ini (Rp)" type="number"
              placeholder="0"
              value={savedAmount} onChange={(e) => setSavedAmount(e.target.value)} />
            <NbInput label="URL gambar (opsional)" type="url"
              placeholder="https://..."
              value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <NbInput label="Link marketplace (opsional)" type="url"
              placeholder="https://tokopedia.com/..."
              value={marketplaceUrl} onChange={(e) => setMarketplaceUrl(e.target.value)} />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-nb-black/60">
                Prioritas: {priority}/5
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((p) => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={`flex-1 border-2 border-nb-black rounded-lg p-2.5 font-bold text-sm transition-all ${priority >= p ? "bg-nb-pink text-white" : "bg-white"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

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

      {/* Daftar Wishlist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wishlists.length === 0 ? (
          <NbCard>
            <div className="text-center py-8 text-nb-black/30 font-medium text-sm">
              Belum ada wishlist. Tambahkan impian kamu!
            </div>
          </NbCard>
        ) : (
          wishlists.map((item) => {
            const progress = getProgress(
              Number(item.saved_amount),
              Number(item.target_price)
            );
            return (
              <div key={item.id}
                className={`border-2 border-nb-black rounded-xl shadow-[3px_3px_0px_#0A0A0A] overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#0A0A0A] group ${item.is_achieved ? "bg-green-50" : "bg-white"}`}>

                {item.image_url ? (
                  <img src={item.image_url} alt={item.name}
                    className="w-full h-36 object-cover border-b-2 border-nb-black" />
                ) : (
                  <div className="w-full h-28 border-b-2 border-nb-black bg-gray-50 flex items-center justify-center">
                    <IconGift size={36} className="text-gray-300" />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-base leading-tight flex-1">
                      {item.name}
                    </h3>
                    {item.is_achieved && (
                      <span className="inline-flex items-center gap-1 bg-green-100 border border-green-200 rounded-md px-2 py-0.5 text-xs font-bold text-green-700 flex-shrink-0">
                        <IconCheck size={10} /> Tercapai
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-bold mb-0.5">
                    Target: {formatRupiah(Number(item.target_price))}
                  </div>
                  <div className="text-xs text-nb-black/50 font-medium mb-3">
                    Terkumpul: {formatRupiah(Number(item.saved_amount))}
                  </div>

                  <div className="mb-1.5">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span>Progress</span><span>{progress}%</span>
                    </div>
                    <div className="h-3 border-2 border-nb-black rounded-full bg-white overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progress >= 100 ? "bg-nb-green" : "bg-nb-blue"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-0.5 my-3">
                    {[1, 2, 3, 4, 5].map((p) => (
                      <IconStar key={p} size={14}
                        className={Number(item.priority) >= p
                          ? "text-nb-yellow fill-nb-yellow"
                          : "text-gray-200 fill-gray-200"} />
                    ))}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {!item.is_achieved && (
                      <>
                        <NbButton variant="green" size="sm"
                          onClick={() => handleUpdateSaved(item.id, Number(item.saved_amount))}>
                          <IconPigMoney size={14} /> Tabung
                        </NbButton>
                        {progress >= 100 && (
                          <NbButton variant="yellow" size="sm"
                            onClick={() => handleAchieve(item.id)}>
                            <IconCheck size={14} /> Tercapai!
                          </NbButton>
                        )}
                      </>
                    )}
                    {item.marketplace_url && (
                      <a href={item.marketplace_url} target="_blank" rel="noopener noreferrer">
                        <NbButton variant="blue" size="sm">
                          <IconExternalLink size={14} /> Beli
                        </NbButton>
                      </a>
                    )}
                    <NbButton variant="ghost" size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(item.id)}>
                      <IconTrash size={14} />
                    </NbButton>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </main>
  );
}