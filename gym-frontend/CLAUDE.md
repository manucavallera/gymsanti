# Reglas de comportamiento

- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.

---

# Frontend — GYM CORE

**Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Lucide React, recharts

**Puerto**: 3001 — `npm run dev -- -p 3001`

## Estructura clave

```
src/
├── app/
│   ├── page.tsx                  # Landing publica
│   ├── store/page.tsx            # Tienda publica
│   ├── (auth)/login|register/    # Auth
│   └── (app)/                    # Layout con sidebar — requiere auth
│       ├── dashboard/
│       ├── routines/             # Rutina del alumno + logs KG
│       ├── nutrition/            # Plan alimenticio del alumno
│       ├── measurements/         # Medidas CM con historial
│       ├── goals/
│       ├── protocols/
│       ├── payments/
│       ├── profile/
│       ├── settings/
│       └── coach/students/       # Panel coach
│           └── [id]/             # Hub alumno → /routine | /nutrition
├── lib/
│   ├── auth.tsx    # AuthContext + useAuth()
│   ├── cart.tsx    # CartContext + useCart()
│   └── api.ts      # authFetch() con Bearer token
└── components/shared/sidebar.tsx
```

## Auth

JWT en `localStorage` + cookie. `useAuth()` expone `{ user, logout }`. Rutas en `(app)/` protegidas por `middleware.ts`.

## Convenciones

- `authFetch(path, options)` para todos los llamados al backend (agrega Bearer automatico)
- Backend en `http://localhost:3000`
- Tailwind v4 — no usar `@apply`, clases inline
- Framer Motion para animaciones de entrada
