import { CheckCircle2, Clock, AlertCircle, LucideIcon } from "lucide-react";

export interface Payment {
  id: number;
  description: string;
  amount: number;
  status: "pendiente" | "pagado" | "vencido";
  method: string | null;
  period: string | null;
  dueDate: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
}

export type DisplayStatus = Payment["status"];

export const STATUS_CONFIG: Record<DisplayStatus, { label: string; icon: LucideIcon; color: string; bg: string }> = {
  pagado: { label: "Pagado", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-600/10 border-green-600/20" },
  pendiente: { label: "Pendiente", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-600/10 border-yellow-600/20" },
  vencido: { label: "Vencido", icon: AlertCircle, color: "text-red-400", bg: "bg-red-600/10 border-red-600/20" },
};

export const METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "mercadopago", label: "MercadoPago" },
];

export const methodLabel = (value: string | null) => METHODS.find((m) => m.value === value)?.label ?? value ?? "";

// Quick-fill presets for the coach form.
export const PLANS = [
  { label: "Mensual: Entrenamiento", amount: 25000, description: "Plan mensual de entrenamiento personalizado" },
  { label: "Mensual: Entrenamiento + Nutrición", amount: 38000, description: "Plan mensual completo con plan nutricional" },
  { label: "Clase suelta", amount: 4000, description: "Clase individual" },
];

export const formatMoney = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

// dueDate is "YYYY-MM-DD". Parse as a local date so it does not shift a day in Argentina.
const parseDay = (d: string) => {
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, day);
};

export const formatDay = (d: string) => parseDay(d).toLocaleDateString("es-AR");

// A pending fee past its due date shows as overdue. Nothing changes in the database.
export function displayStatus(p: Payment): DisplayStatus {
  if (p.status !== "pendiente" || !p.dueDate) return p.status;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseDay(p.dueDate) < today ? "vencido" : "pendiente";
}

export function totals(payments: Payment[]) {
  const paid = payments.filter((p) => p.status === "pagado").reduce((s, p) => s + Number(p.amount), 0);
  const pending = payments.filter((p) => p.status !== "pagado").reduce((s, p) => s + Number(p.amount), 0);
  return { paid, pending };
}
