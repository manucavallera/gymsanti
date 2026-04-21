# GYM CORE — Contexto del proyecto

## Qué es
App de gestión de gym/entrenamiento personal. Tiene área pública (landing, tienda) y área privada para alumnos y coaches.

## Stack
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Lucide React
- **Backend:** NestJS 11, TypeORM, better-sqlite3 (SQLite), JWT con Passport
- **Puerto backend:** 3000 | **Puerto frontend:** 3001 (`npm run dev -- -p 3001`)

## Cómo correr el proyecto
```bash
# Terminal 1 — Backend
cd gym-backend
npm install
npm run start:dev

# Terminal 2 — Frontend
cd gym-frontend
npm install
npm run dev -- -p 3001
```

## Estructura del repo
```
Gym app/
├── gym-backend/          # NestJS API
│   └── src/
│       ├── auth/         # JWT login/register, PATCH /auth/profile
│       ├── users/        # Entidad User (id, email, name, password, role)
│       ├── products/     # Tienda — seed automático al iniciar
│       ├── training/     # Tipos → Etapas → Ejercicios → Logs de KG
│       ├── measurements/ # Medidas corporales en CM
│       ├── goals/        # Objetivos del alumno
│       ├── protocols/    # Guías redactadas por el coach
│       └── payments/     # Registro de pagos/cuotas
│
└── gym-frontend/         # Next.js
    └── src/
        ├── app/
        │   ├── page.tsx              # Landing pública
        │   ├── store/page.tsx        # Tienda PÚBLICA (sin auth requerida)
        │   ├── (auth)/login/         # Login
        │   ├── (auth)/register/      # Registro
        │   └── (app)/                # Layout con sidebar — requiere auth
        │       ├── dashboard/        # Resumen macros
        │       ├── routines/         # Tipo → Etapa → Ejercicios → KG
        │       ├── measurements/     # Medidas CM con historial
        │       ├── goals/            # Objetivos con toggle completado
        │       ├── protocols/        # Lectura (todos) / Edición (coach/admin)
        │       ├── payments/         # Cuotas con estados y checkout
        │       ├── profile/          # Editar nombre y contraseña
        │       └── settings/         # Preferencias UI
        ├── lib/
        │   ├── auth.tsx    # AuthContext — useAuth() hook
        │   ├── cart.tsx    # CartContext — useCart() hook
        │   └── api.ts      # authFetch() helper con Bearer token
        ├── components/shared/sidebar.tsx
        └── middleware.ts   # Protege rutas (app) sin cookie token
```

## Base de datos
SQLite — archivo `gym-backend/gymcore.db` (se crea automáticamente).
`synchronize: true` en TypeORM — las tablas se crean/actualizan solas al iniciar.

**Seed automático al primer arranque:**
- 12 productos (suplementos, vitaminas, dulces proteicos)
- 4 tipos de entrenamiento con etapas y ejercicios
- 4 protocolos saludables de ejemplo

## Roles de usuario
- `user` — alumno (default al registrarse)
- `coach` — puede crear/editar/eliminar protocolos
- `admin` — igual que coach

Para cambiar el rol de un usuario hay que hacerlo directo en la DB por ahora (no hay panel admin todavía).

## Auth
- JWT en `localStorage` + cookie (para el middleware de Next.js)
- Token dura 7 días
- Secret: variable de entorno `JWT_SECRET` (default: `gymcore_secret_dev` — cambiar en producción)

## Endpoints principales
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /auth/register | No | Registro |
| POST | /auth/login | No | Login → devuelve JWT |
| GET | /auth/me | Sí | Usuario actual |
| PATCH | /auth/profile | Sí | Cambiar nombre/contraseña |
| GET | /products | No | Lista productos (query: ?category=) |
| GET | /training/types | No | Tipos de entrenamiento |
| GET | /training/types/:id | No | Tipo con etapas y ejercicios |
| POST | /training/log | Sí | Registrar KG de un ejercicio |
| GET/POST | /measurements | Sí | Medidas corporales |
| GET/POST | /goals | Sí | Objetivos |
| PATCH | /goals/:id/toggle | Sí | Marcar objetivo como logrado |
| GET/POST | /protocols | Sí | Protocolos |
| PUT | /protocols/:id | Sí | Editar (coach/admin) |
| GET/POST | /payments | Sí | Pagos/cuotas |
| PATCH | /payments/:id/pay | Sí | Marcar como pagado |

## CORS
El backend tiene CORS configurado para `http://localhost:3001`. Si cambiás el puerto del frontend, actualizá `gym-backend/src/main.ts`.

## Lo que queda por hacer (ideas futuras)
- Panel de administración para coaches (asignar tipo de entrenamiento a alumnos)
- Notificaciones reales
- Integración con MercadoPago para pagos
- Modo claro en settings (actualmente solo placeholder)
- Eliminar cuenta en settings (actualmente solo placeholder)
- Gráficos de progreso en medidas y KG
