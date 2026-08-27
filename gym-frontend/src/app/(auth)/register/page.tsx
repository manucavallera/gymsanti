"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Dumbbell, Users, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";

interface Coach { id: number; name: string; email: string; }

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "coach">("user");
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/coach/public/coaches`)
      .then((r) => r.json())
      .then(setCoaches)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "user" && !selectedCoachId) {
      setError("Elegí un coach para continuar");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(email, name, password, role, selectedCoachId ?? undefined);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-fuchsia-600 rounded-xl flex items-center justify-center font-black text-lg">G</div>
            <span className="text-2xl font-black tracking-widest uppercase">GYM CORE</span>
          </Link>
          <h1 className="text-3xl font-black uppercase">Creá tu cuenta</h1>
          <p className="text-zinc-400 mt-2">Empezá tu camino hoy</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Rol */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-zinc-300 mb-3">Soy...</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setRole("user")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${role === "user" ? "border-fuchsia-600 bg-fuchsia-600/10 text-fuchsia-400" : "border-zinc-700 text-zinc-500 hover:border-zinc-500"}`}>
                  <Dumbbell className="w-6 h-6" />
                  <span className="font-bold text-sm">Alumno</span>
                  <span className="text-xs text-center opacity-70">Quiero entrenar y seguir mi progreso</span>
                </button>
                <button type="button" onClick={() => { setRole("coach"); setSelectedCoachId(null); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${role === "coach" ? "border-fuchsia-600 bg-fuchsia-600/10 text-fuchsia-400" : "border-zinc-700 text-zinc-500 hover:border-zinc-500"}`}>
                  <Users className="w-6 h-6" />
                  <span className="font-bold text-sm">Coach</span>
                  <span className="text-xs text-center opacity-70">Quiero gestionar alumnos y planes</span>
                </button>
              </div>
            </div>

            {/* Selección de coach — solo si es alumno */}
            {role === "user" && (
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide text-zinc-300 mb-3">Elegí tu coach</label>
                {coaches.length === 0 ? (
                  <div className="text-center py-6 bg-zinc-800 rounded-xl border border-zinc-700">
                    <p className="text-zinc-500 text-sm">No hay coaches disponibles todavía.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {coaches.map((c) => (
                      <button key={c.id} type="button" onClick={() => setSelectedCoachId(c.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${selectedCoachId === c.id ? "border-fuchsia-600 bg-fuchsia-600/10" : "border-zinc-700 hover:border-zinc-500"}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-fuchsia-600 rounded-full flex items-center justify-center font-black text-sm text-white">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <p className={`font-bold text-sm ${selectedCoachId === c.id ? "text-fuchsia-400" : "text-white"}`}>{c.name}</p>
                            <p className="text-zinc-500 text-xs">{c.email}</p>
                          </div>
                        </div>
                        {selectedCoachId === c.id && <CheckCircle2 className="w-5 h-5 text-fuchsia-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Tu nombre"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
            </div>

            <button type="submit" disabled={loading || (role === "user" && coaches.length > 0 && !selectedCoachId)}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold uppercase tracking-wide transition-colors">
              {loading ? "Creando cuenta..." : `Crear cuenta como ${role === "coach" ? "Coach" : "Alumno"}`}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-fuchsia-500 hover:text-fuchsia-400 font-medium">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}
