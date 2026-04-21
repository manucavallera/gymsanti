"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Ruler, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authFetch } from "@/lib/api";

interface Measurement {
  id: number; date: string; weight: number; chest: number; waist: number;
  hips: number; leftArm: number; rightArm: number; leftLeg: number; rightLeg: number; abdomen: number; notes: string;
}

const FIELDS = [
  { key: "weight", label: "Peso corporal", unit: "kg" },
  { key: "chest", label: "Pecho", unit: "cm" },
  { key: "waist", label: "Cintura", unit: "cm" },
  { key: "abdomen", label: "Abdomen", unit: "cm" },
  { key: "hips", label: "Cadera", unit: "cm" },
  { key: "leftArm", label: "Brazo izq.", unit: "cm" },
  { key: "rightArm", label: "Brazo der.", unit: "cm" },
  { key: "leftLeg", label: "Pierna izq.", unit: "cm" },
  { key: "rightLeg", label: "Pierna der.", unit: "cm" },
];

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = () => authFetch("/measurements").then((r) => r.json()).then(setMeasurements);
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    const body = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== "").map(([k, v]) => [k, parseFloat(v)]));
    await authFetch("/measurements", { method: "POST", body: JSON.stringify(body) });
    setForm({});
    setShowForm(false);
    setSaving(false);
    load();
  };

  const del = async (id: number) => {
    await authFetch(`/measurements/${id}`, { method: "DELETE" });
    load();
  };

  const latest = measurements[0];
  const previous = measurements[1];

  const getDiff = (key: string) => {
    if (!latest || !previous) return null;
    const a = (latest as any)[key];
    const b = (previous as any)[key];
    if (!a || !b) return null;
    return parseFloat(a) - parseFloat(b);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Medidas</h2>
          <p className="text-zinc-400 mt-1">Seguí tu progreso corporal</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors">
          <Plus className="w-4 h-4" /> Nueva medición
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader><CardTitle>Nueva medición</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-zinc-400 mb-1 block">{f.label}</label>
                  <div className="relative">
                    <input
                      type="number" step="0.1" placeholder="—"
                      value={form[f.key] || ""}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 text-sm"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <input type="text" placeholder="Notas (opcional)"
              value={form.notes || ""}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 text-sm"
            />
            <div className="flex gap-3">
              <button onClick={save} disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white text-sm px-4 py-2">Cancelar</button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Última medición — cards de resumen */}
      {latest && (
        <div>
          <p className="text-zinc-500 text-sm mb-3">Última medición — {new Date(latest.date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {FIELDS.map((f) => {
              const val = (latest as any)[f.key];
              const diff = getDiff(f.key);
              if (!val) return null;
              return (
                <div key={f.key} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 mb-1">{f.label}</p>
                  <p className="text-xl font-black">{parseFloat(val)}<span className="text-sm font-normal text-zinc-500 ml-1">{f.unit}</span></p>
                  {diff !== null && (
                    <div className={`flex items-center gap-1 text-xs mt-1 ${diff < 0 ? "text-green-400" : diff > 0 ? "text-red-400" : "text-zinc-500"}`}>
                      {diff < 0 ? <TrendingDown className="w-3 h-3" /> : diff > 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)} {f.unit}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historial */}
      {measurements.length > 0 ? (
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Ruler className="w-5 h-5 text-blue-500" /> Historial</h3>
          <div className="space-y-3">
            {measurements.map((m) => (
              <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{new Date(m.date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {FIELDS.map((f) => {
                      const v = (m as any)[f.key];
                      if (!v) return null;
                      return <span key={f.key} className="text-xs text-zinc-400">{f.label}: <span className="text-white">{parseFloat(v)}{f.unit}</span></span>;
                    })}
                  </div>
                  {m.notes && <p className="text-xs text-zinc-500 mt-1">{m.notes}</p>}
                </div>
                <button onClick={() => del(m.id)} className="text-zinc-600 hover:text-red-400 transition-colors ml-4">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-zinc-500">
          <Ruler className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Sin mediciones todavía</p>
          <p className="text-sm mt-1">Registrá tu primera medición para empezar a trackear tu progreso</p>
        </div>
      )}
    </div>
  );
}
