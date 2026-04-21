import Link from "next/link";
import { Dumbbell, Users, Zap, ShieldCheck, ChevronRight, Lock } from "lucide-react";

const TRAINING_TYPES = [
  {
    title: "Fuerza",
    description: "Programas de powerlifting y levantamiento olímpico para maximizar tu fuerza máxima.",
    icon: "🏋️",
    tags: ["Powerlifting", "Olímpico", "Básicos"],
  },
  {
    title: "Hipertrofia",
    description: "Rutinas orientadas al crecimiento muscular con volumen y técnica controlada.",
    icon: "💪",
    tags: ["Volumen", "Definición", "Tonificación"],
  },
  {
    title: "Funcional",
    description: "Entrenamiento que mejora el rendimiento en actividades cotidianas y deportivas.",
    icon: "⚡",
    tags: ["Cardio", "Movilidad", "Agilidad"],
  },
  {
    title: "Pérdida de peso",
    description: "Combinación de cardio y pesas diseñada para quemar grasa manteniendo músculo.",
    icon: "🔥",
    tags: ["Cardio", "HIIT", "Metabolismo"],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
            G
          </div>
          <span className="text-xl font-bold tracking-tight">GYM CORE</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-zinc-400 hover:text-white transition-colors px-4 py-2 text-sm font-medium"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <span className="inline-block bg-blue-600/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-6 border border-blue-600/30">
          Entrenamiento personalizado
        </span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
          Tu cuerpo,
          <br />
          <span className="text-blue-500">tu método.</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Rutinas diseñadas por coaches, seguimiento de progreso, nutrición y suplementos.
          Todo en un solo lugar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
          >
            Empezar gratis <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            href="#quienes-somos"
            className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-8 py-4 rounded-xl font-bold text-lg transition-colors"
          >
            Conocé más
          </Link>
        </div>
      </section>

      {/* A qué te dedicás */}
      <section className="bg-zinc-900/50 border-y border-zinc-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4">
                <Dumbbell className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Rutinas a medida</h3>
              <p className="text-zinc-400 text-sm">
                Cada rutina es diseñada según tus objetivos, tu nivel y tu disponibilidad horaria.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 bg-green-600/20 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Seguimiento real</h3>
              <p className="text-zinc-400 text-sm">
                Registrá tus pesos, medidas y progreso semana a semana con datos concretos.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-7 h-7 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Coach siempre presente</h3>
              <p className="text-zinc-400 text-sm">
                Protocolos saludables, ajustes de plan y comunicación directa con tu entrenador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quiénes somos */}
      <section id="quienes-somos" className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-3 block">
              Quiénes somos
            </span>
            <h2 className="text-4xl font-black mb-6">
              Entrenadores reales,<br />resultados reales.
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Somos un equipo de coaches certificados con años de experiencia en entrenamiento
              funcional, fuerza e hipertrofia. Creemos que cada persona merece un plan
              construido específicamente para ella, no plantillas genéricas.
            </p>
            <p className="text-zinc-400 leading-relaxed mb-8">
              Nuestra plataforma nació para llevar el seguimiento personalizado que antes
              solo existía en sesiones presenciales, a cualquier lugar y en cualquier momento.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {["J", "M", "S", "R"].map((initial) => (
                  <div
                    key={initial}
                    className="w-10 h-10 rounded-full bg-blue-600 border-2 border-zinc-950 flex items-center justify-center text-sm font-bold"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold text-sm">+4 coaches activos</p>
                <p className="text-zinc-500 text-xs">listos para acompañarte</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "500+", label: "Alumnos activos" },
              { value: "3 años", label: "De experiencia" },
              { value: "98%", label: "Tasa de retención" },
              { value: "24/7", label: "Soporte online" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center"
              >
                <p className="text-3xl font-black text-blue-500 mb-1">{stat.value}</p>
                <p className="text-zinc-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tipos de entrenamiento */}
      <section className="bg-zinc-900/50 border-y border-zinc-800 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-3 block">
              Metodologías
            </span>
            <h2 className="text-4xl font-black mb-4">Tipos de entrenamiento</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Elegí el enfoque que mejor se adapta a tus objetivos. Los planes detallados
              y ejercicios específicos están disponibles una vez que te registrás.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRAINING_TYPES.map((type) => (
              <div
                key={type.title}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-blue-600/50 transition-colors group"
              >
                <div className="text-4xl mb-4">{type.icon}</div>
                <h3 className="text-lg font-bold mb-2">{type.title}</h3>
                <p className="text-zinc-400 text-sm mb-4">{type.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {type.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <Lock className="w-3 h-3" />
                  <span>Ver programa completo</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-colors"
            >
              Acceder a todos los programas <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-6">
          ¿Listo para empezar?
        </h2>
        <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
          Creá tu cuenta gratis y en minutos tenés acceso a tu plan personalizado.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-xl font-bold text-xl transition-colors"
        >
          Crear mi cuenta <ChevronRight className="w-6 h-6" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-bold text-xs">G</div>
            <span className="font-bold text-sm">GYM CORE</span>
          </div>
          <p className="text-zinc-600 text-sm">© 2025 GYM CORE. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2 text-zinc-600 text-sm">
            <Users className="w-4 h-4" />
            <span>Hecho con dedicación</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
