"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Dumbbell, Plus, Trash2, ArrowLeft, Save, Edit2, ChevronDown, ChevronUp, Check, X, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { authFetch } from "@/lib/api";

interface RoutineExercise { id: number; name: string; sets: number; reps: string; weight: string; notes: string; order: number; }
interface RoutineDay { id: number; name: string; order: number; exercises: RoutineExercise[]; }
interface Routine { id: number; name: string; description: string; days: RoutineDay[]; }

const emptyEx = { name: "", sets: "", reps: "", weight: "", notes: "" };

export default function CoachStudentRoutinePage() {
  const { id: studentId } = useParams<{ id: string }>();
  const [allRoutines, setAllRoutines] = useState<Routine[]>([]);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [newRoutine, setNewRoutine] = useState({ name: "", description: "" });
  const [newDay, setNewDay] = useState("");
  const [newEx, setNewEx] = useState<Record<number, typeof emptyEx>>({});
  const [editEx, setEditEx] = useState<Record<number, typeof emptyEx & { open: boolean }>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await authFetch(`/routines/coach/students/${studentId}/all`);
      if (!r.ok) { setLoading(false); return; }
      const list: Routine[] = await r.json();
      setAllRoutines(list);
      if (list[0]) {
        const detail = await authFetch(`/routines/coach/${list[0].id}`).then((r) => r.json());
        setRoutine(detail);
        if (detail.days?.length) setOpenDay(detail.days[0].id);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [studentId]);

  const selectRoutine = async (id: number) => {
    setLoading(true);
    const detail = await authFetch(`/routines/coach/${id}`).then((r) => r.json());
    setRoutine(detail);
    setOpenDay(detail.days?.length ? detail.days[0].id : null);
    setLoading(false);
  };

  const createRoutine = async () => {
    if (!newRoutine.name) return;
    const r = await authFetch(`/routines/coach/students/${studentId}`, {
      method: "POST", body: JSON.stringify(newRoutine),
    });
    const created = await r.json();
    setAllRoutines((p) => [...p, { ...created, days: [] }]);
    setRoutine({ ...created, days: [] });
    setCreating(false);
    setNewRoutine({ name: "", description: "" });
  };

  const addDay = async () => {
    if (!newDay.trim() || !routine) return;
    const r = await authFetch(`/routines/coach/${routine.id}/days`, {
      method: "POST", body: JSON.stringify({ name: newDay, order: routine.days.length }),
    });
    const day = await r.json();
    setRoutine((p) => p ? { ...p, days: [...p.days, { ...day, exercises: [] }] } : p);
    setNewDay("");
    setOpenDay(day.id);
  };

  const deleteDay = async (dayId: number) => {
    await authFetch(`/routines/coach/days/${dayId}`, { method: "DELETE" });
    setRoutine((p) => p ? { ...p, days: p.days.filter((d) => d.id !== dayId) } : p);
  };

  const reorderDay = async (dayId: number, dir: "up" | "down") => {
    if (!routine) return;
    const sorted = [...routine.days].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((d) => d.id === dayId);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    await Promise.all([
      authFetch(`/routines/coach/days/${a.id}`, { method: "PATCH", body: JSON.stringify({ order: b.order }) }),
      authFetch(`/routines/coach/days/${b.id}`, { method: "PATCH", body: JSON.stringify({ order: a.order }) }),
    ]);
    setRoutine((p) => p ? {
      ...p, days: p.days.map((d) =>
        d.id === a.id ? { ...d, order: b.order } :
        d.id === b.id ? { ...d, order: a.order } : d),
    } : p);
  };

  const addExercise = async (dayId: number) => {
    const ex = newEx[dayId];
    if (!ex?.name || !ex.sets || !ex.reps) return;
    setSaving(true);
    const day = routine?.days.find((d) => d.id === dayId);
    const r = await authFetch(`/routines/coach/days/${dayId}/exercises`, {
      method: "POST",
      body: JSON.stringify({ name: ex.name, sets: parseInt(ex.sets), reps: ex.reps, weight: ex.weight, notes: ex.notes, order: day?.exercises.length ?? 0 }),
    });
    const created = await r.json();
    setRoutine((p) => p ? {
      ...p, days: p.days.map((d) => d.id === dayId ? { ...d, exercises: [...d.exercises, created] } : d),
    } : p);
    setNewEx((p) => ({ ...p, [dayId]: emptyEx }));
    setSaving(false);
  };

  const reorderExercise = async (dayId: number, exId: number, dir: "up" | "down") => {
    if (!routine) return;
    const day = routine.days.find((d) => d.id === dayId);
    if (!day) return;
    const sorted = [...day.exercises].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((e) => e.id === exId);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    await Promise.all([
      authFetch(`/routines/coach/exercises/${a.id}`, { method: "PATCH", body: JSON.stringify({ order: b.order }) }),
      authFetch(`/routines/coach/exercises/${b.id}`, { method: "PATCH", body: JSON.stringify({ order: a.order }) }),
    ]);
    setRoutine((p) => p ? {
      ...p, days: p.days.map((d) => d.id === dayId ? {
        ...d, exercises: d.exercises.map((e) =>
          e.id === a.id ? { ...e, order: b.order } :
          e.id === b.id ? { ...e, order: a.order } : e),
      } : d),
    } : p);
  };

  const saveEditEx = async (dayId: number, exId: number) => {
    const ex = editEx[exId];
    if (!ex?.name || !ex.sets || !ex.reps) return;
    setSaving(true);
    await authFetch(`/routines/coach/exercises/${exId}`, {
      method: "PATCH",
      body: JSON.stringify({ name: ex.name, sets: parseInt(ex.sets), reps: ex.reps, weight: ex.weight, notes: ex.notes }),
    });
    setRoutine((p) => p ? {
      ...p, days: p.days.map((d) => d.id === dayId ? {
        ...d, exercises: d.exercises.map((e) => e.id === exId
          ? { ...e, name: ex.name, sets: parseInt(ex.sets), reps: ex.reps, weight: ex.weight, notes: ex.notes }
          : e),
      } : d),
    } : p);
    setEditEx((p) => ({ ...p, [exId]: { ...p[exId], open: false } }));
    setSaving(false);
  };

  const deleteExercise = async (dayId: number, exId: number) => {
    await authFetch(`/routines/coach/exercises/${exId}`, { method: "DELETE" });
    setRoutine((p) => p ? {
      ...p, days: p.days.map((d) => d.id === dayId ? { ...d, exercises: d.exercises.filter((e) => e.id !== exId) } : d),
    } : p);
  };

  const openEdit = (ex: RoutineExercise) => {
    setEditEx((p) => ({
      ...p,
      [ex.id]: { name: ex.name, sets: String(ex.sets), reps: ex.reps, weight: ex.weight || "", notes: ex.notes || "", open: true },
    }));
  };

  if (loading) return <div className="text-zinc-500 text-sm p-8">Cargando...</div>;

  const sortedDays = routine ? [...routine.days].sort((a, b) => a.order - b.order) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/coach/students/${studentId}`}
          className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Rutina del alumno</h2>
          <p className="text-zinc-500 text-sm">Crea dias y cargales los ejercicios</p>
        </div>
      </div>

      {/* Selector de rutinas */}
      {allRoutines.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center">
          {allRoutines.map((r) => (
            <button key={r.id} onClick={() => selectRoutine(r.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${routine?.id === r.id ? "bg-fuchsia-600 text-white" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"}`}>
              {r.name}
            </button>
          ))}
          <button onClick={() => setCreating(true)}
            className="px-3 py-1.5 rounded-lg text-sm font-bold bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-colors">
            <Plus className="w-3.5 h-3.5 inline mr-1" />Nueva
          </button>
        </div>
      )}

      {/* Sin rutina */}
      {!routine && !creating && (
        <div className="text-center py-16 bg-zinc-900 border border-white/10 rounded-2xl space-y-4">
          <Dumbbell className="w-12 h-12 text-zinc-700 mx-auto" />
          <div>
            <p className="font-black uppercase text-lg">Sin rutina todavia</p>
            <p className="text-zinc-500 text-sm mt-1">Primero crea la rutina, despues le agregas los dias y ejercicios.</p>
          </div>
          <div className="flex justify-center gap-6 text-xs text-zinc-600">
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-fuchsia-600 text-white flex items-center justify-center font-bold text-xs">1</span> Crear rutina</span>
            <span>→</span>
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-400 flex items-center justify-center font-bold text-xs">2</span> Agregar dias</span>
            <span>→</span>
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-400 flex items-center justify-center font-bold text-xs">3</span> Cargar ejercicios</span>
          </div>
          <button onClick={() => setCreating(true)}
            className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-bold transition-colors">
            <Plus className="w-4 h-4 inline mr-2" />Crear rutina
          </button>
        </div>
      )}

      {/* Form crear rutina */}
      {creating && (
        <div className="bg-zinc-900 border border-fuchsia-600/30 rounded-2xl p-5 space-y-3">
          <p className="font-bold uppercase tracking-wide text-fuchsia-400 text-sm">Nueva rutina</p>
          <input value={newRoutine.name} onChange={(e) => setNewRoutine((p) => ({ ...p, name: e.target.value }))}
            placeholder="Ej: Rutina Full Body 3 dias" autoFocus
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500" />
          <input value={newRoutine.description} onChange={(e) => setNewRoutine((p) => ({ ...p, description: e.target.value }))}
            placeholder="Descripcion (opcional)" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500" />
          <div className="flex gap-2">
            <button onClick={createRoutine} className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-2.5 rounded-lg font-bold transition-colors">
              <Save className="w-4 h-4 inline mr-2" />Crear y continuar
            </button>
            <button onClick={() => setCreating(false)} className="px-4 py-2.5 bg-zinc-800 text-zinc-400 rounded-lg hover:text-white transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {/* Rutina seleccionada */}
      {routine && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
            <p className="font-black text-lg uppercase">{routine.name}</p>
            {routine.description && <p className="text-zinc-500 text-sm">{routine.description}</p>}
            <p className="text-zinc-600 text-xs mt-1">{routine.days.length} {routine.days.length === 1 ? "dia" : "dias"}</p>
          </div>

          {/* Sin dias — guia paso 2 */}
          {routine.days.length === 0 && (
            <div className="bg-zinc-900/50 border border-fuchsia-600/20 rounded-2xl p-6 text-center space-y-3">
              <div className="flex justify-center gap-6 text-xs">
                <span className="flex items-center gap-1.5 text-green-400"><span className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center"><Check className="w-3 h-3" /></span> Rutina creada</span>
                <span className="text-zinc-600">→</span>
                <span className="flex items-center gap-1.5 text-fuchsia-400"><span className="w-5 h-5 rounded-full bg-fuchsia-600 text-white flex items-center justify-center font-bold text-xs">2</span> Agregar dias</span>
                <span className="text-zinc-600">→</span>
                <span className="flex items-center gap-1.5 text-zinc-600"><span className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-400 flex items-center justify-center font-bold text-xs">3</span> Ejercicios</span>
              </div>
              <p className="text-zinc-400 text-sm">Agrega el primer dia de entrenamiento abajo.</p>
            </div>
          )}

          {/* Dias */}
          {sortedDays.map((day, dayIdx) => {
            const isOpen = openDay === day.id;
            const ex = newEx[day.id] || emptyEx;
            const sortedExercises = [...day.exercises].sort((a, b) => a.order - b.order);

            return (
              <div key={day.id} className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                  <button onClick={() => setOpenDay(isOpen ? null : day.id)} className="flex items-center gap-3 flex-1 text-left">
                    <div className="w-8 h-8 bg-fuchsia-600/20 border border-fuchsia-600/30 rounded-lg flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-fuchsia-400" />
                    </div>
                    <div>
                      <p className="font-bold uppercase tracking-wide">{day.name}</p>
                      <p className="text-zinc-500 text-xs">{day.exercises.length} ejercicios</p>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-400 ml-2" /> : <ChevronDown className="w-4 h-4 text-zinc-400 ml-2" />}
                  </button>
                  <div className="flex items-center gap-0.5 ml-2">
                    <button onClick={() => reorderDay(day.id, "up")} disabled={dayIdx === 0}
                      className="p-1.5 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition-colors">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => reorderDay(day.id, "down")} disabled={dayIdx === sortedDays.length - 1}
                      className="p-1.5 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition-colors">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteDay(day.id)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors ml-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-2 border-t border-white/10 pt-4">
                    {day.exercises.length === 0 && (
                      <p className="text-zinc-600 text-xs text-center py-2">Sin ejercicios todavia. Cargalos abajo.</p>
                    )}

                    {sortedExercises.map((exercise, exIdx) => {
                      const editing = editEx[exercise.id]?.open;
                      const ed = editEx[exercise.id] || emptyEx;
                      return (
                        <div key={exercise.id}>
                          {editing ? (
                            <div className="bg-zinc-950 border border-fuchsia-600/40 rounded-xl p-4 space-y-2">
                              <p className="text-xs font-bold text-fuchsia-400 uppercase">Editando ejercicio</p>
                              <input value={ed.name} onChange={(e) => setEditEx((p) => ({ ...p, [exercise.id]: { ...p[exercise.id], name: e.target.value } }))}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500" />
                              <div className="grid grid-cols-3 gap-2">
                                <input value={ed.sets} onChange={(e) => setEditEx((p) => ({ ...p, [exercise.id]: { ...p[exercise.id], sets: e.target.value } }))}
                                  placeholder="Series" type="number" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500" />
                                <input value={ed.reps} onChange={(e) => setEditEx((p) => ({ ...p, [exercise.id]: { ...p[exercise.id], reps: e.target.value } }))}
                                  placeholder="Reps" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500" />
                                <input value={ed.weight} onChange={(e) => setEditEx((p) => ({ ...p, [exercise.id]: { ...p[exercise.id], weight: e.target.value } }))}
                                  placeholder="Peso" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500" />
                              </div>
                              <input value={ed.notes} onChange={(e) => setEditEx((p) => ({ ...p, [exercise.id]: { ...p[exercise.id], notes: e.target.value } }))}
                                placeholder="Notas" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500" />
                              <div className="flex gap-2">
                                <button onClick={() => saveEditEx(day.id, exercise.id)} disabled={saving}
                                  className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-40 text-white py-2 rounded-lg text-sm font-bold transition-colors">
                                  <Check className="w-3.5 h-3.5 inline mr-1" />Guardar
                                </button>
                                <button onClick={() => setEditEx((p) => ({ ...p, [exercise.id]: { ...p[exercise.id], open: false } }))}
                                  className="px-4 py-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm transition-colors">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">{exercise.name}</p>
                                <p className="text-zinc-500 text-xs">{exercise.sets} x {exercise.reps}{exercise.weight && ` · ${exercise.weight}`}</p>
                                {exercise.notes && <p className="text-zinc-600 text-xs mt-0.5">{exercise.notes}</p>}
                              </div>
                              <div className="flex items-center gap-0.5 ml-3">
                                <button onClick={() => reorderExercise(day.id, exercise.id, "up")} disabled={exIdx === 0}
                                  className="p-1.5 text-zinc-700 hover:text-zinc-400 disabled:opacity-20 transition-colors">
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button onClick={() => reorderExercise(day.id, exercise.id, "down")} disabled={exIdx === sortedExercises.length - 1}
                                  className="p-1.5 text-zinc-700 hover:text-zinc-400 disabled:opacity-20 transition-colors">
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <button onClick={() => openEdit(exercise)} className="p-1.5 text-zinc-600 hover:text-fuchsia-400 transition-colors">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => deleteExercise(day.id, exercise.id)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Agregar ejercicio */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2 mt-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-fuchsia-400">Agregar ejercicio</p>
                      <input value={ex.name} onChange={(e) => setNewEx((p) => ({ ...p, [day.id]: { ...(p[day.id] || emptyEx), name: e.target.value } }))}
                        placeholder="Nombre del ejercicio" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500" />
                      <div className="grid grid-cols-3 gap-2">
                        <input value={ex.sets} onChange={(e) => setNewEx((p) => ({ ...p, [day.id]: { ...(p[day.id] || emptyEx), sets: e.target.value } }))}
                          placeholder="Series" type="number" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500" />
                        <input value={ex.reps} onChange={(e) => setNewEx((p) => ({ ...p, [day.id]: { ...(p[day.id] || emptyEx), reps: e.target.value } }))}
                          placeholder="Reps (ej: 8-12)" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500" />
                        <input value={ex.weight} onChange={(e) => setNewEx((p) => ({ ...p, [day.id]: { ...(p[day.id] || emptyEx), weight: e.target.value } }))}
                          placeholder="Peso (opcional)" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500" />
                      </div>
                      <input value={ex.notes} onChange={(e) => setNewEx((p) => ({ ...p, [day.id]: { ...(p[day.id] || emptyEx), notes: e.target.value } }))}
                        placeholder="Notas (opcional)" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500" />
                      <button onClick={() => addExercise(day.id)} disabled={saving}
                        className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-40 text-white py-2 rounded-lg text-sm font-bold transition-colors">
                        <Plus className="w-3.5 h-3.5 inline mr-1" />Agregar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Agregar dia */}
          <div className="space-y-2">
            {routine.days.length > 0 && <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Agregar dia</p>}
            <div className="flex gap-2">
              <input value={newDay} onChange={(e) => setNewDay(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDay()}
                placeholder="Ej: Lunes — Pecho, Dia B, Piernas..."
                className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
              <button onClick={addDay}
                className="px-5 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-bold transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
