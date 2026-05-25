"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import NbCard from "@/components/ui/NbCard";
import NbButton from "@/components/ui/NbButton";
import NbInput from "@/components/ui/NbInput";
import {
  IconUser, IconEdit, IconCheck,
  IconMail, IconCalendar, IconBolt,
  IconX, IconUpload, IconTrash, IconArrowLeft, IconLogout,
  IconCloudUpload, IconCloudCheck, IconAlertTriangle,
} from "@tabler/icons-react";
import {
  getTodos, getTransactions, getWishlists,
  type Todo, type Transaction, type Wishlist,
} from "@/app/lib/storage";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

type SyncStatus = "idle" | "syncing" | "success" | "error";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ todos: 0, transactions: 0, wishlists: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncMessage, setSyncMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);

    if (!user) {
      // Mode offline — baca profil dari localStorage
      const localProfileStr = localStorage.getItem("notez_profile");
      if (localProfileStr) {
        const p = JSON.parse(localProfileStr);
        setFullName(p.full_name || "");
        setBio(p.bio || "");
        setAvatarUrl(p.avatar_url || null);
      }

      // Stats offline — key tanpa userId
      const todos = getTodos();
      const transactions = getTransactions();
      const wishlists = getWishlists();
      setStats({
        todos: todos.length,
        transactions: transactions.length,
        wishlists: wishlists.length,
      });
      setLoading(false);
      return;
    }

    // Mode login — baca profil dari Supabase
    setEmail(user.email || "");

    const { data: profileData, error: profileError } = await supabase
      .from("profiles").select("*").eq("id", user.id).maybeSingle();

    if (profileError) {
      console.error("Gagal memuat profil:", profileError.message);
    }

    if (profileData) {
      setProfile(profileData);
      setFullName(profileData.full_name || "");
      setBio(profileData.bio || "");
      setAvatarUrl(profileData.avatar_url || null);
    }

    // ✅ FIX: Stats saat login — baca dari localStorage dengan userId
    const todos = getTodos(user.id);
    const transactions = getTransactions(user.id);
    const wishlists = getWishlists(user.id);
    setStats({
      todos: todos.length,
      transactions: transactions.length,
      wishlists: wishlists.length,
    });

    setLoading(false);
  }

  // ✅ FITUR BARU: Backup/Sync ke Supabase
  async function handleSync() {
    setSyncStatus("syncing");
    setSyncMessage("Menyinkronkan data...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kamu harus login untuk backup.");

      const todos = getTodos(user.id);
      const transactions = getTransactions(user.id);
      const wishlists = getWishlists(user.id);

      // Sync Todos — upsert semua data lokal ke Supabase
      if (todos.length > 0) {
        const { error } = await supabase.from("todos").upsert(
          todos.map((t: Todo) => ({ ...t, user_id: user.id })),
          { onConflict: "id" }
        );
        if (error) throw new Error("Gagal sync todos: " + error.message);
      }

      // Sync Transactions
      if (transactions.length > 0) {
        const { error } = await supabase.from("transactions").upsert(
          transactions.map((t: Transaction) => ({ ...t, user_id: user.id })),
          { onConflict: "id" }
        );
        if (error) throw new Error("Gagal sync transaksi: " + error.message);
      }

      // Sync Wishlists
      if (wishlists.length > 0) {
        const { error } = await supabase.from("wishlists").upsert(
          wishlists.map((w: Wishlist) => ({ ...w, user_id: user.id })),
          { onConflict: "id" }
        );
        if (error) throw new Error("Gagal sync wishlist: " + error.message);
      }

      const total = todos.length + transactions.length + wishlists.length;
      setSyncStatus("success");
      setSyncMessage(
        `Berhasil backup ${total} item (${todos.length} tugas, ${transactions.length} transaksi, ${wishlists.length} wishlist)`
      );
    } catch (err: unknown) {
      setSyncStatus("error");
      setSyncMessage(err instanceof Error ? err.message : "Sync gagal, coba lagi.");
    }

    // Reset status setelah 4 detik
    setTimeout(() => {
      setSyncStatus("idle");
      setSyncMessage("");
    }, 4000);
  }

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      localStorage.setItem("notez_profile", JSON.stringify({
        full_name: fullName,
        bio: bio,
        avatar_url: avatarUrl
      }));
      setEditing(false);
      setSaving(false);
      loadProfile();
      window.dispatchEvent(new Event("profileUpdated"));
      return;
    }

    let { data, error } = await supabase.from("profiles").update({
      full_name: fullName,
      bio: bio || null,
      avatar_url: avatarUrl || null,
    }).eq("id", user.id).select().maybeSingle();

    if (!error && !data) {
      const res = await supabase.from("profiles").insert({
        id: user.id,
        full_name: fullName,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      }).select().maybeSingle();
      data = res.data;
      error = res.error;
    }

    if (error) {
      alert("Gagal menyimpan profil: " + error.message);
    } else if (data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setBio(data.bio || null);
      setAvatarUrl(data.avatar_url || null);
      window.dispatchEvent(new Event("profileUpdated"));
    }

    setEditing(false);
    setSaving(false);
  }

  async function handleAvatarUpload(file: File) {
    setUploadingAvatar(true);
    let finalAvatarUrl: string | null = null;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      finalAvatarUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const localProfileStr = localStorage.getItem("notez_profile");
      const p = localProfileStr ? JSON.parse(localProfileStr) : {};
      localStorage.setItem("notez_profile", JSON.stringify({ ...p, avatar_url: finalAvatarUrl }));
      setAvatarUrl(finalAvatarUrl);
      window.dispatchEvent(new Event("profileUpdated"));
    } else {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("avatars").upload(fileName, file, { upsert: true });

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
        finalAvatarUrl = publicUrl;

        let { data: newProfile, error: updateError } = await supabase.from("profiles").update({
          avatar_url: finalAvatarUrl,
        }).eq("id", user.id).select().maybeSingle();

        if (!updateError && !newProfile) {
          const res = await supabase.from("profiles").insert({
            id: user.id, full_name: fullName, bio: bio || null, avatar_url: finalAvatarUrl,
          }).select().maybeSingle();
          newProfile = res.data;
          updateError = res.error;
        }

        if (updateError) {
          alert("Gagal menyimpan URL foto di database: " + updateError.message);
        } else if (newProfile) {
          setProfile(newProfile);
          setAvatarUrl(newProfile.avatar_url || null);
          window.dispatchEvent(new Event("profileUpdated"));
        }
      } else if (uploadError) {
        alert("Gagal mengunggah foto: " + uploadError.message);
      }
    }

    setUploadingAvatar(false);
    setShowAvatarModal(false);
  }

  async function handleAvatarDelete() {
    setUploadingAvatar(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const localProfileStr = localStorage.getItem("notez_profile");
      if (localProfileStr) {
        const p = JSON.parse(localProfileStr);
        localStorage.setItem("notez_profile", JSON.stringify({ ...p, avatar_url: null }));
        setAvatarUrl(null);
        window.dispatchEvent(new Event("profileUpdated"));
      }
    } else {
      let { data: newProfile, error } = await supabase.from("profiles").update({
        avatar_url: null,
      }).eq("id", user.id).select().maybeSingle();

      if (!error && !newProfile) {
        const res = await supabase.from("profiles").insert({
          id: user.id, full_name: fullName, bio: bio || null, avatar_url: null,
        }).select().maybeSingle();
        newProfile = res.data;
        error = res.error;
      }

      if (error) {
        alert("Gagal menghapus foto dari database: " + error.message);
      } else if (newProfile) {
        setProfile(newProfile);
        setAvatarUrl(newProfile.avatar_url || null);
        window.dispatchEvent(new Event("profileUpdated"));
      }
    }

    setUploadingAvatar(false);
    setShowAvatarModal(false);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.dispatchEvent(new Event("profileUpdated"));
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-[80vh] items-center justify-center">
        <NbCard color="yellow"><div className="font-bold text-lg">Memuat profil...</div></NbCard>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="border-2 border-nb-black bg-nb-black rounded-xl shadow-[4px_4px_0px_#0A0A0A] p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-nb-blue border-2 border-nb-black rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 p-2 w-10 h-10">
            <IconUser size={20} className="text-white" />
          </div>
          <div>
            <div className="text-nb-yellow font-bold text-base">Profil</div>
            <div className="text-white/50 text-xs font-medium mt-0.5">Pengaturan akun kamu</div>
          </div>
        </div>
        <NbButton variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <IconArrowLeft size={15} /> Beranda
        </NbButton>
      </div>

      {/* Avatar & Nama */}
      <NbCard className="mb-4">
        <div className="flex items-center gap-4">
          <div
            onClick={() => setShowAvatarModal(true)}
            className="w-16 h-16 border-2 border-nb-black rounded-xl bg-nb-yellow flex items-center justify-center flex-shrink-0 shadow-[3px_3px_0px_#0A0A0A] overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#0A0A0A] transition-all"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black">
                {fullName ? fullName[0].toUpperCase() : "?"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-xl leading-tight truncate">
              {fullName || "Pengguna NoteZ"}
            </div>
            {email && (
              <div className="flex items-center gap-1.5 mt-1 text-nb-black/50 text-xs font-medium">
                <IconMail size={12} /> {email}
              </div>
            )}
            {!isLoggedIn && !email && (
              <div className="flex items-center gap-1.5 mt-1 text-nb-black/50 text-xs font-medium">
                <IconUser size={12} /> Offline Mode
              </div>
            )}
            {profile?.created_at && (
              <div className="flex items-center gap-1.5 mt-0.5 text-nb-black/40 text-xs font-medium">
                <IconCalendar size={12} /> Bergabung {formatDate(profile.created_at)}
              </div>
            )}
          </div>
        </div>
        {bio && !editing && (
          <p className="mt-3 text-sm text-nb-black/60 font-medium border-t border-gray-100 pt-3">
            {bio}
          </p>
        )}
      </NbCard>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <NbCard color="yellow">
          <div className="text-2xl font-black">{stats.todos}</div>
          <div className="text-xs font-bold uppercase tracking-widest opacity-60 mt-0.5">Tugas</div>
        </NbCard>
        <NbCard color="green">
          <div className="text-2xl font-black">{stats.transactions}</div>
          <div className="text-xs font-bold uppercase tracking-widest opacity-60 mt-0.5">Transaksi</div>
        </NbCard>
        <NbCard color="blue">
          <div className="text-2xl font-black text-white">{stats.wishlists}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/60 mt-0.5">Wishlist</div>
        </NbCard>
      </div>

      {/* Edit Form */}
      {editing ? (
        <NbCard className="mb-4">
          <div className="font-bold text-base mb-4">Edit Profil</div>
          <div className="flex flex-col gap-3">
            <NbInput
              label="Nama lengkap"
              type="text"
              placeholder="Nama kamu..."
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-nb-black/60">
                Bio (opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Cerita sedikit tentang kamu..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="border-2 border-nb-black rounded-lg shadow-[2px_2px_0px_#0A0A0A] px-3.5 py-2.5 text-sm font-semibold bg-white outline-none focus:shadow-[4px_4px_0px_#0A0A0A] transition-shadow duration-100 placeholder:text-gray-300 placeholder:font-normal resize-none"
              />
            </div>
            <div className="flex gap-3 mt-1">
              <NbButton variant="black" size="lg" onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? "Menyimpan..." : <><IconCheck size={16} /> Simpan</>}
              </NbButton>
              <NbButton variant="ghost" onClick={() => { setEditing(false); loadProfile(); }}>
                Batal
              </NbButton>
            </div>
          </div>
        </NbCard>
      ) : (
        <NbButton variant="yellow" size="lg" className="w-full mb-4" onClick={() => setEditing(true)}>
          <IconEdit size={18} /> Edit Profil
        </NbButton>
      )}

      {/* ✅ BACKUP/SYNC — hanya tampil saat login */}
      {isLoggedIn && (
        <NbCard className="mb-4">
          <div className="font-bold text-sm mb-1">Backup & Sinkronisasi</div>
          <p className="text-xs text-nb-black/50 font-medium mb-3">
            Kirim semua data lokal (todos, transaksi, wishlist) ke cloud Supabase.
          </p>

          {/* Status feedback */}
          {syncStatus === "success" && (
            <div className="flex items-start gap-2 bg-green-50 border-2 border-green-400 rounded-lg p-3 mb-3 text-green-700 text-xs font-semibold">
              <IconCloudCheck size={16} className="flex-shrink-0 mt-0.5" />
              {syncMessage}
            </div>
          )}
          {syncStatus === "error" && (
            <div className="flex items-start gap-2 bg-red-50 border-2 border-red-400 rounded-lg p-3 mb-3 text-red-700 text-xs font-semibold">
              <IconAlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              {syncMessage}
            </div>
          )}

          <NbButton
            variant="blue"
            size="lg"
            className="w-full"
            onClick={handleSync}
            disabled={syncStatus === "syncing"}
          >
            {syncStatus === "syncing" ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Menyinkronkan...
              </>
            ) : syncStatus === "success" ? (
              <><IconCloudCheck size={18} /> Backup Berhasil!</>
            ) : (
              <><IconCloudUpload size={18} /> Backup ke Cloud</>
            )}
          </NbButton>
        </NbCard>
      )}

      {/* Login Prompt for Offline Users */}
      {!isLoggedIn && (
        <NbCard color="blue" className="mb-4 text-center">
          <p className="font-bold text-sm mb-4">Kamu belum login. Login untuk backup ke cloud!</p>
          <NbButton variant="ghost" onClick={() => router.push("/login")}>
            Pergi ke Halaman Login
          </NbButton>
        </NbCard>
      )}

      {/* Logout Button */}
      {isLoggedIn && (
        <NbButton
          variant="ghost"
          size="lg"
          className="w-full mb-4 text-nb-pink hover:bg-red-50"
          onClick={handleLogout}
        >
          <IconLogout size={18} /> Keluar (Logout)
        </NbButton>
      )}

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <NbCard className="max-w-sm w-full relative">
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-4 right-4 text-nb-black/50 hover:text-nb-black transition-colors"
            >
              <IconX size={24} />
            </button>
            <div className="flex flex-col items-center gap-6 pt-4">
              <div className="w-40 h-40 md:w-48 md:h-48 border-4 border-nb-black rounded-full bg-nb-yellow flex items-center justify-center flex-shrink-0 shadow-[4px_4px_0px_#0A0A0A] overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl font-black">
                    {fullName ? fullName[0].toUpperCase() : "?"}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3 w-full">
                <input
                  type="file"
                  accept="image/*"
                  id="avatar-upload"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAvatarUpload(e.target.files[0]);
                    }
                  }}
                />
                <NbButton
                  variant="blue"
                  size="lg"
                  className="w-full"
                  disabled={uploadingAvatar}
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <IconUpload size={18} /> {uploadingAvatar ? "Mengunggah..." : "Upload Gambar Baru"}
                </NbButton>
                {avatarUrl && (
                  <NbButton
                    variant="ghost"
                    size="lg"
                    className="w-full text-nb-pink hover:bg-red-50"
                    disabled={uploadingAvatar}
                    onClick={handleAvatarDelete}
                  >
                    <IconTrash size={18} /> Hapus Gambar
                  </NbButton>
                )}
              </div>
            </div>
          </NbCard>
        </div>
      )}

      {/* Footer */}
      <NbCard color="black">
        <div className="flex items-center justify-center gap-2 text-nb-green text-xs font-bold">
          <IconBolt size={14} />
          NoteZ v1.1 — Next.js 15 + Supabase
        </div>
      </NbCard>

    </div>
  );
}