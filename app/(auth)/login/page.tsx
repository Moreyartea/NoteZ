"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import NbButton from "@/components/ui/NbButton";
import NbInput from "@/components/ui/NbInput";
import NbCard from "@/components/ui/NbCard";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email atau password salah!");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-nb-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="border-2 border-nb-black bg-nb-black rounded-xl text-nb-yellow p-4 mb-6 text-center shadow-[4px_4px_0px_#0A0A0A]">
          <h1 className="font-black text-3xl tracking-widest">NubApp</h1>
          <p className="text-white/50 text-xs font-medium mt-1">
            Your Personal Productivity Hub
          </p>
        </div>

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

            <NbInput
              label="Password"
              type="password"
              placeholder="••••••••"
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