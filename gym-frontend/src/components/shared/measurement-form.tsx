"use client";
import { useState } from "react";
import { authFetch, ensureOk } from "@/lib/api";
import { INPUT_FIELDS } from "@/lib/measurements";

// Coach form to record a new measurement for one student.
export function MeasurementForm({ studentId, onSaved, onCancel }: { studentId: number | string; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const body: Record<string, number | string> = {};
    for (const f of INPUT_FIELDS) {
      const v = form[f.key];
      if (v) body[f.key] = f.integer ? parseInt(v, 10) : parseFloat(v);
    }
    if (Object.keys(body).length === 0) { setError("Cargá al menos un valor"); return; }
    if (form.notes) body.notes = form.notes;
    setSaving(true);
    setError("");
    try {
      await authFetch(`/coach/students/${studentId}/measurements`, { method: "POST", body: JSON.stringify(body) }).then(ensureOk);
      setForm({});
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const input = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500 text-sm";

  return (
    <form onSubmit={save} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="font-black uppercase tracking-tight">Nueva medición</h3>
        <p className="text-zinc-500 text-xs">Cargá solo lo que mediste. El IMC se calcula solo con peso y altura (si no ponés altura, usa la última).</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg">{error}</div>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {INPUT_FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-xs text-zinc-400 mb-1 block">{f.label}</label>
            <div className="relative">
              <input type="number" step={f.integer ? "1" : "0.1"} inputMode="decimal" placeholder="-"
                value={form[f.key] || ""} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                className={`${input} pr-10`} />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">{f.unit}</span>
            </div>
          </div>
        ))}
      </div>
      <input type="text" placeholder="Notas (opcional)" maxLength={500} value={form.notes || ""}
        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className={input} />
      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" onClick={onCancel} className="text-zinc-400 hover:text-white text-sm px-4 py-2">Cancelar</button>
      </div>
    </form>
  );
}
