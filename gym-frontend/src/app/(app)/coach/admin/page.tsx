"use client";
import { useEffect, useState } from "react";
import { Shield, Search, ChevronDown } from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

type Role = "user" | "coach" | "admin";
interface User { id: number; name: string; email: string; role: Role; coachId: number | null; createdAt: string; }

const ROLES: Role[] = ["user", "coach", "admin"];
const ROLE_LABELS: Record<Role, string> = { user: "Alumno", coach: "Coach", admin: "Admin" };
const ROLE_COLORS: Record<Role, string> = {
  user: "text-zinc-400 bg-zinc-800",
  coach: "text-fuchsia-300 bg-fuchsia-900/40",
  admin: "text-yellow-300 bg-yellow-900/40",
};

export default function AdminPage() {
  const { user: me } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [changing, setChanging] = useState<number | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  useEffect(() => {
    if (me && me.role !== "admin") { router.replace("/dashboard"); return; }
    authFetch("/coach/users").then((r) => r.json()).then(setUsers).finally(() => setLoading(false));
  }, [me]);

  const changeRole = async (userId: number, role: Role) => {
    setChanging(userId);
    setOpenMenu(null);
    await authFetch(`/coach/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    setChanging(null);
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Panel Admin</h2>
          <p className="text-zinc-400 text-sm">{users.length} usuarios registrados</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text" placeholder="Buscar por nombre o email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
        />
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Cargando usuarios...</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className="bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate">{u.name} {u.id === me?.id && <span className="text-zinc-500 text-xs font-normal">(vos)</span>}</p>
                  <p className="text-zinc-500 text-sm truncate">{u.email}</p>
                </div>
              </div>

              <div className="relative flex-shrink-0">
                {u.id === me?.id ? (
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                      disabled={changing === u.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${ROLE_COLORS[u.role]} hover:opacity-80 disabled:opacity-40`}
                    >
                      {changing === u.id ? "..." : ROLE_LABELS[u.role]}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {openMenu === u.id && (
                      <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-white/10 rounded-xl overflow-hidden shadow-xl z-10 min-w-[120px]">
                        {ROLES.map((role) => (
                          <button
                            key={role}
                            onClick={() => changeRole(u.id, role)}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-700 ${u.role === role ? "text-fuchsia-400" : "text-zinc-300"}`}
                          >
                            {ROLE_LABELS[role]}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* cerrar menu al click afuera */}
      {openMenu !== null && (
        <div className="fixed inset-0 z-0" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
