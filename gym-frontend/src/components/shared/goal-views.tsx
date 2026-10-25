"use client";
import { CheckCircle2, Circle, Trash2, CalendarDays } from "lucide-react";
import { Goal, formatGoalDate, goalCategory } from "@/lib/goals";

interface Actions {
  onToggle?: (goal: Goal) => void;
  onDelete?: (goal: Goal) => void;
}

// One goal. Without actions (student view) the check icon is display only.
function GoalCard({ goal, onToggle, onDelete }: { goal: Goal } & Actions) {
  const cat = goalCategory(goal.category);
  const icon = goal.achieved
    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
    : <Circle className="w-5 h-5 text-zinc-500" />;
  return (
    <div className={`bg-zinc-900 border rounded-xl p-4 flex items-start gap-4 ${goal.achieved ? "border-green-600/30" : "border-zinc-800"}`}>
      {onToggle ? (
        <button onClick={() => onToggle(goal)} className="mt-0.5 flex-shrink-0 hover:opacity-80"
          aria-label={goal.achieved ? "Marcar como pendiente" : "Marcar como logrado"}>
          {icon}
        </button>
      ) : (
        <span className="mt-0.5 flex-shrink-0">{icon}</span>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cat.color}`}>{cat.label}</span>
          {goal.targetDate && (
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <CalendarDays className="w-3 h-3" /> {formatGoalDate(goal.targetDate)}
            </span>
          )}
        </div>
        <p className={`font-bold ${goal.achieved ? "line-through text-zinc-500" : ""}`}>{goal.title}</p>
        {goal.targetValue && <p className="text-fuchsia-400 text-sm mt-0.5">Meta: {goal.targetValue}</p>}
        {goal.description && <p className="text-zinc-500 text-sm mt-1">{goal.description}</p>}
      </div>
      {onDelete && (
        <button onClick={() => onDelete(goal)} aria-label="Borrar objetivo" className="text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Goals split into in progress and achieved.
export function GoalList({ goals, ...actions }: { goals: Goal[] } & Actions) {
  const pending = goals.filter((g) => !g.achieved);
  const achieved = goals.filter((g) => g.achieved);
  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">En progreso</h3>
          {pending.map((g) => <GoalCard key={g.id} goal={g} {...actions} />)}
        </div>
      )}
      {achieved.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Logrados</h3>
          {achieved.map((g) => <GoalCard key={g.id} goal={g} {...actions} />)}
        </div>
      )}
    </div>
  );
}
