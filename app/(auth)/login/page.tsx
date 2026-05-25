"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import NbButton from "@/components/ui/NbButton";
import NbInput from "@/components/ui/NbInput";
import NbCard from "@/components/ui/NbCard";
import { IconArrowLeft, IconEye, IconEyeOff } from "@tabler/icons-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      // Cek query parameter "verified" atau hash bawaan supabase "type=signup"
      if (params.get("verified") === "true" || window.location.hash.includes("type=signup")) {
        setIsVerified(true);
      }
      if (params.get("pending") === "true") {
        setIsPending(true);
      }
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("Email belum dikonfirmasi! Silakan cek kotak masuk email kamu.");
      } else {
        setError("Email atau password salah!");
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
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
            Your Personal Productivity Hub
          </p>
        </div>

        {/* Notifikasi Email Berhasil Dikonfirmasi */}
        {isVerified && (
          <NbCard color="green" className="mb-4 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h2 className="font-black text-xl mb-1">Berhasil !</h2>
            <p className="font-medium text-sm opacity-80">
              Email kamu telah dikonfirmasi. Silakan login untuk melanjutkan!
            </p>
          </NbCard>
        )}

        {/* Notifikasi Menunggu Konfirmasi Email */}
        {isPending && !isVerified && (
          <NbCard color="yellow" className="mb-4 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <h2 className="font-black text-xl mb-1">Sedikit lagi !</h2>
            <p className="font-medium text-sm opacity-80">
              Link konfirmasi telah dikirim ke email kamu. Silakan periksa untuk mengaktifkan akun sebelum login.
            </p>
          </NbCard>
        )}

        {/* Form Card */}
        <NbCard className="mb-4">
          <h2 className="font-bold text-xl mb-6">Login</h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                placeholder="••••••••"
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
              variant="yellow"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Memuat..." : "Masuk Sekarang"}
            </NbButton>
          </form>
        </NbCard>

        {/* Link ke Register */}
        <NbCard color="black">
          <p className="text-white text-sm font-bold text-center">
            Belum punya akun?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-nb-yellow underline font-extrabold bg-transparent border-none cursor-pointer"
            >
              Daftar di sini
            </button>
          </p>
        </NbCard>

      </div>
    </main>
  );
}