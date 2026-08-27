"use client";
import { useEffect, useState } from "react";
import { Users, UserPlus, Dumbbell, UtensilsCrossed, ChevronRight, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { authFetch } from "@/lib/api";

interface Student { id: number; name: string; email: string; role: string; createdAt: string; }
interface AllUser { id: number; name: string; email: string; role: string; coachId: number | null; }

export default function CoachStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"students" | "add">("students");
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([
      authFetch("/coach/students").then((r) => r.json()),
      authFetch("/coach/users").then((r) => r.json()),
    ]).then(([s, u]) => {
      setStudents(s);
      setAllUsers(u);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const assign = async (userId: number) => {
    await authFetch(`/coach/students/${userId}/assign`, { method: "POST" });
    load();
  };

  const remove = async (studentId: number) => {
    await authFetch(`/coach/students/${studentId}`, { method: "DELETE" });
    load();
  };

  const unassigned = allUsers.filter((u) => !u.coachId && u.role === "user"
    && u.name.toLowerCase().includes(search.toLowerCase()));

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
                <button onClick={() => remove(s.id)}
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text" placeholder="Buscar usuario por nombre..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
            />
          </div>
          {unassigned.length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-8">No hay usuarios sin coach disponibles.</p>
          )}
          {unassigned.map((u) => (
            <div key={u.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-zinc-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-zinc-500 text-sm">{u.email}</p>
                </div>
              </div>
              <button onClick={() => assign(u.id)}
                className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg text-sm font-bold transition-colors">
                <UserPlus className="w-4 h-4" /> Asignar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
