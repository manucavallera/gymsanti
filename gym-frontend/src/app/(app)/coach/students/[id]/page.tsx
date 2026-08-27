"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Dumbbell, UtensilsCrossed, ArrowLeft, ChevronRight, User, Ruler, Target, TrendingDown, TrendingUp, Minus, CheckCircle2, CreditCard, Clock, AlertCircle, Trash2, X, Plus } from "lucide-react";
import Link from "next/link";
import { authFetch } from "@/lib/api";

interface Student { id: number; name: string; email: string; role: string; createdAt: string; }
interface Measurement {
  id: number; date: string; weight: number; chest: number; waist: number;
  hips: number; leftArm: number; rightArm: number; leftLeg: number; rightLeg: number; abdomen: number; notes: string;
}
interface Goal { id: number; title: string; description: string; category: string; targetValue: string; targetDate: string; achieved: boolean; }
interface Payment { id: number; description: string; amount: number; status: string; method: string; period: string; dueDate: string; paidAt: string; createdAt: string; }

const STATUS_CFG = {
  pagado: { label: "Pagado", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-600/10 border-green-600/20" },
  pendiente: { label: "Pendiente", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-600/10 border-yellow-600/20" },
  vencido: { label: "Vencido", icon: AlertCircle, color: "text-red-400", bg: "bg-red-600/10 border-red-600/20" },
};

const PAY_METHODS = ["efectivo", "transferencia", "tarjeta", "mercadopago"];

const fmt = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const FIELDS = [
  { key: "weight", label: "Peso", unit: "kg" },
  { key: "chest", label: "Pecho", unit: "cm" },
  { key: "waist", label: "Cintura", unit: "cm" },
  { key: "abdomen", label: "Abdomen", unit: "cm" },
  { key: "hips", label: "Cadera", unit: "cm" },
  { key: "leftArm", label: "Brazo izq.", unit: "cm" },
  { key: "rightArm", label: "Brazo der.", unit: "cm" },
  { key: "leftLeg", label: "Pierna izq.", unit: "cm" },
  { key: "rightLeg", label: "Pierna der.", unit: "cm" },
];

const CAT_LABELS: Record<string, string> = { peso: "Peso", fuerza: "Fuerza", medidas: "Medidas", habito: "Habito", otro: "Otro" };

type Tab = "overview" | "medidas" | "objetivos" | "pagos";

export default function CoachStudentPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [tabLoaded, setTabLoaded] = useState<Set<Tab>>(new Set(["overview"]));
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payMethod, setPayMethod] = useState("transferencia");
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm] = useState({ description: "", amount: "", period: "", dueDate: "" });

  useEffect(() => {
    authFetch(`/coach/students/${id}`)
      .then((r) => r.json())
      .then((data) => { if (data?.id) setStudent(data); else setError(true); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const loadTab = async (t: Tab) => {
    if (tabLoaded.has(t)) { setTab(t); return; }
    if (t === "medidas") {
      const data = await authFetch(`/coach/students/${id}/measurements`).then((r) => r.json());
      setMeasurements(data);
    }
    if (t === "objetivos") {
      const data = await authFetch(`/coach/students/${id}/goals`).then((r) => r.json());
      setGoals(data);
    }
    if (t === "pagos") {
      const data = await authFetch(`/coach/students/${id}/payments`).then((r) => r.json());
      setPayments(data);
    }
    setTabLoaded((prev) => new Set([...prev, t]));
    setTab(t);
  };

  if (loading) return <div className="text-zinc-500 text-sm">Cargando...</div>;

  if (error || !student) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <User className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
      <h2 className="text-2xl font-black uppercase mb-2">Alumno no encontrado</h2>
      <p className="text-zinc-500 mb-6">No tenes acceso a este alumno o no existe.</p>
      <Link href="/coach/students" className="text-fuchsia-400 hover:text-fuchsia-300 font-bold text-sm">← Volver a mis alumnos</Link>
    </div>
  );

  const joined = new Date(student.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
  const latest = measurements[0];
  const previous = measurements[1];
  const getDiff = (key: string) => {
    if (!latest || !previous) return null;
    const a = (latest as any)[key], b = (previous as any)[key];
    if (!a || !b) return null;
    return parseFloat(a) - parseFloat(b);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/coach/students"
          className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">{student.name}</h2>
          <p className="text-zinc-400 text-sm">{student.email} · Se unio el {joined}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([["overview", "Perfil"], ["medidas", "Medidas"], ["objetivos", "Objetivos"], ["pagos", "Pagos"]] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => loadTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === t ? "bg-fuchsia-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href={`/coach/students/${id}/routine`}
            className="group bg-zinc-900 border border-white/10 hover:border-fuchsia-600/40 rounded-2xl p-6 transition-all hover:bg-fuchsia-600/5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-fuchsia-600/20 rounded-xl flex items-center justify-center group-hover:bg-fuchsia-600/30 transition-colors">
                <Dumbbell className="w-6 h-6 text-fuchsia-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-fuchsia-400 transition-colors" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-1">Rutina</h3>
            <p className="text-zinc-500 text-sm">Crear y editar dias, ejercicios y series del plan de entrenamiento.</p>
          </Link>

          <Link href={`/coach/students/${id}/nutrition`}
            className="group bg-zinc-900 border border-white/10 hover:border-fuchsia-600/40 rounded-2xl p-6 transition-all hover:bg-fuchsia-600/5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-fuchsia-600/20 rounded-xl flex items-center justify-center group-hover:bg-fuchsia-600/30 transition-colors">
                <UtensilsCrossed className="w-6 h-6 text-fuchsia-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-fuchsia-400 transition-colors" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-1">Nutricion</h3>
            <p className="text-zinc-500 text-sm">Configurar el plan alimenticio con dias, comidas y macros.</p>
          </Link>
        </div>
      )}

      {/* Medidas */}
      {tab === "medidas" && (
        <div className="space-y-4">
          {measurements.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900 border border-white/10 rounded-2xl">
              <Ruler className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400">Sin mediciones registradas todavia.</p>
            </div>
          ) : (
            <>
              {latest && (
                <div>
                  <p className="text-zinc-500 text-sm mb-3">
                    Ultima medicion — {new Date(latest.date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {FIELDS.map((f) => {
                      const val = (latest as any)[f.key];
                      const diff = getDiff(f.key);
                      if (!val) return null;
                      return (
                        <div key={f.key} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                          <p className="text-xs text-zinc-500 mb-1">{f.label}</p>
                          <p className="text-xl font-black">{parseFloat(val)}<span className="text-sm font-normal text-zinc-500 ml-1">{f.unit}</span></p>
                          {diff !== null && (
                            <div className={`flex items-center gap-1 text-xs mt-1 ${diff < 0 ? "text-green-400" : diff > 0 ? "text-red-400" : "text-zinc-500"}`}>
                              {diff < 0 ? <TrendingDown className="w-3 h-3" /> : diff > 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                              {diff > 0 ? "+" : ""}{diff.toFixed(1)} {f.unit}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Historial completo</p>
                {measurements.map((m) => (
                  <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <p className="font-medium text-sm mb-1">{new Date(m.date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</p>
                    <div className="flex flex-wrap gap-3">
                      {FIELDS.map((f) => {
                        const v = (m as any)[f.key];
                        if (!v) return null;
                        return <span key={f.key} className="text-xs text-zinc-400">{f.label}: <span className="text-white">{parseFloat(v)}{f.unit}</span></span>;
                      })}
                    </div>
                    {m.notes && <p className="text-xs text-zinc-500 mt-1">{m.notes}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Pagos */}
      {tab === "pagos" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Pagos del alumno</p>
            <button onClick={() => setShowPayForm((v) => !v)}
              className="flex items-center gap-1.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
              <Plus className="w-3.5 h-3.5" />Nuevo
            </button>
          </div>

          {showPayForm && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Registrar pago</p>
                <button onClick={() => setShowPayForm(false)}><X className="w-4 h-4 text-zinc-500" /></button>
              </div>
              <input placeholder="Descripcion *" value={payForm.description}
                onChange={(e) => setPayForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Monto *" type="number" value={payForm.amount}
                  onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500" />
                <input placeholder="Periodo (ej: Mayo 2025)" value={payForm.period}
                  onChange={(e) => setPayForm((p) => ({ ...p, period: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500" />
              </div>
              <input type="date" value={payForm.dueDate}
                onChange={(e) => setPayForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500" />
              <button
                disabled={!payForm.description || !payForm.amount}
                onClick={async () => {
                  const data = await authFetch(`/coach/students/${id}/payments`, {
                    method: "POST",
                    body: JSON.stringify({ description: payForm.description, amount: parseFloat(payForm.amount), period: payForm.period, dueDate: payForm.dueDate }),
                  }).then((r) => r.json());
                  setPayments((p) => [data, ...p]);
                  setPayForm({ description: "", amount: "", period: "", dueDate: "" });
                  setShowPayForm(false);
                }}
                className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-40 text-white py-2 rounded-lg text-sm font-bold transition-colors">
                Guardar
              </button>
            </div>
          )}

          {payments.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 border border-white/10 rounded-2xl">
              <CreditCard className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400">Sin registros de pago todavia.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => {
                const cfg = STATUS_CFG[p.status as keyof typeof STATUS_CFG] || STATUS_CFG.pendiente;
                const Icon = cfg.icon;
                return (
                  <div key={p.id} className={`border rounded-xl p-4 ${cfg.bg}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm">{p.description}</p>
                            {p.period && <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{p.period}</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="font-black text-base">{fmt(Number(p.amount))}</span>
                            <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                            {p.dueDate && p.status !== "pagado" && <span className="text-xs text-zinc-500">Vence: {new Date(p.dueDate).toLocaleDateString("es-AR")}</span>}
                            {p.paidAt && <span className="text-xs text-zinc-500">Pagado: {new Date(p.paidAt).toLocaleDateString("es-AR")}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {p.status !== "pagado" && (
                          payingId === p.id ? (
                            <div className="flex items-center gap-2">
                              <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                                className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none">
                                {PAY_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <button onClick={async () => {
                                const updated = await authFetch(`/coach/students/${id}/payments/${p.id}/pay`, {
                                  method: "PATCH", body: JSON.stringify({ method: payMethod }),
                                }).then((r) => r.json());
                                setPayments((prev) => prev.map((x) => x.id === p.id ? updated : x));
                                setPayingId(null);
                              }} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-lg text-xs font-bold">OK</button>
                              <button onClick={() => setPayingId(null)}><X className="w-3.5 h-3.5 text-zinc-500" /></button>
                            </div>
                          ) : (
                            <button onClick={() => setPayingId(p.id)}
                              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />Pagar
                            </button>
                          )
                        )}
                        <button onClick={async () => {
                          await authFetch(`/coach/students/${id}/payments/${p.id}`, { method: "DELETE" });
                          setPayments((prev) => prev.filter((x) => x.id !== p.id));
                        }} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Objetivos */}
      {tab === "objetivos" && (
        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900 border border-white/10 rounded-2xl">
              <Target className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400">Sin objetivos registrados todavia.</p>
            </div>
          ) : (
            goals.map((g) => (
              <div key={g.id} className={`bg-zinc-900 border rounded-xl p-4 ${g.achieved ? "border-green-600/30" : "border-zinc-800"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${g.achieved ? "bg-green-600/20" : "bg-zinc-800"}`}>
                    {g.achieved ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Target className="w-4 h-4 text-zinc-400" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold ${g.achieved ? "line-through text-zinc-500" : ""}`}>{g.title}</p>
                      <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full">{CAT_LABELS[g.category] || g.category}</span>
                    </div>
                    {g.description && <p className="text-zinc-500 text-sm mt-0.5">{g.description}</p>}
                    <div className="flex gap-4 mt-1">
                      {g.targetValue && <span className="text-xs text-zinc-500">Meta: <span className="text-zinc-300">{g.targetValue}</span></span>}
                      {g.targetDate && <span className="text-xs text-zinc-500">Fecha: <span className="text-zinc-300">{new Date(g.targetDate).toLocaleDateString("es-AR")}</span></span>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
