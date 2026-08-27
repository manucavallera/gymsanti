# Productos e inventario

## Objetivo

Convertir la tienda actual en un catálogo administrable de suplementos, vitaminas y dulces proteicos, con imágenes por URL y stock controlado de forma segura.

## Alcance

- Crear, editar y ocultar productos desde un panel para admins.
- Mantener categorías `suplementos`, `vitaminas` y `dulces`.
- Agregar nombre, descripción, precio, URL de imagen, disponibilidad y stock.
- Permitir movimientos de stock de tipo entrada, salida y ajuste.
- Mostrar stock disponible en la tienda.
- Impedir agregar al carrito productos agotados.
- Validar nuevamente el stock en backend al confirmar una compra.
- Descontar stock sólo si la compra se registra correctamente.

## Decisiones

- La primera versión usará URL de imagen; no requiere almacenamiento de archivos ni infraestructura externa.
- El producto conservará una cantidad de stock actual.
- Cada modificación manual generará un movimiento con cantidad, tipo, motivo, usuario y fecha.
- Las compras crearán movimientos de salida asociados al pedido o pago.
- No se borrarán físicamente productos que ya tengan movimientos; se ocultarán mediante `available`.

## Backend

Se ampliará `Product` con `imageUrl` y `stock`, conservando `imageEmoji` como fallback para los productos existentes. Se creará `StockMovement` relacionado con producto y usuario.

Se agregarán endpoints protegidos:

- `GET /products` mantiene catálogo público y devuelve stock visible.
- `GET /products/admin` devuelve todos los productos para admins.
- `POST /products` crea un producto.
- `PUT /products/:id` edita datos del producto.
- `DELETE /products/:id` oculta el producto.
- `GET /products/:id/stock-movements` devuelve historial.
- `POST /products/:id/stock-movements` registra entrada, salida o ajuste.

El checkout deberá verificar todos los productos y cantidades antes de crear el pago. Si algún producto no existe, está oculto o no tiene cantidad suficiente, devolverá un error sin crear el pago ni descontar stock. La actualización de stock y la creación del pago deberán ejecutarse dentro de una transacción.

## Frontend

Se agregará una sección de productos al panel admin con formulario adaptable a móvil y desktop. La tienda mostrará imagen real cuando exista, emoji como fallback, cantidad disponible y estado agotado. Los controles de cantidad respetarán el máximo disponible.

## Criterios de aceptación

- Un admin puede crear y editar productos.
- Un producto oculto no aparece en la tienda pública.
- Una entrada de stock aumenta la cantidad y una salida la reduce.
- Un ajuste establece la cantidad exacta indicada.
- No se permiten cantidades negativas.
- Un usuario no puede crear ni modificar productos o stock.
- No se puede confirmar una compra con stock insuficiente.
- Un checkout válido descuenta todas las unidades compradas una sola vez.
- Los productos existentes siguen visibles usando su emoji si no tienen imagen URL.

## Fuera de alcance

- Subida de archivos.
- Proveedores, costos, depósitos múltiples y alertas automáticas.
- MercadoPago real.
- Reportes avanzados de ventas.
