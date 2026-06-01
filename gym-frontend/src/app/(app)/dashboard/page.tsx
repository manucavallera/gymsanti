"use client";
import { useEffect, useState } from "react";
import { Flame, Zap, Utensils, Activity, Dumbbell, Ruler, Users, ChevronRight, TrendingUp, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

interface NutritionPlan { id: number; name: string; dailyCalories: number; dailyProtein: number; dailyCarbs: number; dailyFats: number; }
interface RoutineDay { id: number; name: string; exercises: { id: number; name: string; sets: number; reps: string }[]; }
interface Routine { id: number; name: string; days: RoutineDay[]; }
interface Measurement { id: number; date: string; weight: number; }
interface Student { id: number; name: string; email: string; }

function MacroCard({ title, value, unit, target, icon: Icon, color }: { title: string; value: number | null; unit: string; target: number | null; icon: any; color: string }) {
  const pct = value && target ? Math.min(100, Math.round((value / target) * 100)) : null;
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        {value != null ? (
          <>
            <h3 className="text-2xl font-black">{value}<span className="text-sm font-normal text-zinc-500 ml-1">{unit}</span></h3>
            {target && <p className="text-xs text-zinc-500 mt-1">Objetivo: {target}{unit}</p>}
            {pct !== null && (
              <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color.replace("text-", "bg-")}`} style={{ width: `${pct}%` }} />
              </div>
            )}
          </>
        ) : (
          <p className="text-zinc-600 text-sm mt-1">Sin datos</p>
        )}
      </CardContent>
    </Card>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch("/nutrition/my").then(async (r) => { const t = await r.text(); return t ? JSON.parse(t) : null; }),
      authFetch("/routines/my").then(async (r) => { const t = await r.text(); return t ? JSON.parse(t) : null; }),
      authFetch("/measurements/latest").then(async (r) => { const t = await r.text(); return t ? JSON.parse(t) : null; }),
    ]).then(([p, ro, m]) => {
      setPlan(p);
      setRoutine(ro);
      setMeasurement(m);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-500 text-sm">Cargando...</div>;

  const today = routine?.days?.[0] ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">Hola, {user?.name?.split(" ")[0]}</h2>
        <p className="text-zinc-400 mt-1">Tu resumen de hoy</p>
      </div>

      {/* Macros */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Nutricion</p>
          <Link href="/nutrition" className="text-fuchsia-400 text-xs hover:text-fuchsia-300">Ver plan →</Link>
        </div>
        {plan ? (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <MacroCard title="Calorias" value={plan.dailyCalories} unit="kcal" target={null} icon={Flame} color="text-orange-500" />
            <MacroCard title="Proteina" value={plan.dailyProtein} unit="g" target={null} icon={Zap} color="text-fuchsia-500" />
            <MacroCard title="Carbos" value={plan.dailyCarbs} unit="g" target={null} icon={Utensils} color="text-green-500" />
            <MacroCard title="Grasas" value={plan.dailyFats} unit="g" target={null} icon={Activity} color="text-yellow-500" />
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="w-5 h-5 text-zinc-600" />
              <p className="text-zinc-500 text-sm">Sin plan nutricional asignado</p>
            </div>
            <Link href="/nutrition" className="text-fuchsia-400 text-xs hover:text-fuchsia-300">Ver →</Link>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Rutina */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Mi Rutina</p>
            <Link href="/routines" className="text-fuchsia-400 text-xs hover:text-fuchsia-300">Ver completa →</Link>
          </div>
          <Card className="bg-zinc-900 border-zinc-800 h-full">
            <CardContent className="p-5">
              {today ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-fuchsia-600/20 rounded-lg flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-fuchsia-400" />
                    </div>
                    <div>
                      <p className="font-black uppercase tracking-wide text-sm">{routine?.name}</p>
                      <p className="text-zinc-500 text-xs">{today.name} · {today.exercises.length} ejercicios</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {today.exercises.slice(0, 3).map((ex) => (
                      <li key={ex.id} className="flex justify-between text-sm">
                        <span className="text-zinc-300">{ex.name}</span>
                        <span className="text-zinc-500">{ex.sets} x {ex.reps}</span>
                      </li>
                    ))}
                    {today.exercises.length > 3 && (
                      <li className="text-xs text-zinc-600">+ {today.exercises.length - 3} mas...</li>
                    )}
                  </ul>
                  <Link href="/routines"
                    className="block w-full mt-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-2 rounded-lg font-bold text-sm text-center transition-colors">
                    Ir a la rutina
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                  <Dumbbell className="w-8 h-8 text-zinc-700" />
                  <p className="text-zinc-500 text-sm">Sin rutina asignada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ultima medicion */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Ultima Medicion</p>
            <Link href="/measurements" className="text-fuchsia-400 text-xs hover:text-fuchsia-300">Ver historial →</Link>
          </div>
          <Card className="bg-zinc-900 border-zinc-800 h-full">
            <CardContent className="p-5">
              {measurement ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-fuchsia-600/20 rounded-lg flex items-center justify-center">
                      <Ruler className="w-4 h-4 text-fuchsia-400" />
                    </div>
                    <p className="text-zinc-400 text-sm">
                      {new Date(measurement.date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  {measurement.weight && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black">{parseFloat(String(measurement.weight))}</span>
                      <span className="text-zinc-500">kg</span>
                    </div>
                  )}
                  <Link href="/measurements"
                    className="block w-full mt-2 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-bold text-sm text-center transition-colors">
                    Nueva medicion
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                  <Ruler className="w-8 h-8 text-zinc-700" />
                  <p className="text-zinc-500 text-sm">Sin mediciones todavia</p>
                  <Link href="/measurements" className="text-fuchsia-400 text-xs hover:text-fuchsia-300">Registrar primera medicion →</Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CoachDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/coach/students").then((r) => r.json()).then(setStudents).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-500 text-sm">Cargando...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">Hola, {user?.name?.split(" ")[0]}</h2>
        <p className="text-zinc-400 mt-1">Panel de coach</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-400">Alumnos asignados</p>
              <Users className="w-4 h-4 text-fuchsia-500" />
            </div>
            <h3 className="text-4xl font-black">{students.length}</h3>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-400">Con rutina</p>
              <Dumbbell className="w-4 h-4 text-fuchsia-500" />
            </div>
            <h3 className="text-4xl font-black text-zinc-500">—</h3>
            <p className="text-xs text-zinc-600 mt-1">Ver en perfil de cada alumno</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-400">Con nutricion</p>
              <UtensilsCrossed className="w-4 h-4 text-fuchsia-500" />
            </div>
            <h3 className="text-4xl font-black text-zinc-500">—</h3>
            <p className="text-xs text-zinc-600 mt-1">Ver en perfil de cada alumno</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista alumnos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Mis alumnos</p>
          <Link href="/coach/students" className="text-fuchsia-400 text-xs hover:text-fuchsia-300">Ver todos →</Link>
        </div>
        {students.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <Users className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">Sin alumnos asignados todavia.</p>
            <Link href="/coach/students" className="mt-3 inline-block text-fuchsia-400 text-sm font-bold hover:text-fuchsia-300">
              Agregar alumno →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {students.slice(0, 6).map((s) => (
              <Link key={s.id} href={`/coach/students/${s.id}`}
                className="flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-fuchsia-600/30 rounded-xl px-4 py-3 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-fuchsia-600 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{s.name}</p>
                    <p className="text-zinc-500 text-xs">{s.email}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-fuchsia-400 transition-colors" />
              </Link>
            ))}
            {students.length > 6 && (
              <Link href="/coach/students" className="block text-center text-zinc-500 text-sm py-2 hover:text-white transition-colors">
                Ver {students.length - 6} mas...
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Accesos rapidos */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Accesos rapidos</p>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/protocols"
            className="bg-zinc-900 border border-zinc-800 hover:border-fuchsia-600/30 rounded-xl p-4 transition-colors group">
            <TrendingUp className="w-5 h-5 text-fuchsia-500 mb-2" />
            <p className="font-bold text-sm">Protocolos</p>
            <p className="text-zinc-500 text-xs">Escribir y editar guias</p>
          </Link>
          <Link href="/coach/students"
            className="bg-zinc-900 border border-zinc-800 hover:border-fuchsia-600/30 rounded-xl p-4 transition-colors group">
            <Users className="w-5 h-5 text-fuchsia-500 mb-2" />
            <p className="font-bold text-sm">Gestionar alumnos</p>
            <p className="text-zinc-500 text-xs">Asignar, editar y ver progreso</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  const isCoach = user.role === "coach" || user.role === "admin";
  return isCoach ? <CoachDashboard /> : <StudentDashboard />;
}
