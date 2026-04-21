"use client";
import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft, CheckCircle2, Dumbbell, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface TrainingType { id: number; name: string; icon: string; description: string; }
interface Exercise { id: number; name: string; sets: number; reps: string; notes: string; order: number; }
interface Stage { id: number; name: string; order: number; exercises: Exercise[]; }
interface TrainingTypeDetail extends TrainingType { stages: Stage[]; }

type View = "types" | "stages" | "exercises";

export default function RoutinesPage() {
  const [view, setView] = useState<View>("types");
  const [types, setTypes] = useState<TrainingType[]>([]);
  const [selectedType, setSelectedType] = useState<TrainingTypeDetail | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [logs, setLogs] = useState<Record<number, { weight: string; done: boolean }>>({});
  const [lastWeights, setLastWeights] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    authFetch("/training/types").then((r) => r.json()).then(setTypes);
  }, []);

  const selectType = async (type: TrainingType) => {
    const res = await authFetch(`/training/types/${type.id}`);
    const data = await res.json();
    setSelectedType(data);
    setView("stages");
  };

  const selectStage = async (stage: Stage) => {
    setSelectedStage(stage);
    const weights: Record<number, number> = {};
    await Promise.all(
      stage.exercises.map(async (ex) => {
        const r = await authFetch(`/training/log/${ex.id}/last`);
        if (r.ok) {
          const log = await r.json();
          if (log?.weight) weights[ex.id] = log.weight;
        }
      })
    );
    setLastWeights(weights);
    setLogs({});
    setView("exercises");
  };

  const saveLog = async (exerciseId: number) => {
    const entry = logs[exerciseId];
    if (!entry?.weight) return;
    setSaving(exerciseId);
    await authFetch("/training/log", {
      method: "POST",
      body: JSON.stringify({ exerciseId, weight: parseFloat(entry.weight) }),
    });
    setSaving(null);
    setLogs((prev) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], done: true } }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <button onClick={() => setView("types")} className={view !== "types" ? "hover:text-white transition-colors" : "text-white font-medium"}>
          Tipo
        </button>
        {view !== "types" && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => setView("stages")} className={view === "stages" ? "text-white font-medium" : "hover:text-white transition-colors"}>
              {selectedType?.name}
            </button>
          </>
        )}
        {view === "exercises" && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">{selectedStage?.name}</span>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* PASO 1: Tipos de entrenamiento */}
        {view === "types" && (
          <motion.div key="types" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h2 className="text-3xl font-bold">Mis Rutinas</h2>
              <p className="text-zinc-400 mt-1">Elegí tu tipo de entrenamiento</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {types.map((type) => (
                <button key={type.id} onClick={() => selectType(type)}
                  className="bg-zinc-900 border border-zinc-800 hover:border-blue-600/50 rounded-2xl p-6 text-left transition-all group hover:bg-zinc-800/50">
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h3 className="text-lg font-bold mb-1 group-hover:text-blue-400 transition-colors">{type.name}</h3>
                  <p className="text-zinc-400 text-sm">{type.description}</p>
                  <div className="flex items-center gap-1 text-blue-500 text-sm mt-4 font-medium">
                    Ver etapas <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* PASO 2: Etapas */}
        {view === "stages" && selectedType && (
          <motion.div key="stages" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setView("types")} className="text-zinc-400 hover:text-white transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-3xl font-bold">{selectedType.icon} {selectedType.name}</h2>
                <p className="text-zinc-400 mt-1">Elegí una etapa</p>
              </div>
            </div>
            <div className="space-y-3">
              {selectedType.stages.sort((a, b) => a.order - b.order).map((stage, i) => (
                <button key={stage.id} onClick={() => selectStage(stage)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-blue-600/50 rounded-2xl p-5 text-left transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-bold group-hover:text-blue-400 transition-colors">{stage.name}</p>
                      <p className="text-zinc-500 text-sm">{stage.exercises?.length || 0} ejercicios</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* PASO 3: Ejercicios */}
        {view === "exercises" && selectedStage && (
          <motion.div key="exercises" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setView("stages")} className="text-zinc-400 hover:text-white transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-2xl font-bold">{selectedStage.name}</h2>
                <p className="text-zinc-400 text-sm mt-0.5">{selectedStage.exercises.length} ejercicios</p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedStage.exercises.sort((a, b) => a.order - b.order).map((ex) => {
                const entry = logs[ex.id];
                const isDone = entry?.done;
                return (
                  <Card key={ex.id} className={`border transition-colors ${isDone ? "bg-green-950/20 border-green-600/30" : "bg-zinc-900 border-zinc-800"}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDone ? "bg-green-600/20" : "bg-zinc-800"}`}>
                            {isDone ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Dumbbell className="w-4 h-4 text-zinc-400" />}
                          </div>
                          <div>
                            <CardTitle className="text-base">{ex.name}</CardTitle>
                            <p className="text-zinc-500 text-sm">{ex.sets} series × {ex.reps} reps</p>
                          </div>
                        </div>
                        {lastWeights[ex.id] && (
                          <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" /> Último: {lastWeights[ex.id]}kg
                          </Badge>
                        )}
                      </div>
                      {ex.notes && <p className="text-zinc-500 text-xs mt-2 pl-11">💡 {ex.notes}</p>}
                    </CardHeader>
                    <CardContent>
                      {!isDone ? (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="number"
                              placeholder={lastWeights[ex.id] ? `${lastWeights[ex.id]} kg` : "Peso (kg)"}
                              value={entry?.weight || ""}
                              onChange={(e) => setLogs((prev) => ({ ...prev, [ex.id]: { weight: e.target.value, done: false } }))}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">kg</span>
                          </div>
                          <button
                            onClick={() => saveLog(ex.id)}
                            disabled={!entry?.weight || saving === ex.id}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                          >
                            {saving === ex.id ? "..." : <><CheckCircle2 className="w-4 h-4" /> Listo</>}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
