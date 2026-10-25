"use client";
import { useState } from "react";
import Link from "next/link";
import { Dumbbell, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";

// Public signup is for coaches only. Students get their login from their coach.
export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "coach">("user");
  const [coachCode, setCoachCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, name, password, coachCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors";
  const roleBtn = (active: boolean) =>
    `flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${active ? "border-fuchsia-600 bg-fuchsia-600/10 text-fuchsia-400" : "border-zinc-700 text-zinc-500 hover:border-zinc-500"}`;

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

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-8 space-y-5">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide text-zinc-300 mb-3">Soy...</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRole("user")} className={roleBtn(role === "user")}>
                <Dumbbell className="w-6 h-6" />
                <span className="font-bold text-sm">Alumno</span>
                <span className="text-xs text-center opacity-70">Quiero entrenar y seguir mi progreso</span>
              </button>
              <button type="button" onClick={() => setRole("coach")} className={roleBtn(role === "coach")}>
                <Users className="w-6 h-6" />
                <span className="font-bold text-sm">Coach</span>
                <span className="text-xs text-center opacity-70">Quiero gestionar alumnos y planes</span>
              </button>
            </div>
          </div>

          {role === "user" && (
            <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-5 text-center space-y-3">
              <p className="font-bold">Tu coach te crea la cuenta</p>
              <p className="text-zinc-400 text-sm">Pedile tu email y contraseña, y entrá con esos datos.</p>
              <Link href="/login"
                className="inline-block bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-wide text-sm transition-colors">
                Iniciar sesión
              </Link>
            </div>
          )}

          {role === "coach" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Código de coach</label>
                <input type="password" value={coachCode} onChange={(e) => setCoachCode(e.target.value)} required placeholder="Te lo da el administrador" className={input} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Tu nombre" className={input} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" className={input} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" className={input} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold uppercase tracking-wide transition-colors">
                {loading ? "Creando cuenta..." : "Crear cuenta como Coach"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-fuchsia-500 hover:text-fuchsia-400 font-medium">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}
