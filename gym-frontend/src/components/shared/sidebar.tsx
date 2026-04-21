"use client";
import { Home, Dumbbell, ShoppingBag, User, Settings, LogOut, Ruler, Target, BookOpen, CreditCard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Dumbbell, label: "Mi Rutina", href: "/routines" },
  { icon: Ruler, label: "Medidas", href: "/measurements" },
  { icon: Target, label: "Objetivos", href: "/goals" },
  { icon: BookOpen, label: "Protocolos", href: "/protocols" },
  { icon: ShoppingBag, label: "Tienda", href: "/store" },
  { icon: CreditCard, label: "Pagos", href: "/payments" },
  { icon: User, label: "Perfil", href: "/profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 h-screen sticky top-0 flex flex-col p-4 text-white overflow-y-auto">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold flex-shrink-0">
          G
        </div>
        <h1 className="text-xl font-bold tracking-tight">GYM CORE</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-zinc-800 pt-4 space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.role}</p>
            </div>
          </div>
        )}
        <Link href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 transition-colors rounded-lg ${pathname.startsWith("/settings") ? "bg-blue-600/20 text-blue-400" : "text-zinc-400 hover:text-white hover:bg-zinc-900"}`}>
          <Settings className="w-4 h-4" />
          <span className="font-medium text-sm">Configuración</span>
        </Link>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-900">
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-sm">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
