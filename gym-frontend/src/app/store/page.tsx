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
  price: number; category: string; imageEmoji: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  todos: "Todos", suplementos: "Suplementos", vitaminas: "Vitaminas", dulces: "Dulces proteicos",
};

const CATEGORY_COLORS: Record<string, string> = {
  suplementos: "bg-blue-600/20 text-blue-400 border-blue-600/30",
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

  useEffect(() => {
    setLoading(true);
    const url = category === "todos" ? `${API}/products` : `${API}/products?category=${category}`;
    fetch(url).then((r) => r.json()).then(setProducts).finally(() => setLoading(false));
  }, [category]);

  const inCart = (id: number) => items.find((i) => i.id === id);

  const checkout = async () => {
    if (!user) return;
    setCheckingOut(true);
    const description = items.map((i) => `${i.name} x${i.quantity}`).join(", ");
    await authFetch("/payments", {
      method: "POST",
      body: JSON.stringify({ description: `Compra tienda: ${description}`, amount: total, period: new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" }) }),
    });
    clear();
    setCheckingOut(false);
    setCheckoutDone(true);
    setTimeout(() => { setCheckoutDone(false); setShowCart(false); }, 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 px-6 py-4 sticky top-0 bg-zinc-950/90 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <Link href="/" className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">G</div>
                <span className="text-lg font-black tracking-tight">GYM CORE</span>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!user && (
              <>
                <Link href="/login" className="text-zinc-400 hover:text-white text-sm font-medium">Iniciar sesión</Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Registrarse</Link>
              </>
            )}
            <button onClick={() => setShowCart(true)} className="relative flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 px-4 py-2 rounded-xl transition-colors text-sm font-medium">
              <ShoppingCart className="w-4 h-4" />
              <span>Carrito</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 rounded-full text-xs flex items-center justify-center font-bold">{count}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero tienda */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-black mb-1">Tienda</h1>
        <p className="text-zinc-400">Suplementos, vitaminas y snacks proteicos de calidad</p>
      </div>

      {/* Filtros */}
      <div className="max-w-6xl mx-auto px-6 pb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-zinc-500" />
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                category === cat ? "bg-blue-600 text-white border-blue-600" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
              }`}>
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <p className="text-zinc-500 text-sm mb-4">{products.length} productos</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const cartItem = inCart(product.id);
                return (
                  <Card key={product.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="h-40 bg-zinc-800 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                        {product.imageEmoji}
                      </div>
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
                          {user ? (
                            cartItem ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => updateQty(product.id, cartItem.quantity - 1)} className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-sm font-bold">{cartItem.quantity}</span>
                                <button onClick={() => add({ id: product.id, name: product.name, price: product.price, imageEmoji: product.imageEmoji })} className="w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => add({ id: product.id, name: product.name, price: product.price, imageEmoji: product.imageEmoji })}
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                <ShoppingCart className="w-3.5 h-3.5" /> Agregar
                              </button>
                            )
                          ) : (
                            <Link href="/login" className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                              Iniciar sesión
                            </Link>
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
          <div className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col">
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
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-colors">
                      {checkingOut ? "Procesando..." : "Confirmar pedido"}
                    </button>
                  ) : (
                    <Link href="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-colors text-center">
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
    </div>
  );
}
