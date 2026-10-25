"use client";
import { useEffect, useState } from "react";
import { Users, UserPlus, Dumbbell, UtensilsCrossed, ChevronRight, Trash2, Copy, Check } from "lucide-react";
import Link from "next/link";
import { authFetch, ensureOk } from "@/lib/api";

interface Student { id: number; name: string; email: string; role: string; createdAt: string; }

export default function CoachStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  // Last created login, shown once so the coach can pass it to the student.
  const [created, setCreated] = useState<{ name: string; email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"students" | "add">("students");
  const [loading, setLoading] = useState(true);

  const load = () => {
    authFetch("/coach/students")
      .then((r) => r.json())
      .then(setStudents)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const createStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const r = await authFetch("/coach/students", { method: "POST", body: JSON.stringify(form) }).then(ensureOk);
      const s = await r.json();
      setCreated({ name: s.name, email: s.email, password: form.password });
      setCopied(false);
      setForm({ name: "", email: "", password: "" });
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo crear el alumno");
    } finally {
      setSaving(false);
    }
  };

  const copyLogin = async () => {
    if (!created) return;
    const text = `Hola ${created.name}! Tu acceso a GYM CORE:\nEmail: ${created.email}\nContraseña: ${created.password}\nEntrá en ${window.location.origin}/login`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {}
  };

  const remove = async (studentId: number, name: string) => {
    if (!confirm(`¿Quitar a ${name} de tus alumnos?`)) return;
    await authFetch(`/coach/students/${studentId}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Mis Alumnos</h2>
          <p className="text-zinc-400 mt-1">{students.length} alumno{students.length !== 1 ? "s" : ""} asignado{students.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab("students")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === "students" ? "bg-fuchsia-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`}>
            <Users className="w-4 h-4 inline mr-2" />Mis alumnos
          </button>
          <button onClick={() => setTab("add")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === "add" ? "bg-fuchsia-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`}>
            <UserPlus className="w-4 h-4 inline mr-2" />Agregar
          </button>
        </div>
      </div>

      {tab === "students" && (
        <div className="space-y-3">
          {loading && <p className="text-zinc-500 text-sm">Cargando...</p>}
          {!loading && students.length === 0 && (
            <div className="text-center py-16 bg-zinc-900 border border-white/10 rounded-2xl">
              <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400">No tenés alumnos asignados todavía.</p>
              <button onClick={() => setTab("add")} className="mt-4 text-fuchsia-400 hover:text-fuchsia-300 text-sm font-bold">
                Agregar alumno →
              </button>
            </div>
          )}
          {students.map((s) => (
            <div key={s.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:border-fuchsia-600/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-fuchsia-600 rounded-full flex items-center justify-center font-black text-sm">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{s.name}</p>
                  <p className="text-zinc-500 text-sm">{s.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/coach/students/${s.id}/routine`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-fuchsia-600/20 hover:text-fuchsia-400 rounded-lg text-sm text-zinc-400 transition-colors">
                  <Dumbbell className="w-3.5 h-3.5" /> Rutina
                </Link>
                <Link href={`/coach/students/${s.id}/nutrition`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-fuchsia-600/20 hover:text-fuchsia-400 rounded-lg text-sm text-zinc-400 transition-colors">
                  <UtensilsCrossed className="w-3.5 h-3.5" /> Nutrición
                </Link>
                <Link href={`/coach/students/${s.id}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg text-sm text-white font-bold transition-colors">
                  Ver perfil <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button onClick={() => remove(s.id, s.name)}
                  className="p-2 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-800">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "add" && (
        <div className="space-y-4">
          {created && (
            <div className="rounded-2xl border border-green-600/30 bg-green-600/10 p-5 space-y-3">
              <p className="font-bold text-green-400">Alumno creado. Pasale estos datos para que entre:</p>
              <div className="text-sm space-y-1">
                <p><span className="text-zinc-400">Email:</span> {created.email}</p>
                <p><span className="text-zinc-400">Contraseña:</span> {created.password}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={copyLogin}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copiado" : "Copiar mensaje"}
                </button>
                <button onClick={() => { setCreated(null); setTab("students"); }}
                  className="px-4 py-2 text-zinc-400 hover:text-white text-sm font-bold">
                  Ver mis alumnos
                </button>
              </div>
            </div>
          )}

          <form onSubmit={createStudent} className="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">Nuevo alumno</h3>
              <p className="text-zinc-500 text-sm">Creás su usuario y contraseña. Después el alumno entra y ve lo que le cargues.</p>
            </div>
            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">{formError}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre y apellido</label>
              <input type="text" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Juan Pérez" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="juan@email.com" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Contraseña</label>
              <input type="text" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres" autoComplete="off" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
            </div>
            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold uppercase tracking-wide transition-colors">
              <UserPlus className="w-4 h-4" /> {saving ? "Creando..." : "Crear alumno"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
