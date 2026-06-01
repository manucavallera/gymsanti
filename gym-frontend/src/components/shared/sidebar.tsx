"use client";
import { Home, ShoppingBag, User, Settings, LogOut, Ruler, Target, BookOpen, CreditCard, Users, UtensilsCrossed, Shield, Dumbbell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const studentItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Dumbbell, label: "Mi Rutina", href: "/routines" },
  { icon: UtensilsCrossed, label: "Nutricion", href: "/nutrition" },
  { icon: Ruler, label: "Medidas", href: "/measurements" },
  { icon: Target, label: "Objetivos", href: "/goals" },
  { icon: BookOpen, label: "Protocolos", href: "/protocols" },
  { icon: ShoppingBag, label: "Tienda", href: "/store" },
  { icon: CreditCard, label: "Pagos", href: "/payments" },
];

const coachItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Mis Alumnos", href: "/coach/students" },
  { icon: BookOpen, label: "Protocolos", href: "/protocols" },
  { icon: ShoppingBag, label: "Tienda", href: "/store" },
  { icon: Shield, label: "Admin", href: "/coach/admin", adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isCoach = user?.role === "coach" || user?.role === "admin";

  const NavLink = ({ item }: { item: { icon: any; label: string; href: string } }) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        href={item.href}
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
    ? coachItems.filter((item) => !(item as any).adminOnly || user?.role === "admin")
    : studentItems;

  return (
    <aside className="w-64 border-r border-white/10 bg-black/80 backdrop-blur-sm h-screen sticky top-0 flex flex-col p-4 text-white overflow-y-auto">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 bg-fuchsia-600 rounded-lg flex items-center justify-center font-black flex-shrink-0 text-white">
          G
        </div>
        <h1 className="text-xl font-black tracking-widest uppercase">GYM CORE</h1>
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
          className={`flex items-center gap-3 px-3 py-2.5 transition-colors rounded-lg ${pathname === "/profile" ? "bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-600/30" : "text-zinc-400 hover:text-white hover:bg-zinc-900"}`}>
          <User className="w-4 h-4" />
          <span className="font-medium text-sm">Perfil</span>
        </Link>
        <Link href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 transition-colors rounded-lg ${pathname === "/settings" ? "bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-600/30" : "text-zinc-400 hover:text-white hover:bg-zinc-900"}`}>
          <Settings className="w-4 h-4" />
          <span className="font-medium text-sm">Configuracion</span>
        </Link>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-900">
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-sm">Cerrar sesion</span>
        </button>
      </div>
    </aside>
  );
}
