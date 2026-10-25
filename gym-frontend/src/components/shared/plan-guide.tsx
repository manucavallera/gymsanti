"use client";
import { useState } from "react";
import { GlassWater, Pill, Brain, Leaf, Sparkles, FlaskConical, Pencil, LucideIcon } from "lucide-react";
import { authFetch, ensureOk } from "@/lib/api";
import { GUIDE_SECTIONS, GuideKey, PlanGuide } from "@/lib/nutrition";

const ICONS: Record<GuideKey, LucideIcon> = {
  vitamins: Pill,
  supplements: FlaskConical,
  nervousSystem: Brain,
  intestinal: Leaf,
  habits: Sparkles,
};

// Water target and the coach's notes, as the student sees them. Renders nothing when empty.
export function PlanGuideView({ plan }: { plan: PlanGuide }) {
  const sections = GUIDE_SECTIONS.filter((s) => plan[s.key]?.trim());
  if (plan.waterLiters == null && sections.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {plan.waterLiters != null && (
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-600/20 rounded-xl flex items-center justify-center">
            <GlassWater className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Agua por día</p>
            <p className="text-xl font-black">{Number(plan.waterLiters)} L</p>
          </div>
        </div>
      )}
      {sections.map((s) => {
        const Icon = ICONS[s.key];
        return (
          <div key={s.key} className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
              <Icon className="w-4 h-4 text-fuchsia-400" /> {s.label}
            </p>
            <p className="text-zinc-200 text-sm whitespace-pre-wrap">{plan[s.key]}</p>
          </div>
        );
      })}
    </div>
  );
}

// Coach editor for the same guide. Saves with PATCH /nutrition/coach/:planId.
export function PlanGuideEditor({ planId, plan, onSaved }: { planId: number; plan: PlanGuide; onSaved: (updated: PlanGuide) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const start = () => {
    setForm({
      waterLiters: plan.waterLiters != null ? String(plan.waterLiters) : "",
      ...Object.fromEntries(GUIDE_SECTIONS.map((s) => [s.key, plan[s.key] ?? ""])),
    });
    setError("");
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Empty text clears a section; empty water clears the target.
      const body = {
        waterLiters: form.waterLiters ? parseFloat(form.waterLiters) : null,
        ...Object.fromEntries(GUIDE_SECTIONS.map((s) => [s.key, form[s.key]?.trim() || null])),
      };
      const updated = await authFetch(`/nutrition/coach/${planId}`, { method: "PATCH", body: JSON.stringify(body) }).then(ensureOk).then((r) => r.json());
      onSaved(updated);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const input = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500";

  if (!open) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Agua, suplementos y hábitos</p>
          <button onClick={start} className="flex items-center gap-1.5 text-sm font-bold text-fuchsia-400 hover:text-fuchsia-300">
            <Pencil className="w-3.5 h-3.5" /> Editar
          </button>
        </div>
        <PlanGuideView plan={plan} />
        {plan.waterLiters == null && GUIDE_SECTIONS.every((s) => !plan[s.key]) && (
          <p className="text-zinc-600 text-sm">Todavía no cargaste agua, vitaminas, suplementos ni hábitos.</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={save} className="bg-zinc-900 border border-fuchsia-600/30 rounded-2xl p-5 space-y-3">
      <p className="font-bold uppercase tracking-wide text-fuchsia-400 text-sm">Agua, suplementos y hábitos</p>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg">{error}</div>}
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Agua por día (litros)</label>
        <input type="number" step="0.1" min={0} max={10} inputMode="decimal" placeholder="Ej: 2.5" value={form.waterLiters}
          onChange={(e) => setForm((p) => ({ ...p, waterLiters: e.target.value }))} className={input} />
      </div>
      {GUIDE_SECTIONS.map((s) => (
        <div key={s.key}>
          <label className="text-xs text-zinc-400 mb-1 block">{s.label}</label>
          <textarea rows={2} maxLength={3000} placeholder={s.placeholder} value={form[s.key]}
            onChange={(e) => setForm((p) => ({ ...p, [s.key]: e.target.value }))} className={`${input} resize-y`} />
        </div>
      ))}
      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-40 text-white py-2.5 rounded-lg font-bold text-sm transition-colors">
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 bg-zinc-800 text-zinc-400 rounded-lg hover:text-white text-sm transition-colors">Cancelar</button>
      </div>
    </form>
  );
}
