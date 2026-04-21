import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Flame, Utensils, Zap } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">¡Hola de nuevo! 👋</h2>
        <p className="text-zinc-400">Este es tu resumen para hoy.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MacroCard title="Calorías" value="2,450" target="2,800" icon={Flame} color="text-orange-500" />
        <MacroCard title="Proteína" value="160g" target="180g" icon={Zap} color="text-blue-500" />
        <MacroCard title="Carbos" value="280g" target="320g" icon={Utensils} color="text-green-500" />
        <MacroCard title="Grasas" value="65g" target="80g" icon={Activity} color="text-yellow-500" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Entrenamiento de Hoy</CardTitle>
            <Badge variant="secondary" className="bg-blue-600 text-white">Leg Day</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">Enfoque: Cuádriceps y Glúteos</p>
              <ul className="space-y-2">
                <li className="flex justify-between text-sm"><span>Sentadilla con barra</span> <span>4 x 8</span></li>
                <li className="flex justify-between text-sm"><span>Prensa 45°</span> <span>3 x 12</span></li>
                <li className="flex justify-between text-sm text-zinc-500">+ 3 ejercicios más...</li>
              </ul>
              <button className="w-full mt-4 bg-white text-black py-2 rounded-lg font-bold hover:bg-zinc-200 transition-colors">
                Empezar Rutina
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Próxima Comida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center">
                <Utensils className="text-zinc-500" />
              </div>
              <div>
                <p className="font-bold">Almuerzo Post-Entreno</p>
                <p className="text-sm text-zinc-400">150g Pollo + 200g Arroz + Brócoli</p>
                <p className="text-xs text-blue-500 mt-1">Sugerido: 13:30 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MacroCard({ title, value, target, icon: Icon, color }: any) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="mt-2">
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-xs text-zinc-500">Objetivo: {target}</p>
        </div>
      </CardContent>
    </Card>
  );
}
