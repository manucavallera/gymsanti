# Reglas de comportamiento

- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.

---

# GYM CORE — Contexto del proyecto

## Que es
App de gestion de gym/entrenamiento personal. Area publica (landing, tienda) y area privada para alumnos y coaches.

## Stack
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Lucide React, recharts
- **Backend:** NestJS 11, TypeORM, better-sqlite3 (SQLite), JWT con Passport
- **Puerto backend:** 3000 | **Puerto frontend:** 3001 (`npm run dev -- -p 3001`)

## Correr el proyecto
```bash
# Terminal 1 — Backend
cd gym-backend && npm install && npm run start:dev

# Terminal 2 — Frontend
cd gym-frontend && npm install && npm run dev -- -p 3001
```

## Estructura

```
gymsanti/
├── gym-backend/src/
│   ├── auth/         # login, register, profile, DELETE account
│   ├── users/        # User entity (id, email, name, password, role, coachId)
│   ├── products/     # Tienda — seed automatico
│   ├── training/     # Tipos → Etapas → Ejercicios → Logs (legacy)
│   ├── routines/     # Rutinas coach → alumno (dias + ejercicios + logs KG)
│   ├── nutrition/    # Planes alimenticios coach → alumno (dias + comidas + macros)
│   ├── coach/        # Asignar/quitar alumnos, ver estudiantes
│   ├── measurements/ # Medidas corporales en CM
│   ├── goals/        # Objetivos con toggle
│   ├── protocols/    # Guias escritas por coach
│   └── payments/     # Cuotas con estado y pago
│
└── gym-frontend/src/
    ├── app/
    │   ├── page.tsx              # Landing publica
    │   ├── store/page.tsx        # Tienda publica (sin auth)
    │   ├── (auth)/login|register/
    │   └── (app)/                # Sidebar — requiere auth
    │       ├── dashboard/
    │       ├── routines/         # Rutina del alumno + log KG
    │       ├── nutrition/        # Plan alimenticio del alumno
    │       ├── measurements/     # Medidas CM + historial
    │       ├── goals/
    │       ├── protocols/
    │       ├── payments/
    │       ├── profile/
    │       ├── settings/         # Incluye eliminar cuenta real
    │       └── coach/students/   # Panel coach
    │           └── [id]/         # Hub alumno → /routine | /nutrition
    ├── lib/auth.tsx              # AuthContext + useAuth()
    ├── lib/cart.tsx              # CartContext + useCart()
    ├── lib/api.ts                # authFetch() con Bearer token
    └── middleware.ts             # Protege rutas (app)
```

## DB
SQLite — `gym-backend/gymcore.db` (se crea solo). `synchronize: true`.

Seed automatico al primer arranque: 12 productos, 4 tipos de entrenamiento, 4 protocolos.

## Roles
- `user` — alumno (default al registrarse)
- `coach` / `admin` — puede crear rutinas, planes nutricionales, editar protocolos

Cambiar rol: directo en DB (no hay panel admin todavia).

## Auth
JWT en `localStorage` + cookie. Token 7 dias. Secret: `JWT_SECRET` (default: `gymcore_secret_dev`).

## Endpoints principales

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| POST | /auth/register | No | Registro |
| POST | /auth/login | No | Login → JWT |
| GET | /auth/me | Si | Usuario actual |
| PATCH | /auth/profile | Si | Cambiar nombre/password |
| DELETE | /auth/account | Si | Eliminar cuenta |
| GET | /products | No | Lista productos (?category=) |
| GET | /routines/my | Si | Rutina activa del alumno |
| POST | /routines/exercises/:id/log | Si | Log KG ejercicio |
| GET | /routines/exercises/:id/logs | Si | Historial logs (ultimos 20) |
| GET | /routines/coach/students/:id/all | Si (coach) | Rutinas de un alumno |
| POST | /routines/coach/students/:id | Si (coach) | Crear rutina |
| GET | /nutrition/my | Si | Plan nutricional del alumno |
| POST | /nutrition/coach/students/:id | Si (coach) | Crear plan |
| GET | /coach/students | Si (coach) | Mis alumnos |
| POST | /coach/students/:id/assign | Si (coach) | Asignar alumno |
| DELETE | /coach/students/:id | Si (coach) | Quitar alumno |
| GET | /measurements | Si | Todas las medidas (con date) |
| GET | /measurements/latest | Si | Ultima medida |
| POST | /measurements | Si | Nueva medida |
| GET/POST | /goals | Si | Objetivos |
| PATCH | /goals/:id/toggle | Si | Toggle completado |
| GET/POST | /protocols | Si | Protocolos |
| PUT | /protocols/:id | Si (coach) | Editar |
| GET/POST | /payments | Si | Pagos/cuotas |
| PATCH | /payments/:id/pay | Si | Marcar pagado |

## CORS
Configurado para `http://localhost:3001`. Si cambia puerto, actualizar `gym-backend/src/main.ts`.

## Pendiente
- Graficos de progreso en medidas y KG (recharts instalado, pendiente implementacion)
- Modo claro en settings (placeholder)
- Panel admin para cambiar roles
- Notificaciones reales
- MercadoPago
