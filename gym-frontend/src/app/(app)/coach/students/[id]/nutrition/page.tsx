"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UtensilsCrossed, Plus, Trash2, ArrowLeft, Save, Edit2, ChevronDown, ChevronUp, Check, X, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { authFetch } from "@/lib/api";

interface Meal { id: number; name: string; time: string; calories: number; protein: number; carbs: number; fats: number; foods: string; order: number; }
interface MealDay { id: number; name: string; order: number; meals: Meal[]; }
interface MealPlan { id: number; name: string; description: string; dailyCalories: number; dailyProtein: number; dailyCarbs: number; dailyFats: number; days: MealDay[]; }

const emptyMeal = { name: "", time: "", calories: "", protein: "", carbs: "", fats: "", foods: "" };

export default function CoachStudentNutritionPage() {
  const { id: studentId } = useParams<{ id: string }>();
  const [allPlans, setAllPlans] = useState<MealPlan[]>([]);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: "", description: "", dailyCalories: "", dailyProtein: "", dailyCarbs: "", dailyFats: "" });
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [newDay, setNewDay] = useState("");
  const [newMeal, setNewMeal] = useState<Record<number, typeof emptyMeal>>({});
  const [editMeal, setEditMeal] = useState<Record<number, typeof emptyMeal & { open: boolean }>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await authFetch(`/nutrition/coach/students/${studentId}/all`);
      if (!r.ok) { setLoading(false); return; }
      const list: MealPlan[] = await r.json();
      setAllPlans(list);
      if (list[0]) {
        const detail = await authFetch(`/nutrition/coach/${list[0].id}`).then((r) => r.json());
        setPlan(detail);
        if (detail.days?.length) setOpenDay(detail.days[0].id);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [studentId]);

  const selectPlan = async (id: number) => {
    setLoading(true);
    const detail = await authFetch(`/nutrition/coach/${id}`).then((r) => r.json());
    setPlan(detail);
    setOpenDay(detail.days?.length ? detail.days[0].id : null);
    setLoading(false);
  };

  const createPlan = async () => {
    if (!newPlan.name) return;
    const r = await authFetch(`/nutrition/coach/students/${studentId}`, {
      method: "POST",
      body: JSON.stringify({
        name: newPlan.name, description: newPlan.description,
        dailyCalories: newPlan.dailyCalories ? parseInt(newPlan.dailyCalories) : undefined,
        dailyProtein: newPlan.dailyProtein ? parseInt(newPlan.dailyProtein) : undefined,
        dailyCarbs: newPlan.dailyCarbs ? parseInt(newPlan.dailyCarbs) : undefined,
        dailyFats: newPlan.dailyFats ? parseInt(newPlan.dailyFats) : undefined,
      }),
    });
    const created = await r.json();
    setAllPlans((p) => [...p, { ...created, days: [] }]);
    setPlan({ ...created, days: [] });
    setCreating(false);
    setNewPlan({ name: "", description: "", dailyCalories: "", dailyProtein: "", dailyCarbs: "", dailyFats: "" });
  };

  const addDay = async () => {
    if (!newDay.trim() || !plan) return;
    const r = await authFetch(`/nutrition/coach/${plan.id}/days`, {
      method: "POST", body: JSON.stringify({ name: newDay, order: plan.days.length }),
    });
    const day = await r.json();
    setPlan((p) => p ? { ...p, days: [...p.days, { ...day, meals: [] }] } : p);
    setNewDay("");
    setOpenDay(day.id);
  };

  const deleteDay = async (dayId: number) => {
    await authFetch(`/nutrition/coach/days/${dayId}`, { method: "DELETE" });
    setPlan((p) => p ? { ...p, days: p.days.filter((d) => d.id !== dayId) } : p);
  };

  const reorderDay = async (dayId: number, dir: "up" | "down") => {
    if (!plan) return;
    const sorted = [...plan.days].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((d) => d.id === dayId);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    await Promise.all([
      authFetch(`/nutrition/coach/days/${a.id}`, { method: "PATCH", body: JSON.stringify({ order: b.order }) }),
      authFetch(`/nutrition/coach/days/${b.id}`, { method: "PATCH", body: JSON.stringify({ order: a.order }) }),
    ]);
    setPlan((p) => p ? {
      ...p, days: p.days.map((d) =>
        d.id === a.id ? { ...d, order: b.order } :
        d.id === b.id ? { ...d, order: a.order } : d),
    } : p);
  };

  const addMeal = async (dayId: number) => {
    const m = newMeal[dayId];
    if (!m?.name) return;
    setSaving(true);
    const day = plan?.days.find((d) => d.id === dayId);
    const r = await authFetch(`/nutrition/coach/days/${dayId}/meals`, {
      method: "POST",
      body: JSON.stringify({
        name: m.name, time: m.time, foods: m.foods, order: day?.meals.length ?? 0,
        calories: m.calories ? parseInt(m.calories) : undefined,
        protein: m.protein ? parseInt(m.protein) : undefined,
        carbs: m.carbs ? parseInt(m.carbs) : undefined,
        fats: m.fats ? parseInt(m.fats) : undefined,
      }),
    });
    const created = await r.json();
    setPlan((p) => p ? {
      ...p, days: p.days.map((d) => d.id === dayId ? { ...d, meals: [...d.meals, created] } : d),
    } : p);
    setNewMeal((p) => ({ ...p, [dayId]: emptyMeal }));
    setSaving(false);
  };

  const reorderMeal = async (dayId: number, mealId: number, dir: "up" | "down") => {
    if (!plan) return;
    const day = plan.days.find((d) => d.id === dayId);
    if (!day) return;
    const sorted = [...day.meals].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((m) => m.id === mealId);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    await Promise.all([
      authFetch(`/nutrition/coach/meals/${a.id}`, { method: "PATCH", body: JSON.stringify({ order: b.order }) }),
      authFetch(`/nutrition/coach/meals/${b.id}`, { method: "PATCH", body: JSON.stringify({ order: a.order }) }),
    ]);
    setPlan((p) => p ? {
      ...p, days: p.days.map((d) => d.id === dayId ? {
        ...d, meals: d.meals.map((m) =>
          m.id === a.id ? { ...m, order: b.order } :
          m.id === b.id ? { ...m, order: a.order } : m),
      } : d),
    } : p);
  };

  const saveEditMeal = async (dayId: number, mealId: number) => {
    const m = editMeal[mealId];
    if (!m?.name) return;
    setSaving(true);
    await authFetch(`/nutrition/coach/meals/${mealId}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: m.name, time: m.time, foods: m.foods,
        calories: m.calories ? parseInt(m.calories) : undefined,
        protein: m.protein ? parseInt(m.protein) : undefined,
        carbs: m.carbs ? parseInt(m.carbs) : undefined,
        fats: m.fats ? parseInt(m.fats) : undefined,
      }),
    });
    setPlan((p) => p ? {
      ...p, days: p.days.map((d) => d.id === dayId ? {
        ...d, meals: d.meals.map((ml) => ml.id === mealId
          ? { ...ml, name: m.name, time: m.time, foods: m.foods,
              calories: m.calories ? parseInt(m.calories) : ml.calories,
              protein: m.protein ? parseInt(m.protein) : ml.protein,
              carbs: m.carbs ? parseInt(m.carbs) : ml.carbs,
              fats: m.fats ? parseInt(m.fats) : ml.fats }
          : ml),
      } : d),
    } : p);
    setEditMeal((p) => ({ ...p, [mealId]: { ...p[mealId], open: false } }));
    setSaving(false);
  };

  const deleteMeal = async (dayId: number, mealId: number) => {
    await authFetch(`/nutrition/coach/meals/${mealId}`, { method: "DELETE" });
    setPlan((p) => p ? {
      ...p, days: p.days.map((d) => d.id === dayId ? { ...d, meals: d.meals.filter((m) => m.id !== mealId) } : d),
    } : p);
  };

  const openEdit = (meal: Meal) => {
    setEditMeal((p) => ({
      ...p,
      [meal.id]: {
        name: meal.name, time: meal.time || "", foods: meal.foods || "",
        calories: meal.calories ? String(meal.calories) : "",
        protein: meal.protein ? String(meal.protein) : "",
        carbs: meal.carbs ? String(meal.carbs) : "",
        fats: meal.fats ? String(meal.fats) : "",
        open: true,
      },
    }));
  };

  if (loading) return <div className="text-zinc-500 text-sm p-8">Cargando...</div>;

  const sortedDays = plan ? [...plan.days].sort((a, b) => a.order - b.order) : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/coach/students/${studentId}`}
          className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Plan nutricional</h2>
          <p className="text-zinc-500 text-sm">Crea dias y cargales las comidas con macros</p>
        </div>
      </div>

      {/* Selector de planes */}
      {allPlans.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center">
          {allPlans.map((p) => (
            <button key={p.id} onClick={() => selectPlan(p.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${plan?.id === p.id ? "bg-fuchsia-600 text-white" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"}`}>
              {p.name}
            </button>
          ))}
          <button onClick={() => setCreating(true)}
            className="px-3 py-1.5 rounded-lg text-sm font-bold bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-colors">
            <Plus className="w-3.5 h-3.5 inline mr-1" />Nuevo
          </button>
        </div>
      )}

      {/* Sin plan */}
      {!plan && !creating && (
        <div className="text-center py-16 bg-zinc-900 border border-white/10 rounded-2xl space-y-4">
          <UtensilsCrossed className="w-12 h-12 text-zinc-700 mx-auto" />
          <div>
            <p className="font-black uppercase text-lg">Sin plan nutricional todavia</p>
            <p className="text-zinc-500 text-sm mt-1">Primero crea el plan con los macros objetivo, despues agregas los dias y comidas.</p>
          </div>
          <div className="flex justify-center gap-6 text-xs text-zinc-600">
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-fuchsia-600 text-white flex items-center justify-center font-bold text-xs">1</span> Crear plan</span>
            <span>→</span>
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-400 flex items-center justify-center font-bold text-xs">2</span> Agregar dias</span>
            <span>→</span>
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-400 flex items-center justify-center font-bold text-xs">3</span> Cargar comidas</span>
          </div>
          <button onClick={() => setCreating(true)}
            className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-bold transition-colors">
            <Plus className="w-4 h-4 inline mr-2" />Crear plan
          </button>
        </div>
      )}

      {/* Form crear plan */}
      {creating && (
        <div className="bg-zinc-900 border border-fuchsia-600/30 rounded-2xl p-5 space-y-3">
          <p className="font-bold uppercase tracking-wide text-fuchsia-400 text-sm">Nuevo plan nutricional</p>
          <input value={newPlan.name} onChange={(e) => setNewPlan((p) => ({ ...p, name: e.target.value }))}
            placeholder="Nombre del plan (ej: Volumen Limpio)" autoFocus
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500" />
          <input value={newPlan.description} onChange={(e) => setNewPlan((p) => ({ ...p, description: e.target.value }))}
            placeholder="Descripcion (opcional)"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500" />
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wide pt-1">Macros diarios objetivo (opcional)</p>
          <div className="grid grid-cols-2 gap-2">
            {(["dailyCalories", "dailyProtein", "dailyCarbs", "dailyFats"] as const).map((field) => (
              <input key={field} type="number" value={newPlan[field]}
                onChange={(e) => setNewPlan((p) => ({ ...p, [field]: e.target.value }))}
                placeholder={{ dailyCalories: "Calorias (kcal)", dailyProtein: "Proteina (g)", dailyCarbs: "Carbos (g)", dailyFats: "Grasas (g)" }[field]}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500" />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={createPlan} className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-2.5 rounded-lg font-bold transition-colors">
              <Save className="w-4 h-4 inline mr-2" />Crear y continuar
            </button>
            <button onClick={() => setCreating(false)} className="px-4 py-2.5 bg-zinc-800 text-zinc-400 rounded-lg hover:text-white transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {/* Plan seleccionado */}
      {plan && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
            <p className="font-black text-lg uppercase">{plan.name}</p>
            {plan.description && <p className="text-zinc-500 text-sm">{plan.description}</p>}
            {plan.dailyCalories > 0 && (
              <div className="flex gap-3 mt-2 text-sm flex-wrap">
                <span className="text-fuchsia-400 font-bold">{plan.dailyCalories} kcal</span>
                {plan.dailyProtein > 0 && <span className="text-red-400">P: {plan.dailyProtein}g</span>}
                {plan.dailyCarbs > 0 && <span className="text-yellow-400">C: {plan.dailyCarbs}g</span>}
                {plan.dailyFats > 0 && <span className="text-blue-400">G: {plan.dailyFats}g</span>}
              </div>
            )}
            <p className="text-zinc-600 text-xs mt-1">{plan.days.length} {plan.days.length === 1 ? "dia" : "dias"}</p>
          </div>

          {/* Sin dias — guia paso 2 */}
          {plan.days.length === 0 && (
            <div className="bg-zinc-900/50 border border-fuchsia-600/20 rounded-2xl p-6 text-center space-y-3">
              <div className="flex justify-center gap-6 text-xs">
                <span className="flex items-center gap-1.5 text-green-400"><span className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center"><Check className="w-3 h-3" /></span> Plan creado</span>
                <span className="text-zinc-600">→</span>
                <span className="flex items-center gap-1.5 text-fuchsia-400"><span className="w-5 h-5 rounded-full bg-fuchsia-600 text-white flex items-center justify-center font-bold text-xs">2</span> Agregar dias</span>
                <span className="text-zinc-600">→</span>
                <span className="flex items-center gap-1.5 text-zinc-600"><span className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-400 flex items-center justify-center font-bold text-xs">3</span> Comidas</span>
              </div>
              <p className="text-zinc-400 text-sm">Agrega el primer dia del plan abajo.</p>
            </div>
          )}

          {/* Dias */}
          {sortedDays.map((day, dayIdx) => {
            const isOpen = openDay === day.id;
            const m = newMeal[day.id] || emptyMeal;
            const sortedMeals = [...day.meals].sort((a, b) => a.order - b.order);

            return (
              <div key={day.id} className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4">
                  <button onClick={() => setOpenDay(isOpen ? null : day.id)} className="flex items-center gap-3 flex-1 text-left">
                    <div className="w-8 h-8 bg-fuchsia-600/20 border border-fuchsia-600/30 rounded-lg flex items-center justify-center">
                      <UtensilsCrossed className="w-4 h-4 text-fuchsia-400" />
                    </div>
                    <div>
                      <p className="font-bold uppercase tracking-wide">{day.name}</p>
                      <p className="text-zinc-500 text-xs">{day.meals.length} comidas</p>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-400 ml-2" /> : <ChevronDown className="w-4 h-4 text-zinc-400 ml-2" />}
                  </button>
                  <div className="flex items-center gap-0.5 ml-2">
                    <button onClick={() => reorderDay(day.id, "up")} disabled={dayIdx === 0}
                      className="p-1.5 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition-colors">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => reorderDay(day.id, "down")} disabled={dayIdx === sortedDays.length - 1}
                      className="p-1.5 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition-colors">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteDay(day.id)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors ml-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-2 border-t border-white/10 pt-4">
                    {day.meals.length === 0 && (
                      <p className="text-zinc-600 text-xs text-center py-2">Sin comidas todavia. Cargalas abajo.</p>
                    )}

                    {sortedMeals.map((meal, mealIdx) => {
                      const editing = editMeal[meal.id]?.open;
                      const ed = editMeal[meal.id] || emptyMeal;
                      return (
                        <div key={meal.id}>
                          {editing ? (
                            <div className="bg-zinc-950 border border-fuchsia-600/40 rounded-xl p-4 space-y-2">
                              <p className="text-xs font-bold text-fuchsia-400 uppercase">Editando comida</p>
                              <div className="grid grid-cols-2 gap-2">
                                <input value={ed.name} onChange={(e) => setEditMeal((p) => ({ ...p, [meal.id]: { ...p[meal.id], name: e.target.value } }))}
                                  placeholder="Nombre" className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500" />
                                <input value={ed.time} onChange={(e) => setEditMeal((p) => ({ ...p, [meal.id]: { ...p[meal.id], time: e.target.value } }))}
                                  placeholder="Horario" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500" />
                                <input value={ed.calories} onChange={(e) => setEditMeal((p) => ({ ...p, [meal.id]: { ...p[meal.id], calories: e.target.value } }))}
                                  placeholder="Calorias" type="number" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500" />
                                <input value={ed.protein} onChange={(e) => setEditMeal((p) => ({ ...p, [meal.id]: { ...p[meal.id], protein: e.target.value } }))}
                                  placeholder="Proteina (g)" type="number" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500" />
                                <input value={ed.carbs} onChange={(e) => setEditMeal((p) => ({ ...p, [meal.id]: { ...p[meal.id], carbs: e.target.value } }))}
                                  placeholder="Carbos (g)" type="number" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500" />
                                <input value={ed.fats} onChange={(e) => setEditMeal((p) => ({ ...p, [meal.id]: { ...p[meal.id], fats: e.target.value } }))}
                                  placeholder="Grasas (g)" type="number" className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500" />
                              </div>
                              <textarea value={ed.foods} onChange={(e) => setEditMeal((p) => ({ ...p, [meal.id]: { ...p[meal.id], foods: e.target.value } }))}
                                placeholder="Alimentos (uno por linea)" rows={2}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500 resize-none" />
                              <div className="flex gap-2">
                                <button onClick={() => saveEditMeal(day.id, meal.id)} disabled={saving}
                                  className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-40 text-white py-2 rounded-lg text-sm font-bold transition-colors">
                                  <Check className="w-3.5 h-3.5 inline mr-1" />Guardar
                                </button>
                                <button onClick={() => setEditMeal((p) => ({ ...p, [meal.id]: { ...p[meal.id], open: false } }))}
                                  className="px-4 py-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm transition-colors">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium">{meal.name}</p>
                                  {meal.time && <span className="text-zinc-500 text-xs">· {meal.time}</span>}
                                  {meal.calories > 0 && <span className="text-fuchsia-400 text-xs font-bold">{meal.calories} kcal</span>}
                                </div>
                                {(meal.protein > 0 || meal.carbs > 0 || meal.fats > 0) && (
                                  <div className="flex gap-3 text-xs mt-1">
                                    {meal.protein > 0 && <span className="text-red-400">P: {meal.protein}g</span>}
                                    {meal.carbs > 0 && <span className="text-yellow-400">C: {meal.carbs}g</span>}
                                    {meal.fats > 0 && <span className="text-blue-400">G: {meal.fats}g</span>}
                                  </div>
                                )}
                                {meal.foods && <p className="text-zinc-500 text-xs mt-1 whitespace-pre-wrap">{meal.foods}</p>}
                              </div>
                              <div className="flex items-center gap-0.5 ml-3">
                                <button onClick={() => reorderMeal(day.id, meal.id, "up")} disabled={mealIdx === 0}
                                  className="p-1.5 text-zinc-700 hover:text-zinc-400 disabled:opacity-20 transition-colors">
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button onClick={() => reorderMeal(day.id, meal.id, "down")} disabled={mealIdx === sortedMeals.length - 1}
                                  className="p-1.5 text-zinc-700 hover:text-zinc-400 disabled:opacity-20 transition-colors">
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <button onClick={() => openEdit(meal)} className="p-1.5 text-zinc-600 hover:text-fuchsia-400 transition-colors">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => deleteMeal(day.id, meal.id)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Agregar comida */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2 mt-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-fuchsia-400">Agregar comida</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input value={m.name} onChange={(e) => setNewMeal((p) => ({ ...p, [day.id]: { ...(p[day.id] || emptyMeal), name: e.target.value } }))}
                          placeholder="Nombre (ej: Desayuno)" className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500" />
                        <input value={m.time} onChange={(e) => setNewMeal((p) => ({ ...p, [day.id]: { ...(p[day.id] || emptyMeal), time: e.target.value } }))}
                          placeholder="Horario (ej: 08:00)" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500" />
                        <input value={m.calories} onChange={(e) => setNewMeal((p) => ({ ...p, [day.id]: { ...(p[day.id] || emptyMeal), calories: e.target.value } }))}
                          placeholder="Calorias" type="number" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500" />
                        <input value={m.protein} onChange={(e) => setNewMeal((p) => ({ ...p, [day.id]: { ...(p[day.id] || emptyMeal), protein: e.target.value } }))}
                          placeholder="Proteina (g)" type="number" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500" />
                        <input value={m.carbs} onChange={(e) => setNewMeal((p) => ({ ...p, [day.id]: { ...(p[day.id] || emptyMeal), carbs: e.target.value } }))}
                          placeholder="Carbos (g)" type="number" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500" />
                        <input value={m.fats} onChange={(e) => setNewMeal((p) => ({ ...p, [day.id]: { ...(p[day.id] || emptyMeal), fats: e.target.value } }))}
                          placeholder="Grasas (g)" type="number" className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500" />
                      </div>
                      <textarea value={m.foods} onChange={(e) => setNewMeal((p) => ({ ...p, [day.id]: { ...(p[day.id] || emptyMeal), foods: e.target.value } }))}
                        placeholder="Lista de alimentos (uno por linea)" rows={2}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500 resize-none" />
                      <button onClick={() => addMeal(day.id)} disabled={saving}
                        className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-40 text-white py-2 rounded-lg text-sm font-bold transition-colors">
                        <Plus className="w-3.5 h-3.5 inline mr-1" />Agregar comida
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Agregar dia */}
          <div className="space-y-2">
            {plan.days.length > 0 && <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Agregar dia</p>}
            <div className="flex gap-2">
              <input value={newDay} onChange={(e) => setNewDay(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDay()}
                placeholder="Ej: Lunes, Dia 1, Dia de entreno..."
                className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
              <button onClick={addDay}
                className="px-5 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-bold transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
