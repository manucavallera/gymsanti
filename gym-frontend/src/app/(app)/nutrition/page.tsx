"use client";
import { useEffect, useState } from "react";
import { UtensilsCrossed, ChevronDown, ChevronUp, Flame, Beef, Wheat, Droplets } from "lucide-react";
import { authFetch } from "@/lib/api";
import { motion } from "framer-motion";

interface Meal { id: number; name: string; time: string; calories: number; protein: number; carbs: number; fats: number; foods: string; order: number; }
interface MealDay { id: number; name: string; order: number; meals: Meal[]; }
interface MealPlan { id: number; name: string; description: string; dailyCalories: number; dailyProtein: number; dailyCarbs: number; dailyFats: number; days: MealDay[]; }

const MacroBadge = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-sm`}>
    <Icon className={`w-3.5 h-3.5 ${color}`} />
    <span className="text-zinc-400 text-xs">{label}</span>
    <span className="font-bold text-white">{value}g</span>
  </div>
);

export default function NutritionPage() {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDay, setOpenDay] = useState<number | null>(null);

  useEffect(() => {
    authFetch("/nutrition/my").then(async (r) => {
      const text = await r.text();
      const data = text ? JSON.parse(text) : null;
      setPlan(data);
      if (data?.days?.length) setOpenDay(data.days[0].id);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-500 text-sm">Cargando plan nutricional...</div>;

  if (!plan) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <UtensilsCrossed className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
      <h2 className="text-2xl font-black uppercase mb-2">Sin plan nutricional</h2>
      <p className="text-zinc-500">Tu coach todavía no te asignó un plan de alimentación.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">{plan.name}</h2>
        {plan.description && <p className="text-zinc-400 mt-1">{plan.description}</p>}
      </div>

      {(plan.dailyCalories || plan.dailyProtein) && (
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Objetivos diarios</p>
          <div className="flex flex-wrap gap-2">
            {plan.dailyCalories && <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-fuchsia-600/20 border border-fuchsia-600/30 text-sm"><Flame className="w-3.5 h-3.5 text-fuchsia-400" /><span className="font-bold text-white">{plan.dailyCalories} kcal</span></div>}
            {plan.dailyProtein && <MacroBadge icon={Beef} label="Proteína" value={plan.dailyProtein} color="text-red-400" />}
            {plan.dailyCarbs && <MacroBadge icon={Wheat} label="Carbos" value={plan.dailyCarbs} color="text-yellow-400" />}
            {plan.dailyFats && <MacroBadge icon={Droplets} label="Grasas" value={plan.dailyFats} color="text-blue-400" />}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {plan.days.map((day) => {
          const isOpen = openDay === day.id;
          const totalCals = day.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
          return (
            <motion.div key={day.id} layout className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenDay(isOpen ? null : day.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-fuchsia-600/20 border border-fuchsia-600/30 rounded-lg flex items-center justify-center">
                    <UtensilsCrossed className="w-4 h-4 text-fuchsia-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold uppercase tracking-wide">{day.name}</p>
                    <p className="text-zinc-500 text-xs">{day.meals.length} comidas{totalCals > 0 && ` · ${totalCals} kcal`}</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                  {day.meals.map((meal) => (
                    <div key={meal.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold">{meal.name}</p>
                          {meal.time && <p className="text-zinc-500 text-xs">🕐 {meal.time}</p>}
                        </div>
                        {meal.calories && (
                          <span className="text-fuchsia-400 font-bold text-sm">{meal.calories} kcal</span>
                        )}
                      </div>
                      {(meal.protein || meal.carbs || meal.fats) && (
                        <div className="flex gap-3 mb-3 text-xs">
                          {meal.protein && <span className="text-red-400">P: {meal.protein}g</span>}
                          {meal.carbs && <span className="text-yellow-400">C: {meal.carbs}g</span>}
                          {meal.fats && <span className="text-blue-400">G: {meal.fats}g</span>}
                        </div>
                      )}
                      {meal.foods && (
                        <div className="bg-zinc-900 rounded-lg p-3">
                          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wide mb-1">Alimentos</p>
                          <p className="text-zinc-300 text-sm whitespace-pre-wrap">{meal.foods}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
