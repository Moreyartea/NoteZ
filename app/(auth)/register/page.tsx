"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import NbButton from "@/components/ui/NbButton";
import NbInput from "@/components/ui/NbInput";
import NbCard from "@/components/ui/NbCard";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password minimal 6 karakter!");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <main className="min-h-screen bg-nb-bg flex items-center justify-center p-4">
        <NbCard color="green" className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="font-black text-2xl mb-2">Berhasil Daftar!</h2>
          <p className="font-medium text-sm mb-6 opacity-70">
            Cek email kamu untuk konfirmasi akun, lalu login!
          </p>
          <NbButton
            variant="black"
            size="lg"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Pergi ke Login
          </NbButton>
        </NbCard>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-nb-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="border-2 border-nb-black bg-nb-black rounded-xl text-nb-yellow p-4 mb-6 text-center shadow-[4px_4px_0px_#0A0A0A]">
          <h1 className="font-black text-3xl tracking-widest">NubApp</h1>
          <p className="text-white/50 text-xs font-medium mt-1">
            Buat Akun Baru
          </p>
        </div>

        {/* Form Card */}
        <NbCard className="mb-4">
          <h2 className="font-bold text-xl mb-6">Daftar</h2>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <NbInput
              label="Nama Lengkap"
              type="text"
              placeholder="Nama kamu"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <NbInput
              label="Email"
              type="email"
              placeholder="email@kamu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <NbInput
              label="Password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="border-2 border-nb-black rounded-lg bg-nb-pink text-white p-3 font-bold text-sm">
                {error}
              </div>
            )}

            <NbButton
              type="submit"
              variant="blue"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Memuat..." : "Buat Akun"}
            </NbButton>
          </form>
        </NbCard>

        {/* Link ke Login */}
        <NbCard color="black">
          <p className="text-white text-sm font-bold text-center">
            Sudah punya akun?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-nb-yellow underline font-extrabold bg-transparent border-none cursor-pointer"
            >
              Login di sini
            </button>
          </p>
        </NbCard>

      </div>
    </main>
  );
}