// Single source of truth for body measurement fields (coach form, student view, history).

export interface Measurement {
  id: number;
  date: string;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  chest: number | null;
  back: number | null;
  waist: number | null;
  hips: number | null;
  arm: number | null;
  leg: number | null;
  restingHr: number | null;
  maxHr: number | null;
  notes: string | null;
}

export type MeasurementKey = Exclude<keyof Measurement, "id" | "date" | "notes">;

export interface MeasurementField {
  key: MeasurementKey;
  label: string;
  unit: string;
  // Whole numbers only (heart rate).
  integer?: boolean;
  // Calculated by the server, never typed in the form.
  computed?: boolean;
}

export const MEASUREMENT_FIELDS: MeasurementField[] = [
  { key: "weight", label: "Peso", unit: "kg" },
  { key: "height", label: "Altura", unit: "cm" },
  { key: "bmi", label: "IMC", unit: "", computed: true },
  { key: "chest", label: "Pecho", unit: "cm" },
  { key: "back", label: "Espalda", unit: "cm" },
  { key: "waist", label: "Cintura", unit: "cm" },
  { key: "hips", label: "Cadera", unit: "cm" },
  { key: "arm", label: "Brazo", unit: "cm" },
  { key: "leg", label: "Pierna", unit: "cm" },
  { key: "restingHr", label: "FC reposo", unit: "lpm", integer: true },
  { key: "maxHr", label: "FC máxima", unit: "lpm", integer: true },
];

export const INPUT_FIELDS = MEASUREMENT_FIELDS.filter((f) => !f.computed);

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
}

// Change from the previous measurement, or null when either value is missing.
export function diffFrom(latest: Measurement | undefined, previous: Measurement | undefined, key: MeasurementKey) {
  const a = latest?.[key];
  const b = previous?.[key];
  if (a == null || b == null) return null;
  return Number(a) - Number(b);
}
