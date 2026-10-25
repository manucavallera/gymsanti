export interface Goal {
  id: number;
  title: string;
  description: string | null;
  category: string;
  targetValue: string | null;
  targetDate: string | null;
  achieved: boolean;
  createdAt: string;
}

export const GOAL_CATEGORIES = [
  { value: "peso", label: "Peso", color: "bg-orange-600/20 text-orange-400 border-orange-600/30" },
  { value: "fuerza", label: "Fuerza", color: "bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-600/30" },
  { value: "medidas", label: "Medidas", color: "bg-purple-600/20 text-purple-400 border-purple-600/30" },
  { value: "habito", label: "Hábito", color: "bg-green-600/20 text-green-400 border-green-600/30" },
  { value: "otro", label: "Otro", color: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30" },
];

export const goalCategory = (value: string) => GOAL_CATEGORIES.find((c) => c.value === value) ?? GOAL_CATEGORIES[4];

// targetDate is "YYYY-MM-DD". Parse as a local date so it does not shift a day.
export function formatGoalDate(d: string) {
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}
