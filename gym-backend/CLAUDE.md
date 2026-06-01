# Reglas de comportamiento

- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.

---

# Backend — GYM CORE

**Stack**: NestJS 11, TypeORM, better-sqlite3, JWT + Passport

**Puerto**: 3000 — `npm run start:dev`

**DB**: `gymcore.db` (SQLite, `synchronize: true` — tablas se crean solas)

## Modulos

| Modulo | Ruta base | Descripcion |
|--------|-----------|-------------|
| auth | /auth | register, login, me, profile, DELETE account |
| users | — | servicio interno |
| products | /products | tienda, seed automatico |
| training | /training | tipos → etapas → ejercicios → logs (legacy) |
| routines | /routines | rutinas coach → alumno + logs KG |
| nutrition | /nutrition | planes alimenticios coach → alumno |
| coach | /coach | asignar/quitar alumnos |
| measurements | /measurements | medidas corporales en CM |
| goals | /goals | objetivos con toggle |
| protocols | /protocols | guias escritas por coach |
| payments | /payments | cuotas con estado y pago |

## Roles

- `user` — alumno (default)
- `coach` — puede crear/editar protocolos, rutinas, planes nutricionales
- `admin` — igual que coach

## Convenciones

- Guards: `@UseGuards(JwtAuthGuard)` — `req.user` tiene `{ id, email, role }`
- Coach check: `if (req.user.role !== 'coach' && req.user.role !== 'admin') throw new ForbiddenException()`
- CORS configurado para `http://localhost:3001`
- Seed en `products.service.ts` y `training.service.ts` al arrancar si DB vacia
