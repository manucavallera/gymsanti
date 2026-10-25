"use client";
import { useEffect, useState } from "react";
import { Plus, Target, X } from "lucide-react";
import { authFetch, ensureOk } from "@/lib/api";
import { GOAL_CATEGORIES, Goal } from "@/lib/goals";
import { GoalList } from "@/components/shared/goal-views";

const emptyForm = { title: "", description: "", category: "fuerza", targetValue: "", targetDate: "" };

// Coach view of one student's goals: create, mark achieved, delete.
export function CoachGoals({ studentId }: { studentId: number | string }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const base = `/coach/students/${studentId}/goals`;

  useEffect(() => {
    authFetch(base).then((r) => r.json()).then(setGoals).catch(() => {}).finally(() => setLoading(false));
  }, [base]);

  const run = async (fn: () => Promise<void>) => {
    setError("");
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar"); }
  };

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    run(async () => {
      // Send only filled fields; empty strings would fail validation for optional ones.
      const body = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ""));
      const created: Goal = await authFetch(base, { method: "POST", body: JSON.stringify(body) }).then(ensureOk).then((r) => r.json());
      setGoals((g) => [created, ...g]);
      setForm(emptyForm);
      setShowForm(false);
    }).finally(() => setSaving(false));
  };

  const toggle = (goal: Goal) => run(async () => {
    const updated: Goal = await authFetch(`${base}/${goal.id}/toggle`, { method: "PATCH" }).then(ensureOk).then((r) => r.json());
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)));
  });

  const remove = (goal: Goal) => {
    if (!confirm(`¿Borrar "${goal.title}"?`)) return;
    run(async () => {
      await authFetch(`${base}/${goal.id}`, { method: "DELETE" }).then(ensureOk);
      setGoals((prev) => prev.filter((g) => g.id !== goal.id));
    });
  };

  const input = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Objetivos del alumno</p>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
          <Plus className="w-3.5 h-3.5" />Nuevo objetivo
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg">{error}</div>}

      {showForm && (
        <form onSubmit={create} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Nuevo objetivo</p>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Cerrar"><X className="w-4 h-4 text-zinc-500" /></button>
          </div>
          <input required minLength={2} maxLength={150} placeholder="Título *" value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={input} />
          <textarea rows={2} maxLength={1000} placeholder="Descripción (opcional)" value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={`${input} resize-none`} />
          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={input}>
              {GOAL_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input maxLength={100} placeholder="Meta (ej: 75 kg, 100 kg banca)" value={form.targetValue}
              onChange={(e) => setForm((p) => ({ ...p, targetValue: e.target.value }))} className={input} />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Fecha límite (opcional)</label>
            <input type="date" value={form.targetDate} onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))} className={input} />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-40 text-white py-2 rounded-lg text-sm font-bold transition-colors">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-zinc-500 text-sm">Cargando...</p>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900 border border-white/10 rounded-2xl">
          <Target className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400">Sin objetivos todavía.</p>
        </div>
      ) : (
        <GoalList goals={goals} onToggle={toggle} onDelete={remove} />
      )}
    </div>
  );
}
