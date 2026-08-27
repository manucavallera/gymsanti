"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { authFetch } from "@/lib/api";

interface Goal {
  id: number; title: string; description: string; category: string;
  targetValue: string; targetDate: string; achieved: boolean; createdAt: string;
}

const CATEGORIES = [
  { value: "peso", label: "Peso", emoji: "⚖️" },
  { value: "fuerza", label: "Fuerza", emoji: "🏋️" },
  { value: "medidas", label: "Medidas", emoji: "📏" },
  { value: "habito", label: "Hábito", emoji: "🔁" },
  { value: "otro", label: "Otro", emoji: "⭐" },
];

const CAT_COLORS: Record<string, string> = {
  peso: "bg-orange-600/20 text-orange-400 border-orange-600/30",
  fuerza: "bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-600/30",
  medidas: "bg-purple-600/20 text-purple-400 border-purple-600/30",
  habito: "bg-green-600/20 text-green-400 border-green-600/30",
  otro: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "fuerza", targetValue: "", targetDate: "" });
  const [saving, setSaving] = useState(false);

  const load = () => authFetch("/goals").then((r) => r.json()).then(setGoals);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    await authFetch("/goals", { method: "POST", body: JSON.stringify(form) });
    setForm({ title: "", description: "", category: "fuerza", targetValue: "", targetDate: "" });
    setShowForm(false);
    setSaving(false);
    load();
  };

  const toggle = async (id: number) => {
    await authFetch(`/goals/${id}/toggle`, { method: "PATCH" });
    load();
  };

  const del = async (id: number) => {
    await authFetch(`/goals/${id}`, { method: "DELETE" });
    load();
  };

  const pending = goals.filter((g) => !g.achieved);
  const achieved = goals.filter((g) => g.achieved);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Objetivos</h2>
          <p className="text-zinc-400 mt-1">{pending.length} activos · {achieved.length} logrados</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors">
          <Plus className="w-4 h-4" /> Nuevo objetivo
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <Card className="bg-zinc-900 border-zinc-700">
          <CardContent className="pt-6 space-y-4">
            <input type="text" placeholder="Título del objetivo *"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500"
            />
            <textarea placeholder="Descripción (opcional)"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 resize-none"
            />
            <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Categoría</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-fuchsia-500">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Valor objetivo</label>
                <input type="text" placeholder="Ej: 80kg, 100kg banca..."
                  value={form.targetValue}
                  onChange={(e) => setForm((p) => ({ ...p, targetValue: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Fecha límite (opcional)</label>
              <input type="date"
                value={form.targetDate}
                onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={save} disabled={saving || !form.title}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white text-sm px-4 py-2">Cancelar</button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Objetivos pendientes */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">En progreso</h3>
          {pending.map((g) => <GoalCard key={g.id} goal={g} onToggle={toggle} onDelete={del} />)}
        </div>
      )}

      {/* Logrados */}
      {achieved.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Logrados 🎉</h3>
          {achieved.map((g) => <GoalCard key={g.id} goal={g} onToggle={toggle} onDelete={del} />)}
        </div>
      )}

      {goals.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Sin objetivos todavía</p>
          <p className="text-sm mt-1">Definí tus metas para mantenerte enfocado</p>
        </div>
      )}
    </div>
  );
}

function GoalCard({ goal, onToggle, onDelete }: { goal: Goal; onToggle: (id: number) => void; onDelete: (id: number) => void }) {
  const cat = CATEGORIES.find((c) => c.value === goal.category);
  const catColor = CAT_COLORS[goal.category] || CAT_COLORS.otro;

  return (
    <div className={`bg-zinc-900 border rounded-xl p-4 flex items-start gap-4 transition-colors ${goal.achieved ? "border-green-600/30 opacity-60" : "border-zinc-800"}`}>
      <button onClick={() => onToggle(goal.id)} className="mt-0.5 flex-shrink-0">
        {goal.achieved
          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
          : <Circle className="w-5 h-5 text-zinc-500 hover:text-fuchsia-400 transition-colors" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${catColor}`}>
            {cat?.emoji} {cat?.label}
          </span>
          {goal.targetDate && (
            <span className="text-xs text-zinc-500">
              📅 {new Date(goal.targetDate).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
        <p className={`font-bold ${goal.achieved ? "line-through text-zinc-500" : ""}`}>{goal.title}</p>
        {goal.targetValue && <p className="text-fuchsia-400 text-sm mt-0.5">🎯 {goal.targetValue}</p>}
        {goal.description && <p className="text-zinc-500 text-sm mt-1">{goal.description}</p>}
      </div>
      <button onClick={() => onDelete(goal.id)} className="text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

