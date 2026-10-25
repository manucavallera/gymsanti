"use client";
import { TrendingDown, TrendingUp, Minus, Trash2 } from "lucide-react";
import { MEASUREMENT_FIELDS, Measurement, diffFrom, formatDate } from "@/lib/measurements";

const fmt = (v: number) => String(Number(v));

// Latest value per field, with the change from the previous measurement.
export function LatestMeasurements({ measurements }: { measurements: Measurement[] }) {
  const [latest, previous] = measurements;
  if (!latest) return null;
  return (
    <div>
      <p className="text-zinc-500 text-sm mb-3">Última medición: {formatDate(latest.date)}</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {MEASUREMENT_FIELDS.map((f) => {
          const val = latest[f.key];
          if (val == null) return null;
          const diff = diffFrom(latest, previous, f.key);
          return (
            <div key={f.key} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1">{f.label}</p>
              <p className="text-xl font-black">{fmt(val)}<span className="text-sm font-normal text-zinc-500 ml-1">{f.unit}</span></p>
              {diff !== null && (
                <div className="flex items-center gap-1 text-xs mt-1 text-zinc-400">
                  {diff < 0 ? <TrendingDown className="w-3 h-3" /> : diff > 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {diff > 0 ? "+" : ""}{diff.toFixed(f.integer ? 0 : 1)} {f.unit}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Every measurement, newest first. onDelete shows a delete button (coach only).
export function MeasurementHistory({ measurements, onDelete }: { measurements: Measurement[]; onDelete?: (id: number) => void }) {
  return (
    <div className="space-y-2">
      {measurements.map((m) => (
        <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-sm mb-1">{formatDate(m.date)}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {MEASUREMENT_FIELDS.map((f) => {
                const v = m[f.key];
                if (v == null) return null;
                return <span key={f.key} className="text-xs text-zinc-400">{f.label}: <span className="text-white">{fmt(v)}{f.unit && ` ${f.unit}`}</span></span>;
              })}
            </div>
            {m.notes && <p className="text-xs text-zinc-500 mt-1">{m.notes}</p>}
          </div>
          {onDelete && (
            <button onClick={() => onDelete(m.id)} aria-label="Borrar medición" className="text-zinc-600 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
