# Diseño responsive de GYM CORE

## Objetivo

Hacer que toda la experiencia frontend de GYM CORE sea usable en móviles de distintos tamaños, tablets y desktop, manteniendo la identidad visual negra con acentos fucsia.

El alcance incluye la landing pública, la tienda, autenticación, el área privada de alumnos y el panel de coaches.

## Diagnóstico actual

- La barra lateral siempre ocupa `w-64`, permanece visible y no tiene estado móvil.
- El layout privado usa `p-8` fijo, lo que deja poco espacio útil en pantallas pequeñas.
- No existe overlay, botón de cierre ni cierre automático de navegación.
- La tienda y las pantallas internas necesitan revisión individual de grillas, formularios, tarjetas y posibles desbordes.
- El fondo global usa dos imágenes al 50% del ancho, una composición que puede deformarse o quedar incómoda en móviles.

## Diseño propuesto

### Navegación privada

`AppLayout` será el dueño del estado `mobileMenuOpen`. En tamaños móviles:

- Se mostrará una barra superior compacta con marca y botón hamburguesa.
- `Sidebar` se convertirá en un panel lateral fuera del flujo, con transición de entrada y salida.
- Un overlay cubrirá el contenido cuando el panel esté abierto.
- El menú se cerrará al tocar el overlay, usar el botón de cierre, seleccionar un enlace o cambiar de ruta.
- Se impedirá que el contenido del fondo interfiera con el menú abierto.

En tablet y desktop la sidebar continuará fija como columna lateral, sin cambiar el modelo visual actual.

### Layout y contenido

- El contenedor principal usará espaciado progresivo según breakpoint.
- Se aplicará `min-width: 0` a las áreas flexibles para evitar desbordes inesperados.
- Las grillas utilizarán una progresión de una columna en móvil a dos o más columnas cuando exista espacio real.
- Los botones y controles táctiles tendrán tamaños cómodos para interacción con dedo.
- Los formularios ocuparán el ancho disponible en móvil y conservarán agrupación en desktop.
- Las tablas se adaptarán a tarjetas o a desplazamiento horizontal encapsulado, según el contenido.
- Los textos largos, nombres y correos se truncarán o envolverán sin romper el layout.

### Pantallas públicas

- Landing: adaptar hero, llamados a la acción, imágenes y secciones apiladas.
- Tienda: revisar grilla de productos, tarjetas, filtros, carrito y checkout para evitar overflow.
- Login y registro: formularios centrados, legibles y utilizables en alturas pequeñas.

### Pantallas privadas

Se revisarán dashboard, rutinas, nutrición, mediciones, objetivos, protocolos, pagos, perfil, configuración y vistas de coach. Se conservarán las funcionalidades actuales y se ajustará únicamente la presentación y la interacción responsive, salvo correcciones pequeñas necesarias para que un control sea usable.

### Tema visual

- Mantener fondo negro, superficies zinc oscuras, texto blanco/gris y fucsia como acento.
- Mejorar contraste de texto secundario, bordes y estados hover/focus donde sea necesario.
- Usar fondo global que se comporte correctamente en anchos angostos y no dependa de una división rígida en mitades.

## Criterios de aceptación

- No hay scroll horizontal accidental en ninguna ruta principal.
- La sidebar funciona como menú desplegable en móvil y como sidebar fija en desktop.
- El menú se cierra mediante overlay, botón, selección de ruta y cambio de pathname.
- Landing, tienda, login, registro y área privada son utilizables aproximadamente desde 320 px de ancho.
- Formularios, botones, tarjetas y navegación se pueden usar con touch.
- Las vistas de desktop no pierden la jerarquía ni el espacio visual actual.
- Se verifican al menos los anchos 320, 375, 430, 768 y 1280 px.

## Verificación

- Ejecutar lint y build del frontend.
- Revisar visualmente las rutas principales en los breakpoints definidos.
- Comprobar navegación móvil, cierre de sidebar y ausencia de overflow.
- Confirmar que no se modifican contratos del backend ni datos existentes.

## Fuera de alcance

- Rediseño completo de marca o cambio del tema negro.
- Nuevas entidades, endpoints o cambios de negocio.
- Edición de protocolos, inventario, suplementos, vitaminas o stock.
- Corrección funcional del botón “Agregar”, que será el siguiente bloque después de estabilizar responsive.
