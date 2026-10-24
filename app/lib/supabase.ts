import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        global: {
          fetch: async (url, options) => {
            try {
              return await fetch(url, options);
            } catch {
              // Menangani kegagalan jaringan saat offline atau host Supabase tidak dapat dijangkau
              // sehingga tidak memunculkan unhandled TypeError: Failed to fetch di console browser
              return new Response(
                JSON.stringify({
                  message: "Offline mode or network unreachable",
                }),
                {
                  status: 503,
                  headers: { "Content-Type": "application/json" },
                }
              );
            }
          },
        },
      }
    );
  }
  return client;
}

/**
 * Mengambil informasi user aktif dari session lokal tanpa memicu request jaringan berulang.
 * Mengembalikan null jika pengguna belum login atau berada dalam mode offline.
 */
export async function getCurrentUser() {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
  } catch {
    return null;
  }
}