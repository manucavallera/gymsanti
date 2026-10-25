"use client";
import { useEffect, useState } from "react";
import { CreditCard, Plus, Trash2, X } from "lucide-react";
import { authFetch, ensureOk } from "@/lib/api";
import { METHODS, PLANS, Payment, formatMoney } from "@/lib/payments";
import { PaymentRow, PaymentTotals } from "@/components/shared/payment-views";

const emptyForm = { description: "", amount: "", period: "", dueDate: "", paid: false, method: "efectivo" };

// Coach view of one student's fees: record, mark paid, delete.
export function CoachPayments({ studentId }: { studentId: number | string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payMethod, setPayMethod] = useState("efectivo");

  const base = `/coach/students/${studentId}/payments`;

  useEffect(() => {
    authFetch(base).then((r) => r.json()).then(setPayments).catch(() => {}).finally(() => setLoading(false));
  }, [base]);

  // Runs an API call and shows the backend message if it fails.
  const run = async (fn: () => Promise<void>) => {
    setError("");
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar"); }
  };

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    run(async () => {
      const body = {
        description: form.description,
        amount: parseFloat(form.amount),
        period: form.period || undefined,
        dueDate: form.paid ? undefined : form.dueDate || undefined,
        paid: form.paid,
        method: form.paid ? form.method : undefined,
      };
      const created: Payment = await authFetch(base, { method: "POST", body: JSON.stringify(body) }).then(ensureOk).then((r) => r.json());
      setPayments((p) => [created, ...p]);
      setForm(emptyForm);
      setShowForm(false);
    }).finally(() => setSaving(false));
  };

  const markPaid = (id: number) => run(async () => {
    const updated: Payment = await authFetch(`${base}/${id}/pay`, { method: "PATCH", body: JSON.stringify({ method: payMethod }) })
      .then(ensureOk).then((r) => r.json());
    setPayments((prev) => prev.map((x) => (x.id === id ? updated : x)));
    setPayingId(null);
  });

  const remove = (p: Payment) => {
    if (!confirm(`¿Borrar "${p.description}"?`)) return;
    run(async () => {
      await authFetch(`${base}/${p.id}`, { method: "DELETE" }).then(ensureOk);
      setPayments((prev) => prev.filter((x) => x.id !== p.id));
    });
  };

  const input = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Pagos del alumno</p>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
          <Plus className="w-3.5 h-3.5" />Registrar pago
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg">{error}</div>}

      {showForm && (
        <form onSubmit={create} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Registrar pago</p>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Cerrar"><X className="w-4 h-4 text-zinc-500" /></button>
          </div>
          <div className="grid gap-2">
            {PLANS.map((plan) => (
              <button key={plan.label} type="button" onClick={() => setForm((p) => ({ ...p, description: plan.description, amount: String(plan.amount) }))}
                className="flex items-center justify-between text-left bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-3 py-2 text-sm transition-colors">
                <span>{plan.label}</span>
                <span className="text-fuchsia-400 font-bold">{formatMoney(plan.amount)}</span>
              </button>
            ))}
          </div>
          <input required minLength={2} placeholder="Descripción *" value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={input} />
          <div className="grid grid-cols-2 gap-2">
            <input required min={1} placeholder="Monto *" type="number" value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} className={input} />
            <input placeholder="Período (ej: Noviembre 2026)" value={form.period}
              onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))} className={input} />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={form.paid} onChange={(e) => setForm((p) => ({ ...p, paid: e.target.checked }))} className="accent-fuchsia-600" />
            Ya pagó
          </label>
          {form.paid ? (
            <select value={form.method} onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))} className={input}>
              {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          ) : (
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Vence el (opcional)</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} className={input} />
            </div>
          )}
          <button type="submit" disabled={saving}
            className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-40 text-white py-2 rounded-lg text-sm font-bold transition-colors">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-zinc-500 text-sm">Cargando...</p>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900 border border-white/10 rounded-2xl">
          <CreditCard className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400">Sin registros de pago todavía.</p>
        </div>
      ) : (
        <>
          <PaymentTotals payments={payments} />
          <div className="space-y-2">
            {payments.map((p) => (
              <PaymentRow key={p.id} payment={p} actions={
                <>
                  {p.status !== "pagado" && (payingId === p.id ? (
                    <>
                      <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none">
                        {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                      <button onClick={() => markPaid(p.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Confirmar</button>
                      <button onClick={() => setPayingId(null)} aria-label="Cancelar"><X className="w-3.5 h-3.5 text-zinc-500" /></button>
                    </>
                  ) : (
                    <button onClick={() => setPayingId(p.id)}
                      className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />Marcar pagado
                    </button>
                  ))}
                  <button onClick={() => remove(p)} aria-label="Borrar pago" className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              } />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
