"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, Dumbbell, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface RoutineExercise {
  id: number; name: string; sets: number; reps: string;
  weight: string; notes: string; order: number;
}
interface RoutineDay { id: number; name: string; order: number; exercises: RoutineExercise[]; }
interface Routine { id: number; name: string; description: string; days: RoutineDay[]; }
interface ExerciseLog { date: Date; weight: number; }
interface ProgressItem { exerciseId: number; logs: ExerciseLog[]; }

const SparkTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-white/10 rounded px-2 py-1 text-xs text-fuchsia-300 shadow-lg">
      {payload[0].value} kg
    </div>
  );
};

export default function RoutinesPage() {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [logs, setLogs] = useState<Record<number, { weight: string; done: boolean }>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<number, ExerciseLog[]>>({});

  useEffect(() => {
    Promise.all([
      authFetch("/routines/my").then(async (r) => {
        const text = await r.text();
        return text ? JSON.parse(text) : null;
      }),
      authFetch("/routines/my/progress").then(async (r) => {
        const text = await r.text();
        return text ? JSON.parse(text) : [];
      }),
    ]).then(([routineData, progressData]: [Routine | null, ProgressItem[]]) => {
      setRoutine(routineData);
      if (routineData?.days?.length) setOpenDay(routineData.days[0].id);
      const map: Record<number, ExerciseLog[]> = {};
      for (const item of progressData) map[item.exerciseId] = item.logs;
      setProgress(map);
    }).finally(() => setLoading(false));
  }, []);

  const saveLog = async (exerciseId: number) => {
    const entry = logs[exerciseId];
    if (!entry?.weight) return;
    setSaving(exerciseId);
    await authFetch(`/routines/exercises/${exerciseId}/log`, {
      method: "POST",
      body: JSON.stringify({ weight: parseFloat(entry.weight) }),
    });
    setSaving(null);
    setLogs((prev) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], done: true } }));
    // add new log to progress
    setProgress((prev) => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), { date: new Date(), weight: parseFloat(entry.weight) }],
    }));
  };

  if (loading) return <div className="text-zinc-500 text-sm">Cargando rutina...</div>;

  if (!routine) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <Dumbbell className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
      <h2 className="text-2xl font-black uppercase mb-2">Sin rutina asignada</h2>
      <p className="text-zinc-500">Tu coach todavia no te asigno una rutina. Contactalo para que configure tu plan.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">{routine.name}</h2>
        {routine.description && <p className="text-zinc-400 mt-1">{routine.description}</p>}
      </div>

      <div className="space-y-3">
        {routine.days.map((day) => {
          const isOpen = openDay === day.id;
          const doneCount = day.exercises.filter((ex) => logs[ex.id]?.done).length;
          return (
            <motion.div key={day.id} layout className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenDay(isOpen ? null : day.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-8 h-8 bg-fuchsia-600/20 border border-fuchsia-600/30 rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-fuchsia-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold uppercase tracking-wide">{day.name}</p>
                    <p className="text-zinc-500 text-xs">{day.exercises.length} ejercicios{doneCount > 0 && ` · ${doneCount} completados`}</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                  {day.exercises.map((ex) => {
                    const entry = logs[ex.id];
                    const isDone = entry?.done;
                    const exLogs = progress[ex.id] || [];
                    const sparkData = exLogs.map((l) => ({ weight: Number(l.weight) }));
                    const lastKg = exLogs.length > 0 ? Number(exLogs[exLogs.length - 1].weight) : null;
                    const prevKg = exLogs.length > 1 ? Number(exLogs[exLogs.length - 2].weight) : null;
                    const trend = lastKg !== null && prevKg !== null ? lastKg - prevKg : null;

                    return (
                      <Card key={ex.id} className={`border transition-colors ${isDone ? "bg-green-950/20 border-green-600/30" : "bg-zinc-950 border-zinc-800"}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? "bg-green-600/20" : "bg-zinc-800"}`}>
                                {isDone ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Dumbbell className="w-4 h-4 text-zinc-400" />}
                              </div>
                              <div className="min-w-0">
                                <CardTitle className="text-base">{ex.name}</CardTitle>
                                <p className="text-zinc-500 text-sm">
                                  {ex.sets} series x {ex.reps} reps
                                  {ex.weight && <span className="ml-2 text-fuchsia-400">· {ex.weight}</span>}
                                </p>
                              </div>
                            </div>

                            {/* Sparkline */}
                            {sparkData.length >= 2 && (
                              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5 text-xs">
                                  <TrendingUp className="w-3 h-3 text-zinc-500" />
                                  <span className="text-white font-bold">{lastKg} kg</span>
                                  {trend !== null && (
                                    <span className={trend > 0 ? "text-green-400" : trend < 0 ? "text-red-400" : "text-zinc-500"}>
                                      {trend > 0 ? "+" : ""}{trend.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                                <ResponsiveContainer width={100} height={36}>
                                  <LineChart data={sparkData}>
                                    <Tooltip content={<SparkTooltip />} />
                                    <Line
                                      type="monotone" dataKey="weight" stroke="#a855f7"
                                      strokeWidth={2} dot={false} activeDot={{ r: 3, fill: "#d946ef", strokeWidth: 0 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                            {sparkData.length === 1 && (
                              <div className="flex-shrink-0 text-xs text-zinc-500 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-white font-bold">{lastKg} kg</span>
                              </div>
                            )}
                          </div>
                          {ex.notes && <p className="text-zinc-500 text-xs mt-2 pl-11">{ex.notes}</p>}
                        </CardHeader>
                        <CardContent>
                          {!isDone ? (
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  placeholder={lastKg ? `Ultima vez: ${lastKg} kg` : "Peso usado (kg)"}
                                  value={entry?.weight || ""}
                                  onChange={(e) => setLogs((prev) => ({ ...prev, [ex.id]: { weight: e.target.value, done: false } }))}
                                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">kg</span>
                              </div>
                              <button
                                onClick={() => saveLog(ex.id)}
                                disabled={!entry?.weight || saving === ex.id}
                                className="bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors"
                              >
                                {saving === ex.id ? "..." : "✓"}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                              <CheckCircle2 className="w-4 h-4" /> Registrado — {entry.weight} kg
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
