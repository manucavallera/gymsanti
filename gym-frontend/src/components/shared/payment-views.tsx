"use client";
import { ReactNode } from "react";
import { Payment, STATUS_CONFIG, displayStatus, formatDay, formatMoney, methodLabel, totals } from "@/lib/payments";

export function PaymentTotals({ payments }: { payments: Payment[] }) {
  const t = totals(payments);
  return (
    <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-zinc-500 text-sm mb-1">Total pagado</p>
        <p className="text-2xl font-black text-green-400">{formatMoney(t.paid)}</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-zinc-500 text-sm mb-1">Pendiente</p>
        <p className="text-2xl font-black text-yellow-400">{formatMoney(t.pending)}</p>
      </div>
    </div>
  );
}

// One fee. `actions` is the coach's controls (mark paid, delete); students get none.
export function PaymentRow({ payment: p, actions }: { payment: Payment; actions?: ReactNode }) {
  const status = displayStatus(p);
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <div className={`border rounded-xl p-4 ${cfg.bg}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold">{p.description}</p>
              {p.period && <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{p.period}</span>}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xl font-black">{formatMoney(Number(p.amount))}</span>
              <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
              {p.dueDate && p.status !== "pagado" && <span className="text-xs text-zinc-500">Vence: {formatDay(p.dueDate)}</span>}
              {p.paidAt && (
                <span className="text-xs text-zinc-500">
                  Pagado: {new Date(p.paidAt).toLocaleDateString("es-AR")}{p.method && ` (${methodLabel(p.method)})`}
                </span>
              )}
            </div>
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
