"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/shared/sidebar";
import { useAuth } from "@/lib/auth";

const STUDENT_ONLY = ["/routines", "/nutrition", "/measurements", "/goals", "/payments"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user) {
      const isCoach = user.role === "coach" || user.role === "admin";
      if (isCoach && STUDENT_ONLY.some((p) => window.location.pathname.startsWith(p))) {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fuchsia-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto min-h-screen">{children}</main>
    </div>
  );
}

