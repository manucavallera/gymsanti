"use client";
import { useState } from "react";
import { User, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { authFetch } from "@/lib/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await authFetch("/auth/profile", { method: "PATCH", body: JSON.stringify({ name }) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      setProfileMsg({ type: "ok", text: "Nombre actualizado correctamente" });
    } catch (e: any) {
      setProfileMsg({ type: "err", text: e.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: "err", text: "Las contraseñas no coinciden" });
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg({ type: "err", text: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }
    setSavingPass(true);
    setPassMsg(null);
    try {
      const res = await authFetch("/auth/profile", { method: "PATCH", body: JSON.stringify({ currentPassword, newPassword }) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      setPassMsg({ type: "ok", text: "Contraseña actualizada correctamente" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e: any) {
      setPassMsg({ type: "err", text: e.message });
    } finally {
      setSavingPass(false);
    }
  };

  const ROLE_LABELS: Record<string, string> = { user: "Alumno", coach: "Coach", admin: "Admin" };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Mi Perfil</h2>
        <p className="text-zinc-400 mt-1">Gestioná tu información personal</p>
      </div>

      {/* Avatar + info */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-fuchsia-600 flex items-center justify-center text-3xl font-black">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-2xl font-bold">{user?.name}</h3>
          <p className="text-zinc-400">{user?.email}</p>
          <span className="inline-block mt-1 text-xs bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-600/30 px-2 py-0.5 rounded-full">
            {ROLE_LABELS[user?.role || "user"]}
          </span>
        </div>
      </div>

      {/* Editar nombre */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-fuchsia-500" /> Información personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1.5 block">Email</label>
            <input value={user?.email || ""} disabled
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1.5 block">Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500 transition-colors" />
          </div>
          {profileMsg && (
            <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${profileMsg.type === "ok" ? "bg-green-600/10 text-green-400 border border-green-600/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {profileMsg.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {profileMsg.text}
            </div>
          )}
          <button onClick={saveProfile} disabled={savingProfile || name === user?.name}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
            {savingProfile ? "Guardando..." : "Guardar cambios"}
          </button>
        </CardContent>
      </Card>

      {/* Cambiar contraseña */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="w-4 h-4 text-fuchsia-500" /> Cambiar contraseña
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Contraseña actual", value: currentPassword, setter: setCurrentPassword },
            { label: "Nueva contraseña", value: newPassword, setter: setNewPassword },
            { label: "Confirmar nueva contraseña", value: confirmPassword, setter: setConfirmPassword },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-sm text-zinc-400 mb-1.5 block">{f.label}</label>
              <input type="password" value={f.value} onChange={(e) => f.setter(e.target.value)} placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500 transition-colors" />
            </div>
          ))}
          {passMsg && (
            <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${passMsg.type === "ok" ? "bg-green-600/10 text-green-400 border border-green-600/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {passMsg.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {passMsg.text}
            </div>
          )}
          <button onClick={savePassword} disabled={savingPass || !currentPassword || !newPassword || !confirmPassword}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
            {savingPass ? "Actualizando..." : "Cambiar contraseña"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

