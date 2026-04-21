"use client";
import { useState } from "react";
import { Bell, Moon, Globe, Shield, LogOut, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-zinc-700"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { logout } = useAuth();
  const [notifEntrenamiento, setNotifEntrenamiento] = useState(true);
  const [notifPagos, setNotifPagos] = useState(true);
  const [notifProtocolos, setNotifProtocolos] = useState(false);
  const [idioma, setIdioma] = useState("es");
  const [unidadPeso, setUnidadPeso] = useState("kg");

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Configuración</h2>
        <p className="text-zinc-400 mt-1">Preferencias de tu cuenta</p>
      </div>

      {/* Notificaciones */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-4 h-4 text-blue-500" /> Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            { label: "Recordatorio de entrenamiento", sub: "Recibí un aviso cuando tenés sesión programada", value: notifEntrenamiento, set: setNotifEntrenamiento },
            { label: "Vencimiento de pagos", sub: "Avisame cuando se acerca la fecha de pago", value: notifPagos, set: setNotifPagos },
            { label: "Nuevos protocolos", sub: "Notificame cuando el coach publique un protocolo nuevo", value: notifProtocolos, set: setNotifProtocolos },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{item.sub}</p>
              </div>
              <Toggle checked={item.value} onChange={item.set} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Preferencias */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="w-4 h-4 text-blue-500" /> Preferencias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Idioma</p>
              <p className="text-zinc-500 text-xs mt-0.5">Idioma de la interfaz</p>
            </div>
            <select value={idioma} onChange={(e) => setIdioma(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Unidad de peso</p>
              <p className="text-zinc-500 text-xs mt-0.5">Para registros de ejercicios</p>
            </div>
            <select value={unidadPeso} onChange={(e) => setUnidadPeso(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="kg">Kilogramos (kg)</option>
              <option value="lb">Libras (lb)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Tema</p>
              <p className="text-zinc-500 text-xs mt-0.5">Apariencia de la app</p>
            </div>
            <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg p-1">
              <button className="flex items-center gap-1.5 bg-zinc-700 text-white text-xs px-3 py-1.5 rounded-md font-medium">
                <Moon className="w-3 h-3" /> Oscuro
              </button>
              <button className="text-zinc-500 text-xs px-3 py-1.5 rounded-md font-medium hover:text-white transition-colors">
                Claro
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacidad */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-4 h-4 text-blue-500" /> Privacidad y seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-zinc-500 text-sm">
            Tus datos están protegidos y nunca son compartidos con terceros. Los registros de entrenamiento, medidas y pagos son estrictamente privados.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button onClick={logout}
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-400/5 border border-zinc-800 hover:border-red-400/20 transition-colors">
              <LogOut className="w-4 h-4" />
              <div>
                <p className="font-medium text-sm">Cerrar sesión</p>
                <p className="text-xs opacity-60">Salir de esta cuenta</p>
              </div>
            </button>
            <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-zinc-600 hover:text-red-500 hover:bg-red-500/5 border border-zinc-800 hover:border-red-500/20 transition-colors">
              <Trash2 className="w-4 h-4" />
              <div>
                <p className="font-medium text-sm">Eliminar cuenta</p>
                <p className="text-xs opacity-60">Esta acción es irreversible</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
