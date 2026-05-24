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
} from "@tabler/icons-react";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ todos: 0, transactions: 0, wishlists: 0 });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    setEmail(user.email || "");

    const { data: profileData } = await supabase
      .from("profiles").select("*").eq("id", user.id).single();

    if (profileData) {
      setProfile(profileData);
      setFullName(profileData.full_name || "");
      setBio(profileData.bio || "");
    }

    // Load stats
    const [{ count: todoCount }, { count: txCount }, { count: wlCount }] = await Promise.all([
      supabase.from("todos").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("transactions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("wishlists").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

    setStats({
      todos: todoCount || 0,
      transactions: txCount || 0,
      wishlists: wlCount || 0,
    });

    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      bio: bio || null,
      updated_at: new Date().toISOString(),
    });

    setEditing(false);
    setSaving(false);
    loadProfile();
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-nb-bg flex items-center justify-center">
        <NbCard color="yellow"><div className="font-bold text-lg">Memuat profil...</div></NbCard>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-nb-bg p-4 md:p-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="border-2 border-nb-black bg-nb-black rounded-xl shadow-[4px_4px_0px_#0A0A0A] p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-nb-blue border-2 border-nb-black rounded-lg p-2">
            <IconUser size={20} className="text-white" />
          </div>
          <div>
            <div className="text-nb-yellow font-bold text-base">Profil</div>
            <div className="text-white/50 text-xs font-medium mt-0.5">Pengaturan akun kamu</div>
          </div>
        </div>
      </div>

      {/* Avatar & Nama */}
      <NbCard className="mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-2 border-nb-black rounded-xl bg-nb-yellow flex items-center justify-center flex-shrink-0 shadow-[3px_3px_0px_#0A0A0A]">
            <span className="text-2xl font-black">
              {fullName ? fullName[0].toUpperCase() : "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-xl leading-tight truncate">
              {fullName || "Pengguna NubApp"}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-nb-black/50 text-xs font-medium">
              <IconMail size={12} /> {email}
            </div>
            {profile?.created_at && (
              <div className="flex items-center gap-1.5 mt-0.5 text-nb-black/40 text-xs font-medium">
                <IconCalendar size={12} /> Bergabung {formatDate(profile.created_at)}
              </div>
            )}
          </div>
        </div>
        {profile?.bio && !editing && (
          <p className="mt-3 text-sm text-nb-black/60 font-medium border-t border-gray-100 pt-3">
            {profile.bio}
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
              <NbButton variant="ghost" onClick={() => setEditing(false)}>Batal</NbButton>
            </div>
          </div>
        </NbCard>
      ) : (
        <NbButton variant="yellow" size="lg" className="w-full mb-4" onClick={() => setEditing(true)}>
          <IconEdit size={18} /> Edit Profil
        </NbButton>
      )}

      {/* Footer */}
      <NbCard color="black">
        <div className="flex items-center justify-center gap-2 text-nb-green text-xs font-bold">
          <IconBolt size={14} />
          NubApp v1.0 — Next.js 15 + Supabase
        </div>
      </NbCard>

    </main>
  );
}