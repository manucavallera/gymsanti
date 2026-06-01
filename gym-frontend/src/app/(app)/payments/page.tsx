"use client";
import { useEffect, useState } from "react";
import { Plus, CreditCard, CheckCircle2, Clock, AlertCircle, Trash2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { authFetch } from "@/lib/api";

interface Payment {
  id: number; description: string; amount: number; status: string;
  method: string; period: string; dueDate: string; paidAt: string; notes: string; createdAt: string;
}

const STATUS_CONFIG = {
  pagado: { label: "Pagado", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-600/10 border-green-600/20" },
  pendiente: { label: "Pendiente", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-600/10 border-yellow-600/20" },
  vencido: { label: "Vencido", icon: AlertCircle, color: "text-red-400", bg: "bg-red-600/10 border-red-600/20" },
};

const METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "mercadopago", label: "MercadoPago" },
];

const PLANS = [
  { label: "Mensual — Entrenamiento", amount: 25000, description: "Plan mensual de entrenamiento personalizado" },
  { label: "Mensual — Entrenamiento + Nutrición", amount: 38000, description: "Plan mensual completo con plan nutricional" },
  { label: "Clase suelta", amount: 4000, description: "Clase individual" },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payMethod, setPayMethod] = useState("transferencia");
  const [form, setForm] = useState({ description: "", amount: "", period: "", dueDate: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = () => authFetch("/payments").then((r) => r.json()).then(setPayments);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.description || !form.amount) return;
    setSaving(true);
    await authFetch("/payments", {
      method: "POST",
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    setForm({ description: "", amount: "", period: "", dueDate: "", notes: "" });
    setShowForm(false);
    setSaving(false);
    load();
  };

  const markPaid = async (id: number) => {
    await authFetch(`/payments/${id}/pay`, { method: "PATCH", body: JSON.stringify({ method: payMethod }) });
    setPayingId(null);
    load();
  };

  const del = async (id: number) => {
    await authFetch(`/payments/${id}`, { method: "DELETE" });
    load();
  };

  const fmt = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

  const totalPaid = payments.filter((p) => p.status === "pagado").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter((p) => p.status !== "pagado").reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Pagos</h2>
          <p className="text-zinc-400 mt-1">Historial y seguimiento de cuotas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors">
          <Plus className="w-4 h-4" /> Registrar pago
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-sm mb-1">Total pagado</p>
          <p className="text-2xl font-black text-green-400">{fmt(totalPaid)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-sm mb-1">Pendiente</p>
          <p className="text-2xl font-black text-yellow-400">{fmt(totalPending)}</p>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <Card className="bg-zinc-900 border-zinc-700">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">Nuevo registro de pago</h3>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            {/* Planes rápidos */}
            <div>
              <p className="text-xs text-zinc-500 mb-2">Planes rápidos</p>
              <div className="grid gap-2">
                {PLANS.map((plan) => (
                  <button key={plan.label} onClick={() => setForm((p) => ({ ...p, description: plan.description, amount: String(plan.amount) }))}
                    className="text-left bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-4 py-2.5 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{plan.label}</span>
                      <span className="text-fuchsia-400 font-bold text-sm">{fmt(plan.amount)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-3">
              <input type="text" placeholder="Descripción *"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Monto *</label>
                  <input type="number" placeholder="0"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Período</label>
                  <input type="text" placeholder="Ej: Abril 2025"
                    value={form.period}
                    onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Fecha de vencimiento</label>
                <input type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={save} disabled={saving || !form.description || !form.amount}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white text-sm px-4 py-2">Cancelar</button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de pagos */}
      {payments.length > 0 ? (
        <div className="space-y-3">
          {payments.map((p) => {
            const cfg = STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pendiente;
            const Icon = cfg.icon;
            return (
              <div key={p.id} className={`border rounded-xl p-4 transition-colors ${cfg.bg}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold">{p.description}</p>
                        {p.period && <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{p.period}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xl font-black">{fmt(Number(p.amount))}</span>
                        <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                        {p.dueDate && p.status !== "pagado" && (
                          <span className="text-xs text-zinc-500">Vence: {new Date(p.dueDate).toLocaleDateString("es-AR")}</span>
                        )}
                        {p.paidAt && (
                          <span className="text-xs text-zinc-500">Pagado: {new Date(p.paidAt).toLocaleDateString("es-AR")} — {p.method}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {p.status !== "pagado" && (
                      payingId === p.id ? (
                        <div className="flex items-center gap-2">
                          <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none">
                            {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </select>
                          <button onClick={() => markPaid(p.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                            Confirmar
                          </button>
                          <button onClick={() => setPayingId(null)} className="text-zinc-500 hover:text-white">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setPayingId(p.id)}
                          className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                          <CreditCard className="w-3.5 h-3.5" /> Marcar pagado
                        </button>
                      )
                    )}
                    <button onClick={() => del(p.id)} className="text-zinc-600 hover:text-red-400 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-zinc-500">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Sin registros de pago</p>
          <p className="text-sm mt-1">Registrá los pagos para llevar el control de cuotas</p>
        </div>
      )}
    </div>
  );
}

