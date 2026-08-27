"use client";
import { Home, ShoppingBag, User, Settings, LogOut, Ruler, Target, BookOpen, CreditCard, Users, UtensilsCrossed, Shield, Dumbbell, Package, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

type NavItem = { icon: LucideIcon; label: string; href: string; adminOnly?: boolean };

const studentItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Dumbbell, label: "Mi Rutina", href: "/routines" },
  { icon: UtensilsCrossed, label: "Nutricion", href: "/nutrition" },
  { icon: Ruler, label: "Medidas", href: "/measurements" },
  { icon: Target, label: "Objetivos", href: "/goals" },
  { icon: BookOpen, label: "Protocolos", href: "/protocols" },
  { icon: ShoppingBag, label: "Tienda", href: "/store" },
  { icon: CreditCard, label: "Pagos", href: "/payments" },
];

const coachItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Mis Alumnos", href: "/coach/students" },
  { icon: BookOpen, label: "Protocolos", href: "/protocols" },
  { icon: ShoppingBag, label: "Tienda", href: "/store" },
  { icon: Shield, label: "Admin", href: "/coach/admin", adminOnly: true },
  { icon: Package, label: "Productos", href: "/coach/products", adminOnly: true },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isCoach = user?.role === "coach" || user?.role === "admin";

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
          active
            ? "bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-600/30"
            : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
        }`}
      >
        <item.icon className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium text-sm">{item.label}</span>
      </Link>
    );
  };

  const navItems = isCoach
    ? coachItems.filter((item) => !item.adminOnly || user?.role === "admin")
    : studentItems;

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/70 transition-opacity md:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[min(18rem,86vw)] flex-col overflow-y-auto border-r border-white/10 bg-black/95 p-4 text-white backdrop-blur-sm transition-transform duration-200 md:sticky md:top-0 md:z-auto md:w-64 md:translate-x-0 md:bg-black/80 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-8 flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-fuchsia-600 rounded-lg flex items-center justify-center font-black flex-shrink-0 text-white">
          G
        </div>
        <h1 className="text-xl font-black tracking-widest uppercase">GYM CORE</h1>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar menú" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white md:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => <NavLink key={item.href} item={item} />)}
      </nav>

      <div className="mt-4 border-t border-white/10 pt-4 space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-fuchsia-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate capitalize">{user.role === "admin" ? "Admin" : user.role === "coach" ? "Coach" : "Alumno"}</p>
            </div>
          </div>
        )}
        <Link href="/profile"
          onClick={onClose}
          className={`flex items-center gap-3 px-3 py-2.5 transition-colors rounded-lg ${pathname === "/profile" ? "bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-600/30" : "text-zinc-400 hover:text-white hover:bg-zinc-900"}`}>
          <User className="w-4 h-4" />
          <span className="font-medium text-sm">Perfil</span>
        </Link>
        <Link href="/settings"
          onClick={onClose}
          className={`flex items-center gap-3 px-3 py-2.5 transition-colors rounded-lg ${pathname === "/settings" ? "bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-600/30" : "text-zinc-400 hover:text-white hover:bg-zinc-900"}`}>
          <Settings className="w-4 h-4" />
          <span className="font-medium text-sm">Configuracion</span>
        </Link>
        <button onClick={() => { onClose(); logout(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-900">
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-sm">Cerrar sesion</span>
        </button>
      </div>
      </aside>
    </>
  );
}
