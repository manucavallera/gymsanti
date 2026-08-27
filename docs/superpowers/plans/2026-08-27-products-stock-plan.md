# Products and Stock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar catálogo administrable, imágenes por URL y stock seguro para suplementos, vitaminas y dulces proteicos.

**Architecture:** `Product` conservará compatibilidad con productos existentes y tendrá `imageUrl` y `stock`. `StockMovement` registrará cada cambio manual o de compra. El checkout validará y descontará stock dentro de una transacción antes de crear el pago.

**Tech Stack:** NestJS 11, TypeORM, SQLite/better-sqlite3, Next.js 16, React 19, TypeScript, Tailwind CSS v4.

**Spec:** `docs/superpowers/specs/2026-08-27-products-stock-design.md`

## Global Constraints

- La primera versión usará URL de imagen; no requiere almacenamiento de archivos ni infraestructura externa.
- Mantener `imageEmoji` como fallback para productos existentes.
- No permitir stock negativo.
- Sólo admins pueden administrar productos y movimientos.
- Un checkout inválido no debe crear pagos ni modificar stock.
- No borrar físicamente productos con historial; ocultarlos mediante `available`.
- Mantener categorías `suplementos`, `vitaminas` y `dulces`.

### Task 1: Modelo de producto y movimientos

**Files:**
- Modify: `gym-backend/src/products/product.entity.ts`
- Create: `gym-backend/src/products/stock-movement.entity.ts`
- Modify: `gym-backend/src/app.module.ts`

**Interfaces:**
- `Product` produce `imageUrl?: string`, `stock: number` y `available: boolean`.
- `StockMovement` consume producto y usuario, y produce `type`, `quantity`, `reason` y `createdAt`.

- [ ] **Step 1: Agregar campos compatibles a `Product`**

Agregar `imageUrl` nullable y `stock` con default `0`. Conservar `imageEmoji`, `available` y todos los campos actuales para que SQLite pueda sincronizar registros existentes.

- [ ] **Step 2: Crear `StockMovement`**

Definir entidad con `id`, `type` (`entrada | salida | ajuste`), `quantity`, `reason`, `productId`, `userId` y `createdAt`. Para `ajuste`, `quantity` representa el stock final; para entrada/salida representa unidades a sumar/restar.

- [ ] **Step 3: Registrar entidad en `AppModule`**

Incluir `StockMovement` en la lista de entidades TypeORM.

- [ ] **Step 4: Verificar compilación backend**

```bash
cd gym-backend
npm run build
```

Expected: NestJS compila sin errores.

### Task 2: API administrativa de productos y stock

**Files:**
- Modify: `gym-backend/src/products/products.module.ts`
- Modify: `gym-backend/src/products/products.service.ts`
- Modify: `gym-backend/src/products/products.controller.ts`

**Interfaces:**
- `GET /products/admin` devuelve productos disponibles y ocultos sólo a admins.
- `POST /products`, `PUT /products/:id` y `DELETE /products/:id` administran catálogo.
- `GET /products/:id/stock-movements` devuelve historial.
- `POST /products/:id/stock-movements` recibe `{ type, quantity, reason }`.

- [ ] **Step 1: Registrar repositorios y autorización**

Agregar `Product` y `StockMovement` a `TypeOrmModule.forFeature`. Proteger endpoints administrativos con `JwtAuthGuard` y rechazar cualquier rol diferente de `admin` con `ForbiddenException`.

- [ ] **Step 2: Implementar CRUD de productos**

Validar nombre no vacío, precio no negativo, categoría válida y stock no negativo. Crear y editar deben aceptar `imageUrl`; borrar debe establecer `available: false`.

- [ ] **Step 3: Implementar movimientos**

Para entrada sumar cantidad; para salida exigir stock suficiente y restar; para ajuste establecer cantidad exacta. Rechazar cantidades no positivas para entrada/salida y valores negativos para ajuste. Guardar un movimiento por operación.

- [ ] **Step 4: Mantener catálogo público**

Hacer que `GET /products` devuelva sólo `available: true`, ordenado por categoría, incluyendo `stock` e `imageUrl`.

- [ ] **Step 5: Verificar compilación backend**

```bash
cd gym-backend
npm run build
```

Expected: compilación exitosa.

### Task 3: Checkout con stock transaccional

**Files:**
- Modify: `gym-backend/src/payments/payments.module.ts`
- Modify: `gym-backend/src/payments/payments.service.ts`
- Modify: `gym-backend/src/payments/payments.controller.ts`
- Modify: `gym-frontend/src/app/store/page.tsx`

**Interfaces:**
- El checkout recibe `items: [{ productId: number, quantity: number }]` junto con el payload actual.
- El endpoint devuelve error 400/409 si el carrito es inválido o el stock es insuficiente.

- [ ] **Step 1: Incluir repositorios y validar payload**

Hacer disponibles `Product` y `StockMovement` dentro de PaymentsModule/PaymentsService. Rechazar lista vacía, IDs repetidos, cantidades no enteras o menores que uno, productos ocultos/inexistentes y stock insuficiente.

- [ ] **Step 2: Ejecutar descuento y pago en transacción**

Dentro de `DataSource.transaction`, releer los productos, volver a validar stock, descontar cantidades, crear movimientos de salida con motivo de compra y guardar el pago. Si falla cualquier operación, hacer rollback completo.

- [ ] **Step 3: Actualizar frontend**

Enviar `items.map(({ id, quantity }) => ({ productId: id, quantity }))` junto con el payload actual. Mostrar mensaje legible y conservar el carrito si la compra falla.

- [ ] **Step 4: Verificar compilación**

```bash
cd gym-backend
npm run build
cd ../gym-frontend
npx tsc --noEmit
```

Expected: ambos comandos terminan sin errores.

### Task 4: Panel admin de productos

**Files:**
- Create: `gym-frontend/src/app/(app)/coach/products/page.tsx`
- Modify: `gym-frontend/src/components/shared/sidebar.tsx`

**Interfaces:**
- La pantalla consume `/products/admin`, `/products`, `/products/:id` y `/products/:id/stock-movements`.
- Sólo el rol admin accede al enlace y la página redirige a dashboard para otros roles.

- [ ] **Step 1: Agregar navegación admin**

Añadir “Productos” al menú admin y conservarlo oculto para coaches y alumnos.

- [ ] **Step 2: Crear listado y formulario responsive**

Mostrar productos activos/ocultos, búsqueda, categoría, precio, stock e imagen. Permitir crear y editar nombre, descripción, precio, categoría, imageUrl y available.

- [ ] **Step 3: Crear controles de stock**

Agregar formulario de entrada, salida y ajuste con cantidad y motivo; después de guardar, recargar producto e historial y mostrar stock actualizado.

- [ ] **Step 4: Agregar estados de carga y error**

Deshabilitar botones mientras se guarda, mostrar errores del backend y evitar doble envío.

- [ ] **Step 5: Verificar TypeScript**

```bash
cd gym-frontend
npx tsc --noEmit
```

Expected: sin errores de TypeScript.

### Task 5: Tienda con imagen y stock

**Files:**
- Modify: `gym-frontend/src/app/store/page.tsx`
- Modify: `gym-frontend/src/lib/cart.tsx`

**Interfaces:**
- `Product` consume `imageUrl`, `imageEmoji`, `stock` y `available`.
- El carrito no supera el stock disponible.

- [ ] **Step 1: Mostrar imágenes y disponibilidad**

Renderizar `imageUrl` cuando exista y usar emoji como fallback. Mostrar unidades disponibles, estado agotado y deshabilitar agregar cuando `stock === 0`.

- [ ] **Step 2: Limitar cantidades del carrito**

Evitar que el botón `+` supere el stock recibido y mostrar un mensaje si el carrito contiene una cantidad que ya no está disponible.

- [ ] **Step 3: Verificar TypeScript y diff**

```bash
cd gym-frontend
npx tsc --noEmit
git diff --check
```

Expected: TypeScript pasa y no hay errores de whitespace.

### Task 6: Verificación integral

- [ ] **Step 1: Ejecutar builds**

```bash
cd gym-backend
npm run build
cd ../gym-frontend
npx tsc --noEmit
```

- [ ] **Step 2: Verificar autorización, stock y checkout**

Comprobar 403 para roles no admin, entradas, salidas, ajustes, stock insuficiente, producto oculto, carrito vacío y compra válida. Confirmar que los casos inválidos no cambian stock, historial ni pagos.

- [ ] **Step 3: Revisar responsive**

Revisar panel admin y tienda en 320, 375, 430, 768 y 1280 px.

- [ ] **Step 4: Revisar diff final**

```bash
git diff --check
git status --short
```

Expected: sin errores de whitespace y sólo cambios intencionales, manteniendo archivos locales preexistentes sin tocar.
