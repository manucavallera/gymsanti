"use client";
import { useEffect, useState } from "react";
import { Ruler, BarChart2 } from "lucide-react";
import { authFetch } from "@/lib/api";
import { MEASUREMENT_FIELDS, Measurement, MeasurementKey } from "@/lib/measurements";
import { LatestMeasurements, MeasurementHistory } from "@/components/shared/measurement-views";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ChartPoint { date: string; value: number; unit: string; }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: ChartPoint }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-zinc-400 text-xs mb-1">{label}</p>
      <p className="font-bold text-fuchsia-400">{payload[0].value} {payload[0].payload.unit}</p>
    </div>
  );
};

// Read-only: the coach records measurements from the student's profile.
export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"resumen" | "grafico" | "historial">("resumen");
  const [chartField, setChartField] = useState<MeasurementKey>("weight");

  useEffect(() => {
    authFetch("/measurements").then((r) => r.json()).then(setMeasurements).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fieldMeta = MEASUREMENT_FIELDS.find((f) => f.key === chartField)!;
  const chartData: ChartPoint[] = [...measurements]
    .reverse()
    .filter((m) => m[chartField] != null)
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
      value: Number(m[chartField]),
      unit: fieldMeta.unit,
    }));
  const availableFields = MEASUREMENT_FIELDS.filter((f) => measurements.some((m) => m[f.key] != null));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Medidas</h2>
        <p className="text-zinc-400 mt-1">Tu progreso corporal, cargado por tu coach</p>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Cargando...</p>
      ) : measurements.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <Ruler className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Sin mediciones todavía</p>
          <p className="text-sm mt-1">Tu coach las va a cargar en tu próxima evaluación.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            {(["resumen", "grafico", "historial"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === t ? "bg-fuchsia-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`}>
                {t === "grafico" ? "Gráfico" : t === "resumen" ? "Resumen" : "Historial"}
              </button>
            ))}
          </div>

          {tab === "resumen" && <LatestMeasurements measurements={measurements} />}

          {tab === "grafico" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <BarChart2 className="w-5 h-5 text-fuchsia-500" />
                <select value={chartField} onChange={(e) => setChartField(e.target.value as MeasurementKey)}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500">
                  {availableFields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
                <span className="text-zinc-500 text-sm">{chartData.length} registros</span>
              </div>

              {chartData.length < 2 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-sm">
                  Hacen falta al menos 2 mediciones para ver el gráfico.
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-black text-white">{chartData[chartData.length - 1].value}</span>
                    <span className="text-zinc-500">{fieldMeta.unit}</span>
                    <span className="text-zinc-600 text-sm ml-1">actual</span>
                    {(() => {
                      const diff = chartData[chartData.length - 1].value - chartData[0].value;
                      return (
                        <span className="ml-auto text-sm font-bold text-zinc-300">
                          {diff > 0 ? "+" : ""}{diff.toFixed(fieldMeta.integer ? 0 : 1)} {fieldMeta.unit} total
                        </span>
                      );
                    })()}
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2.5}
                        dot={{ fill: "#a855f7", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#d946ef", strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {tab === "historial" && <MeasurementHistory measurements={measurements} />}
        </>
      )}
    </div>
  );
}
