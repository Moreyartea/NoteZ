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
        <div className="border-3 border-nb-yellow rounded-2xl p-6 shadow-[6px_6px_0px_#FFE135]">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M36 4L12 36H28L20 60L52 24H36L44 4H36Z"
              fill="#FFE135" stroke="#FFE135" strokeWidth="2"
              strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-nb-yellow font-black text-5xl tracking-widest">
            NubApp
          </h1>
          <p className="text-white/40 text-sm font-medium mt-2 tracking-widest uppercase">
            Your Personal Hub
          </p>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-col gap-3 w-full max-w-xs mb-16">
        {[
          { label: "To Do List", color: "bg-nb-yellow text-nb-black" },
          { label: "Catatan Keuangan", color: "bg-nb-green text-nb-black" },
          { label: "Wishlist Tracker", color: "bg-nb-pink text-white" },
        ].map((item, i) => (
          <div
            key={i}
            className={`
              border-2 border-white/20 rounded-xl px-5 py-3
              font-bold text-sm text-center
              ${item.color}
              animate-pulse
            `}
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            {item.label}
          </div>
        ))}
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