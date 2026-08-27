"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Filter, Plus, Minus, X, CheckCircle2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { authFetch } from "@/lib/api";
import { API } from "@/lib/api";

type Category = "todos" | "suplementos" | "vitaminas" | "dulces";

interface Product {
  id: number; name: string; description: string;
  price: number; category: string; imageEmoji: string; imageUrl?: string; imageUrls?: string[]; stock: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  todos: "Todos", suplementos: "Suplementos", vitaminas: "Vitaminas", dulces: "Dulces proteicos",
};

const CATEGORY_COLORS: Record<string, string> = {
  suplementos: "bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-600/30",
  vitaminas: "bg-green-600/20 text-green-400 border-green-600/30",
  dulces: "bg-pink-600/20 text-pink-400 border-pink-600/30",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export default function StorePage() {
  const { user } = useAuth();
  const { items, add, remove, updateQty, clear, total, count } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category>("todos");
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [addedProduct, setAddedProduct] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [detail, setDetail] = useState<{ product: Product; imageIndex: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    const url = category === "todos" ? `${API}/products` : `${API}/products?category=${category}`;
    fetch(url).then((r) => r.json()).then(setProducts).finally(() => setLoading(false));
  }, [category]);

  const inCart = (id: number) => items.find((i) => i.id === id);

  const addToCart = (product: Product) => {
    add({ id: product.id, name: product.name, price: product.price, imageEmoji: product.imageEmoji });
    setAddedProduct(product.id);
    window.setTimeout(() => setAddedProduct((current) => current === product.id ? null : current), 1600);
  };

  const checkout = async () => {
    if (!user) return;
    setCheckingOut(true);
    setCheckoutError("");
    const description = items.map((i) => `${i.name} x${i.quantity}`).join(", ");
    const response = await authFetch("/payments", {
      method: "POST",
      body: JSON.stringify({ description: `Compra tienda: ${description}`, amount: total, items: items.map((item) => ({ productId: item.id, quantity: item.quantity })), period: new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" }) }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setCheckoutError(body?.message || "No se pudo confirmar la compra. Revisá el stock disponible.");
      setCheckingOut(false);
      return;
    }
    clear();
    setCheckingOut(false);
    setCheckoutDone(true);
    setTimeout(() => { setCheckoutDone(false); setShowCart(false); }, 3000);
  };

  return (
    <div className="min-h-screen text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <Link href="/" className="flex items-center gap-3">
                <div className="w-7 h-7 bg-fuchsia-600 rounded-lg flex items-center justify-center font-bold text-sm">G</div>
                <span className="text-base font-black tracking-tight sm:text-lg">GYM CORE</span>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!user && (
              <>
                <Link href="/login" className="hidden text-xs font-medium text-zinc-400 hover:text-white sm:block sm:text-sm">Iniciar sesión</Link>
                <Link href="/register" className="rounded-lg bg-fuchsia-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-fuchsia-700 sm:px-4 sm:text-sm">Registrarse</Link>
              </>
            )}
            <button type="button" onClick={() => setShowCart(true)} className="relative flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 px-4 py-2 rounded-xl transition-colors text-sm font-medium">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Carrito</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-fuchsia-600 rounded-full text-xs flex items-center justify-center font-bold">{count}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero tienda */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-1 text-3xl font-black sm:text-4xl">Tienda</h1>
        <p className="text-zinc-400">Suplementos, vitaminas y snacks proteicos de calidad</p>
      </div>

      {/* Filtros */}
      <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-zinc-500" />
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                category === cat ? "bg-fuchsia-600 text-white border-fuchsia-600" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
              }`}>
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <p className="text-zinc-500 text-sm mb-4">{products.length} productos</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const cartItem = inCart(product.id);
                return (
                  <Card key={product.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors overflow-hidden group">
                    <CardContent className="p-0">
                      <button type="button" onClick={() => setDetail({ product, imageIndex: 0 })} className="flex h-40 w-full items-center justify-center overflow-hidden bg-zinc-800 text-6xl group-hover:scale-110 transition-transform">
                        {(product.imageUrls?.[0] || product.imageUrl) ? <img src={product.imageUrls?.[0] || product.imageUrl} alt={product.name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : product.imageEmoji}
                      </button>
                      <div className="p-4 space-y-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[product.category] || "bg-zinc-800 text-zinc-400"}`}>
                          {CATEGORY_LABELS[product.category] || product.category}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm leading-tight">{product.name}</h3>
                          <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-lg font-black">{fmt(product.price)}</span>
                          {product.stock === 0 && !cartItem ? <span className="text-xs font-bold text-red-400">Sin stock</span> : cartItem ? (
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={() => updateQty(product.id, cartItem.quantity - 1)} className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-sm font-bold">{cartItem.quantity}</span>
                                <button type="button" disabled={cartItem.quantity >= product.stock} onClick={() => addToCart(product)} className="w-7 h-7 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg flex items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-40">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => addToCart(product)}
                                className="flex items-center gap-1.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                <ShoppingCart className="w-3.5 h-3.5" /> {addedProduct === product.id ? "Agregado" : "Agregar"}
                              </button>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Drawer carrito */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCart(false)} />
          <div className="relative flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-900">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold">Carrito ({count})</h2>
              <button onClick={() => setShowCart(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {checkoutDone ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
                <h3 className="text-xl font-bold">¡Pedido registrado!</h3>
                <p className="text-zinc-400">Tu pedido fue registrado como pago pendiente. Lo podés ver en la sección Pagos.</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-500">
                <ShoppingCart className="w-12 h-12 opacity-30" />
                <p>El carrito está vacío</p>
              </div>
            ) : (
              <>
                {checkoutError && <p className="mx-6 mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{checkoutError}</p>}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        {item.imageEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-zinc-400 text-sm">{fmt(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => remove(item.id)} className="text-zinc-600 hover:text-red-400 transition-colors ml-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Total</span>
                    <span className="text-2xl font-black">{fmt(total)}</span>
                  </div>
                  {user ? (
                    <button onClick={checkout} disabled={checkingOut}
                      className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-colors">
                      {checkingOut ? "Procesando..." : "Confirmar pedido"}
                    </button>
                  ) : (
                    <Link href="/login" className="block w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-4 rounded-xl font-bold text-lg transition-colors text-center">
                      Iniciar sesión para comprar
                    </Link>
                  )}
                  <button onClick={clear} className="w-full text-zinc-500 hover:text-red-400 text-sm transition-colors">
                    Vaciar carrito
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {detail && (() => {
        const images = detail.product.imageUrls?.length ? detail.product.imageUrls : detail.product.imageUrl ? [detail.product.imageUrl] : [];
        const image = images[detail.imageIndex];
        return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setDetail(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-black">{detail.product.name}</h2><button type="button" onClick={() => setDetail(null)} aria-label="Cerrar detalle" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"><X className="h-5 w-5" /></button></div>
            <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-xl bg-zinc-800 text-7xl sm:h-96">{image ? <img src={image} alt={detail.product.name} className="h-full w-full object-contain" /> : detail.product.imageEmoji}</div>
            {images.length > 1 && <div className="mt-3 flex justify-center gap-2 overflow-x-auto">{images.map((url, index) => <button type="button" key={url} onClick={() => setDetail({ ...detail, imageIndex: index })} className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${index === detail.imageIndex ? "border-fuchsia-500" : "border-zinc-700"}`}><img src={url} alt="" className="h-full w-full object-cover" /></button>)}</div>}
            <div className="mt-5 space-y-2"><span className="text-xs font-bold uppercase tracking-wide text-fuchsia-400">{CATEGORY_LABELS[detail.product.category] || detail.product.category}</span><p className="text-zinc-300">{detail.product.description}</p><p className="text-2xl font-black">{fmt(detail.product.price)}</p><p className="text-sm text-zinc-400">{detail.product.stock > 0 ? `${detail.product.stock} unidades disponibles` : "Sin stock"}</p></div>
          </div>
        </div>;
      })()}
    </div>
  );
}

