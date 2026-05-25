"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import NbButton from "@/components/ui/NbButton";
import NbInput from "@/components/ui/NbInput";
import NbCard from "@/components/ui/NbCard";
import { IconArrowLeft, IconEye, IconEyeOff } from "@tabler/icons-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
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
      <main className="min-h-screen bg-nb-bg flex items-center justify-center p-4 relative">
        {/* Navbar Auth */}
        <nav className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
          <NbButton variant="ghost" size="md" onClick={() => router.push("/profile")}>
            <IconArrowLeft size={18} /> Kembali
          </NbButton>
        </nav>

        <NbCard color="green" className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="font-black text-2xl mb-2">Sedikit lagi !</h2>
          <div className="bg-white text-nb-black border-2 border-nb-black rounded-lg p-3 mb-6">
            <p className="font-bold text-sm">
              PENTING: Link konfirmasi telah dikirim ke email kamu.
            </p>
            <p className="font-medium text-xs mt-1 opacity-80">
              Silakan periksa kotak masuk (atau folder spam) untuk mengaktifkan akun sebelum login.
            </p>
          </div>
          <NbButton
            variant="black"
            size="lg"
            className="w-full"
            onClick={() => router.push("/login?pending=true")}
          >
            Pergi ke Login
          </NbButton>
        </NbCard>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-nb-bg flex flex-col items-center justify-center p-4 relative">
      
      {/* Navbar Auth */}
      <nav className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
        <NbButton variant="ghost" size="md" onClick={() => router.push("/profile")}>
          <IconArrowLeft size={18} /> Kembali
        </NbButton>
      </nav>

      <div className="w-full max-w-md mt-16 md:mt-0">

        {/* Logo */}
        <div className="border-2 border-nb-black bg-nb-black rounded-xl text-nb-yellow p-4 mb-6 text-center shadow-[4px_4px_0px_#0A0A0A]">
          <h1 className="font-black text-3xl tracking-widest">NoteZ</h1>
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

            <div className="relative">
              <NbInput
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-3 text-nb-black/50 hover:text-nb-black transition-colors"
              >
                {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </button>
            </div>

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