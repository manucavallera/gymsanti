"use client";

import { FormEvent, useEffect, useState } from "react";
import { Package, Plus, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Category = "suplementos" | "vitaminas" | "dulces";
type MovementType = "entrada" | "salida" | "ajuste";
interface Product { id: number; name: string; description: string; price: number; category: Category; imageUrl?: string; imageUrls?: string[]; imageEmoji?: string; stock: number; available: boolean; }

const categories: { value: Category; label: string }[] = [
  { value: "suplementos", label: "Suplementos" },
  { value: "vitaminas", label: "Vitaminas" },
  { value: "dulces", label: "Dulces proteicos" },
];

export default function ProductsAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "suplementos" as Category, imageUrls: "", stock: "0" });
  const [movement, setMovement] = useState<{ id: number; type: MovementType } | null>(null);
  const [movementForm, setMovementForm] = useState({ quantity: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => authFetch("/products/admin").then((r) => r.ok ? r.json() : Promise.reject(new Error("No autorizado"))).then(setProducts).catch((e) => setError(e.message)).finally(() => setLoading(false));
  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
    if (user?.role === "admin") load();
  }, [user]);

  const startCreate = () => { setEditing(null); setShowForm(true); setForm({ name: "", description: "", price: "", category: "suplementos", imageUrls: "", stock: "0" }); setError(""); };
  const startEdit = (product: Product) => { setEditing(product); setShowForm(true); setForm({ name: product.name, description: product.description, price: String(product.price), category: product.category, imageUrls: (product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : []).join("\n"), stock: String(product.stock) }); setError(""); };

  const save = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    const imageUrls = form.imageUrls.split("\n").map((url) => url.trim()).filter(Boolean);
    const response = await authFetch(editing ? `/products/${editing.id}` : "/products", { method: editing ? "PUT" : "POST", body: JSON.stringify({ ...form, imageUrl: imageUrls[0] || null, imageUrls, price: Number(form.price), stock: Number(form.stock) }) });
    if (!response.ok) { setError((await response.json().catch(() => null))?.message || "No se pudo guardar"); setSaving(false); return; }
    setEditing(null); setShowForm(false); setSaving(false); load();
  };

  const hide = async (id: number) => { await authFetch(`/products/${id}`, { method: "DELETE" }); load(); };
  const addMovement = async (event: FormEvent) => {
    event.preventDefault(); if (!movement) return; setSaving(true); setError("");
    const response = await authFetch(`/products/${movement.id}/stock-movements`, { method: "POST", body: JSON.stringify({ type: movement.type, quantity: Number(movementForm.quantity), reason: movementForm.reason }) });
    if (!response.ok) setError((await response.json().catch(() => null))?.message || "No se pudo actualizar el stock");
    else { setMovement(null); setMovementForm({ quantity: "", reason: "" }); load(); }
    setSaving(false);
  };

  if (!user || user.role !== "admin") return null;
  return <div className="mx-auto max-w-5xl space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-600/20"><Package className="h-5 w-5 text-fuchsia-400" /></div><div><h2 className="text-3xl font-black uppercase">Productos</h2><p className="text-sm text-zinc-400">Catálogo e inventario</p></div></div>
      <button type="button" onClick={startCreate} className="flex items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-2.5 font-bold hover:bg-fuchsia-700"><Plus className="h-4 w-4" /> Nuevo producto</button>
    </div>
    {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
    {showForm && <form onSubmit={save} className="space-y-3 rounded-2xl border border-fuchsia-600/30 bg-zinc-900 p-5">
      <div className="flex items-center justify-between"><h3 className="font-bold">{editing ? "Editar producto" : "Nuevo producto"}</h3><button type="button" onClick={() => { setShowForm(false); setEditing(null); }} aria-label="Cerrar formulario"><X className="h-4 w-4" /></button></div>
      <div className="grid gap-3 sm:grid-cols-2"><input required placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white" /><input required type="number" min="0" step="0.01" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white" /><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white">{categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select><input type="number" min="0" step="1" placeholder="Stock inicial" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white" /></div>
      <textarea placeholder="URLs de imágenes, una por línea (opcional)" rows={3} value={form.imageUrls} onChange={(e) => setForm({ ...form, imageUrls: e.target.value })} className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white" /><textarea required placeholder="Descripción" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white" /><button disabled={saving} className="flex items-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-2 font-bold disabled:opacity-50"><Save className="h-4 w-4" /> Guardar</button>
    </form>}
    {loading ? <p className="text-zinc-500">Cargando productos...</p> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <div key={product.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"><div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-zinc-800 text-5xl">{(product.imageUrls?.[0] || product.imageUrl) ? <img src={product.imageUrls?.[0] || product.imageUrl} alt={product.name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : product.imageEmoji || "📦"}</div><h3 className="font-bold">{product.name}</h3><p className="mt-1 line-clamp-2 text-xs text-zinc-500">{product.description}</p><p className="mt-3 text-lg font-black">${product.price}</p><p className={`text-sm font-bold ${product.stock > 0 ? "text-green-400" : "text-red-400"}`}>{product.stock} unidades</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => startEdit(product)} className="rounded-lg bg-zinc-800 px-3 py-2 text-xs font-bold hover:bg-zinc-700">Editar</button>{(["entrada", "salida", "ajuste"] as MovementType[]).map((type) => <button type="button" key={type} onClick={() => setMovement({ id: product.id, type })} className="rounded-lg bg-fuchsia-600/20 px-2 py-2 text-xs font-bold text-fuchsia-300">{type}</button>)}<button type="button" onClick={() => hide(product.id)} className="rounded-lg px-2 py-2 text-xs text-red-400 hover:bg-red-500/10">Ocultar</button></div></div>)}</div>}
    {movement && <form onSubmit={addMovement} className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl"><div className="flex items-center justify-between"><h3 className="font-bold">Movimiento: {movement.type}</h3><button type="button" onClick={() => setMovement(null)}><X className="h-4 w-4" /></button></div><input required type="number" min="0" step="1" placeholder="Cantidad" value={movementForm.quantity} onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white" /><input placeholder="Motivo (opcional)" value={movementForm.reason} onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white" /><button disabled={saving} className="w-full rounded-lg bg-fuchsia-600 py-2 font-bold">Guardar movimiento</button></form>}
  </div>;
}
