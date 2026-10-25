"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Dumbbell, UtensilsCrossed, ArrowLeft, ChevronRight, User, Ruler, Plus, KeyRound } from "lucide-react";
import Link from "next/link";
import { authFetch, ensureOk } from "@/lib/api";
import { Measurement } from "@/lib/measurements";
import { LatestMeasurements, MeasurementHistory } from "@/components/shared/measurement-views";
import { MeasurementForm } from "@/components/shared/measurement-form";
import { CoachPayments } from "@/components/shared/coach-payments";
import { CoachGoals } from "@/components/shared/coach-goals";

interface Student { id: number; name: string; email: string; role: string; createdAt: string; }


type Tab = "overview" | "medidas" | "objetivos" | "pagos";

export default function CoachStudentPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [tabLoaded, setTabLoaded] = useState<Set<Tab>>(new Set(["overview"]));
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
    setTabLoaded((prev) => new Set([...prev, t]));
    setTab(t);
  };

  const reloadMeasurements = async () => {
    const data = await authFetch(`/coach/students/${id}/measurements`).then((r) => r.json());
    setMeasurements(data);
  };

  const deleteMeasurement = async (measurementId: number) => {
    if (!confirm("¿Borrar esta medición?")) return;
    await authFetch(`/coach/students/${id}/measurements/${measurementId}`, { method: "DELETE" }).then(ensureOk);
    reloadMeasurements();
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    try {
      await authFetch(`/coach/students/${id}/password`, { method: "PATCH", body: JSON.stringify({ password: newPassword }) }).then(ensureOk);
      setPwMsg({ ok: true, text: `Listo. Nueva contraseña: ${newPassword}` });
      setNewPassword("");
    } catch (err) {
      setPwMsg({ ok: false, text: err instanceof Error ? err.message : "No se pudo cambiar" });
    }
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

          <form onSubmit={changePassword} className="sm:col-span-2 bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Contraseña</h3>
                <p className="text-zinc-500 text-sm">Si se la olvidó, poné una nueva y pasásela.</p>
              </div>
            </div>
            {pwMsg && (
              <p className={`text-sm ${pwMsg.ok ? "text-green-400" : "text-red-400"}`}>{pwMsg.text}</p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <input type="text" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña (mínimo 6)" autoComplete="off"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
              <button type="submit" className="px-4 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg text-sm font-bold text-white transition-colors">
                Cambiar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Medidas */}
      {tab === "medidas" && (
        <div className="space-y-4">
          {showMeasurementForm ? (
            <MeasurementForm studentId={id}
              onSaved={() => { setShowMeasurementForm(false); reloadMeasurements(); }}
              onCancel={() => setShowMeasurementForm(false)} />
          ) : (
            <button onClick={() => setShowMeasurementForm(true)}
              className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors">
              <Plus className="w-4 h-4" /> Nueva medición
            </button>
          )}
          {measurements.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900 border border-white/10 rounded-2xl">
              <Ruler className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400">Sin mediciones registradas todavía.</p>
            </div>
          ) : (
            <>
              <LatestMeasurements measurements={measurements} />
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Historial completo</p>
              <MeasurementHistory measurements={measurements} onDelete={deleteMeasurement} />
            </>
          )}
        </div>
      )}

      {/* Pagos */}
      {tab === "pagos" && <CoachPayments studentId={id} />}

      {/* Objetivos */}
      {tab === "objetivos" && <CoachGoals studentId={id} />}
    </div>
  );
}
