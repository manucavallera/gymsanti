"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function CoachAccessPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    fetch(`${API}/auth/coach-access/status`)
      .then((r) => r.json())
      .then((data) => setAvailable(data.available))
      .catch(() => setAvailable(false))
      .finally(() => setCheckingStatus(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError("Debes estar logueado para hacer esto"); return; }
    setError("");
    setSubmitting(true);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/auth/coach-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ secret }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al activar");
      }

      const { token: newToken } = await res.json();
      localStorage.setItem("token", newToken);
      document.cookie = `token=${newToken}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-400">Verificando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-fuchsia-600 rounded-xl flex items-center justify-center font-bold text-lg">
              G
            </div>
            <span className="text-2xl font-black tracking-tight">GYM CORE</span>
          </Link>
          <h1 className="text-3xl font-black">Acceso Coach</h1>
          <p className="text-zinc-400 mt-2">Activacion de cuenta coach</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {!available ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
              </div>
              <p className="text-zinc-300 font-semibold">Ya hay un coach registrado</p>
              <p className="text-zinc-500 text-sm mt-1">Esta pagina no esta disponible</p>
              <Link href="/dashboard" className="mt-5 inline-block text-fuchsia-500 hover:text-fuchsia-400 text-sm font-medium">
                Volver al inicio
              </Link>
            </div>
          ) : !user && !loading ? (
            <div className="text-center py-4">
              <p className="text-zinc-300 font-semibold">Necesitas estar logueado</p>
              <p className="text-zinc-500 text-sm mt-1">Inicia sesion primero para activar tu cuenta</p>
              <Link href="/login" className="mt-5 inline-block text-fuchsia-500 hover:text-fuchsia-400 text-sm font-medium">
                Ir al login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Contrasena de activacion
                  </label>
                  <input
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-colors"
                >
                  {submitting ? "Activando..." : "Activar cuenta coach"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
