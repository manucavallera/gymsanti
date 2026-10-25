"use client";
import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { authFetch } from "@/lib/api";
import { Payment } from "@/lib/payments";
import { PaymentRow, PaymentTotals } from "@/components/shared/payment-views";

// Read-only: the coach records fees from the student's profile.
export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/payments").then((r) => r.json()).then(setPayments).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Pagos</h2>
        <p className="text-zinc-400 mt-1">Tus cuotas y compras, registradas por tu coach</p>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Cargando...</p>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Sin registros de pago</p>
          <p className="text-sm mt-1">Cuando tu coach registre una cuota, la vas a ver acá.</p>
        </div>
      ) : (
        <>
          <PaymentTotals payments={payments} />
          <div className="space-y-3">
            {payments.map((p) => <PaymentRow key={p.id} payment={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
