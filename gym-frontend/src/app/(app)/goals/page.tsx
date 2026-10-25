"use client";
import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { authFetch } from "@/lib/api";
import { Goal } from "@/lib/goals";
import { GoalList } from "@/components/shared/goal-views";

// Read-only: the coach sets goals from the student's profile.
export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/goals").then((r) => r.json()).then(setGoals).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const achieved = goals.filter((g) => g.achieved).length;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Objetivos</h2>
        <p className="text-zinc-400 mt-1">
          {goals.length > 0 ? `${goals.length - achieved} en progreso · ${achieved} logrados` : "Las metas que te marca tu coach"}
        </p>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Cargando...</p>
      ) : goals.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Sin objetivos todavía</p>
          <p className="text-sm mt-1">Tu coach te los va a cargar.</p>
        </div>
      ) : (
        <GoalList goals={goals} />
      )}
    </div>
  );
}
