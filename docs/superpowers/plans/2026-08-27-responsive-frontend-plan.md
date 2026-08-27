# Responsive Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir todo el frontend de GYM CORE en una experiencia usable desde 320 px hasta desktop, con navegación móvil funcional y sin overflow accidental.

**Architecture:** `AppLayout` será dueño del estado del menú móvil y pasará props controladas a `Sidebar`. La presentación responsive se resolverá con breakpoints Tailwind existentes, componentes compartidos y ajustes localizados por pantalla, sin modificar contratos del backend.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Lucide React, ESLint.

**Spec:** `docs/superpowers/specs/2026-08-27-responsive-frontend-design.md`

## Global Constraints

- Mantener fondo negro, superficies oscuras, texto blanco/gris y fucsia como acento.
- Soportar aproximadamente 320, 375, 430, 768 y 1280 px.
- Mantener las funcionalidades y contratos de API actuales.
- No agregar dependencias para resolver responsive.
- Los controles móviles deben ser cómodos para touch.
- No incluir todavía protocolos flexibles, inventario, suplementos, vitaminas, stock ni la corrección funcional del botón “Agregar”.

### Task 1: Navegación móvil controlada

**Files:**
- Modify: `gym-frontend/src/app/(app)/layout.tsx`
- Modify: `gym-frontend/src/components/shared/sidebar.tsx`

**Interfaces:**
- `AppLayout` produce `mobileMenuOpen`, `openMobileMenu()` y `closeMobileMenu()` para la navegación.
- `Sidebar` consume `{ isOpen: boolean; onClose: () => void }` y conserva la selección de enlaces y logout actuales.

- [ ] **Step 1: Implementar estado y apertura móvil en `AppLayout`**

Agregar estado local, botón superior visible sólo debajo de `md`, y pasar el estado/callbacks a `Sidebar`. El botón debe tener `aria-label="Abrir menú"` y el layout debe conservar el guard de autenticación existente.

- [ ] **Step 2: Convertir `Sidebar` en navegación responsive**

Mantenerla estática desde `md` en adelante. Debajo de `md`, usar posicionamiento fijo, ancho limitado a `min(18rem, 86vw)`, transición basada en `translate-x`, `z-index` superior y botón de cierre con `aria-label="Cerrar menú"`.

- [ ] **Step 3: Agregar overlay y cierre por interacción**

Renderizar un overlay sólo cuando `isOpen`, cerrar al hacer click en él y cerrar también desde cada `NavLink`, perfil, configuración y logout. Usar `aria-hidden` en el overlay y evitar que el contenido de fondo reciba interacción mientras el menú está abierto.

- [ ] **Step 4: Cerrar al cambiar de ruta y validar compilación**

Usar `useEffect` con `pathname` para llamar `onClose` cuando cambia la ruta. Ejecutar:

```bash
cd gym-frontend
npm run lint
```

Expected: lint termina sin errores.

- [ ] **Step 5: Commit**

```bash
git add gym-frontend/src/app/\(app\)/layout.tsx gym-frontend/src/components/shared/sidebar.tsx
git commit -m "feat: add responsive mobile navigation"
```

### Task 2: Base responsive global

**Files:**
- Modify: `gym-frontend/src/app/(app)/layout.tsx`
- Modify: `gym-frontend/src/app/layout.tsx`
- Modify: `gym-frontend/src/app/globals.css`

**Interfaces:**
- El layout compartido entrega un área principal con `min-width: 0`, padding progresivo y altura mínima de viewport.
- El layout raíz conserva `AuthProvider` y `CartProvider`, pero el fondo se adapta a viewport angosto.

- [ ] **Step 1: Ajustar el contenedor principal**

Reemplazar el padding fijo `p-8` por clases progresivas equivalentes a `p-4 sm:p-6 lg:p-8`, agregar `min-w-0` y conservar el scroll vertical del contenido.

- [ ] **Step 2: Hacer adaptable el fondo global**

Cambiar la composición rígida de dos fondos al 50% por una presentación que no fuerce dos mitades en móvil; conservar el efecto oscuro y evitar que la imagen genere overflow o deformación.

- [ ] **Step 3: Añadir reglas base de overflow y focus**

Agregar sólo reglas globales necesarias para `box-sizing`, overflow horizontal del documento y foco visible, sin reemplazar estilos de componentes ni introducir un reset amplio.

- [ ] **Step 4: Verificar lint y build**

```bash
cd gym-frontend
npm run lint
npm run build
```

Expected: ambos comandos terminan correctamente.

- [ ] **Step 5: Commit**

```bash
git add gym-frontend/src/app/\(app\)/layout.tsx gym-frontend/src/app/layout.tsx gym-frontend/src/app/globals.css
git commit -m "style: establish responsive layout base"
```

### Task 3: Pantallas públicas y autenticación

**Files:**
- Modify: `gym-frontend/src/app/page.tsx`
- Modify: `gym-frontend/src/app/store/page.tsx`
- Modify: `gym-frontend/src/app/(auth)/login/page.tsx`
- Modify: `gym-frontend/src/app/(auth)/register/page.tsx`

**Interfaces:**
- Las páginas siguen consumiendo los mismos contextos y endpoints.
- Las grillas, formularios y secciones públicas se adaptan sin cambiar su comportamiento.

- [ ] **Step 1: Auditar cada pantalla en 320 px**

Identificar `min-width`, anchos fijos, grids no colapsables, imágenes, títulos y formularios que excedan el viewport. Registrar los selectores concretos antes de editar.

- [ ] **Step 2: Ajustar landing y autenticación**

Apilar hero y secciones en móvil, reducir paddings y tamaños tipográficos por breakpoint, y hacer que login/registro usen ancho disponible con márgenes seguros.

- [ ] **Step 3: Ajustar tienda y carrito**

Hacer que la grilla tenga una columna en móvil, que las tarjetas no corten contenido y que carrito/filtros puedan abrirse y cerrarse sin superar el ancho de pantalla.

- [ ] **Step 4: Verificar lint y build**

```bash
cd gym-frontend
npm run lint
npm run build
```

Expected: ambos comandos terminan correctamente.

- [ ] **Step 5: Commit**

```bash
git add gym-frontend/src/app/page.tsx gym-frontend/src/app/store/page.tsx gym-frontend/src/app/\(auth\)/login/page.tsx gym-frontend/src/app/\(auth\)/register/page.tsx
git commit -m "style: make public pages responsive"
```

### Task 4: Área privada de alumnos y coaches

**Files:**
- Modify: `gym-frontend/src/app/(app)/dashboard/page.tsx`
- Modify: `gym-frontend/src/app/(app)/routines/page.tsx`
- Modify: `gym-frontend/src/app/(app)/nutrition/page.tsx`
- Modify: `gym-frontend/src/app/(app)/measurements/page.tsx`
- Modify: `gym-frontend/src/app/(app)/goals/page.tsx`
- Modify: `gym-frontend/src/app/(app)/protocols/page.tsx`
- Modify: `gym-frontend/src/app/(app)/payments/page.tsx`
- Modify: `gym-frontend/src/app/(app)/profile/page.tsx`
- Modify: `gym-frontend/src/app/(app)/settings/page.tsx`
- Modify: `gym-frontend/src/app/(app)/coach/admin/page.tsx`
- Modify: `gym-frontend/src/app/(app)/coach/students/page.tsx`
- Modify: `gym-frontend/src/app/(app)/coach/students/[id]/page.tsx`
- Modify: `gym-frontend/src/app/(app)/coach/students/[id]/routine/page.tsx`
- Modify: `gym-frontend/src/app/(app)/coach/students/[id]/nutrition/page.tsx`

**Interfaces:**
- Se conservan hooks, estados, endpoints y modelos actuales.
- Cada pantalla mantiene su flujo actual, cambiando sólo layout, wrapping, tamaños y presentación de datos para viewport reducido.

- [ ] **Step 1: Auditar pantallas con grids, formularios y listas**

Revisar cada archivo buscando `grid-cols`, `flex-row`, `whitespace-nowrap`, `w-*` fijos, tablas y formularios. Priorizar dashboard, rutinas, nutrición y las vistas de coach por densidad de contenido.

- [ ] **Step 2: Adaptar dashboard, rutinas y nutrición**

Usar apilado móvil para métricas, ejercicios y comidas; preservar acciones primarias visibles y evitar que nombres o macros rompan tarjetas.

- [ ] **Step 3: Adaptar mediciones, objetivos, protocolos, pagos, perfil y settings**

Hacer formularios de ancho completo en móvil, convertir listas densas a bloques legibles y encapsular cualquier tabla o fila ancha.

- [ ] **Step 4: Adaptar panel de coach y detalle de alumnos**

Apilar controles de gestión, tarjetas y formularios; asegurar que las rutas anidadas mantengan navegación accesible y que acciones importantes no queden fuera del viewport.

- [ ] **Step 5: Verificar lint y build**

```bash
cd gym-frontend
npm run lint
npm run build
```

Expected: ambos comandos terminan correctamente.

- [ ] **Step 6: Commit**

```bash
git add gym-frontend/src/app/\(app\)
git commit -m "style: adapt private screens to mobile"
```

### Task 5: Verificación visual responsive

**Files:**
- No se crean archivos de producción.

**Interfaces:**
- Verifica todas las rutas sin modificar contratos de aplicación.

- [ ] **Step 1: Ejecutar validaciones estáticas finales**

```bash
cd gym-frontend
npm run lint
npm run build
```

Expected: lint y build pasan.

- [ ] **Step 2: Revisar rutas en los breakpoints definidos**

Con el frontend ejecutándose, revisar landing, tienda, login, registro, dashboard, rutinas, nutrición, mediciones, objetivos, protocolos, pagos, perfil, settings y panel coach en 320, 375, 430, 768 y 1280 px.

- [ ] **Step 3: Validar navegación móvil**

Comprobar apertura, cierre por overlay, botón, selección de enlace y cambio de pathname; confirmar que no se puede interactuar accidentalmente con el contenido detrás.

- [ ] **Step 4: Revisar overflow y touch**

Confirmar que no aparece scroll horizontal accidental, que textos largos se envuelven y que botones y enlaces son cómodos para touch.

- [ ] **Step 5: Revisar diff final**

```bash
git diff --check
git status --short
```

Expected: sin errores de whitespace; sólo aparecen cambios intencionales y archivos locales preexistentes permanecen sin tocar.
