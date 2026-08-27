"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/shared/sidebar";
import { useAuth } from "@/lib/auth";

const STUDENT_ONLY = ["/routines", "/nutrition", "/measurements", "/goals", "/payments"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user) {
      const isCoach = user.role === "coach" || user.role === "admin";
      if (isCoach && STUDENT_ONLY.some((p) => window.location.pathname.startsWith(p))) {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    const closeMenu = window.setTimeout(() => setMobileMenuOpen(false), 0);
    return () => window.clearTimeout(closeMenu);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fuchsia-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-black/85 px-4 py-3 backdrop-blur-sm md:hidden">
          <button type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menú" className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-900 hover:text-white">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-black uppercase tracking-[0.2em]">GYM CORE</span>
        </header>
        <main className="min-h-screen min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

