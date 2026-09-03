"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  imageEmoji: string;
  stock: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  add: (product: Omit<CartItem, "quantity">) => void;
  remove: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (product: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) => i.id === product.id ? { ...i, stock: product.stock, quantity: i.quantity + 1 } : i);
      }
      if (product.stock <= 0) return prev;
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const remove = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) { remove(id); return; }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: Math.min(qty, i.stock) } : i));
  };

  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
