"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-nb-black flex flex-col items-center justify-center p-8">

      {/* Logo */}
      <div className="flex flex-col items-center gap-6 mb-16">
        <img
          src="/logo_app.svg"
          alt="NoteZ Logo"
          className="w-20 h-20"
        />

        <div className="text-center">
          <h1 className="text-nb-yellow font-black text-5xl tracking-widest">
            NoteZ
          </h1>
          <p className="text-white/40 text-sm font-medium mt-2 tracking-widest uppercase">
            Your Personal Hub
          </p>
        </div>
      </div>

      {/* Loading dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-nb-yellow animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

    </main>
  );
}