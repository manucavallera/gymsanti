// Daily guide sections written by the coach on a meal plan (free text).
export const GUIDE_SECTIONS = [
  { key: "vitamins", label: "Vitaminas", placeholder: "Ej: Vitamina D 2000 UI con el almuerzo" },
  { key: "supplements", label: "Suplementos", placeholder: "Ej: Creatina 5 g por día" },
  { key: "nervousSystem", label: "Regulación del sistema nervioso", placeholder: "Ej: Respiración 5 min antes de dormir, magnesio" },
  { key: "intestinal", label: "Regulación intestinal", placeholder: "Ej: Fibra en cada comida, kéfir" },
  { key: "habits", label: "Hábitos", placeholder: "Ej: Dormir 8 h, caminar 8000 pasos" },
] as const;

export type GuideKey = (typeof GUIDE_SECTIONS)[number]["key"];

export type PlanGuide = { waterLiters: number | null } & Record<GuideKey, string | null>;

// Quick names for the "add meal" form.
export const MEAL_NAMES = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Colación"];
