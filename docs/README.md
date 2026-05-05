# Neon Docs

Fecha de actualizacion: 2026-05-05

Esta carpeta guarda la documentacion puntual de `frontend-neon`.

## Regla actual

- la estructura general del SaaS vive en `backend/docs`
- el comportamiento real del frontend `neon` se documenta aca

## Estado actual

`neon` ya tiene un slice funcional real, publicado y usable para demo operativa.

Bloques cerrados hasta hoy:

- login simplificado con acceso directo por boton
- home por tarjetas principales
- flujo base `Actividades -> Gastos -> Ingresos -> Movimientos`
- gastos simples asociados a actividad
- pagos parciales asociados a actividad
- resumenes navegables entre bloques

## Lo que hoy existe en produccion

- frontend publicado
- auth SaaS real
- login reducido a un solo boton `Iniciar`
- ruta protegida
- 4 tarjetas principales:
  - `Actividades`
  - `Ingresos`
  - `Gastos`
  - `Movimientos`
- al entrar, las tarjetas aparecen compactas y sin contenido desplegado
- cada tarjeta despliega su modulo completo al hacer click

## Flujo actual de interfaz

### 1. Actividades

Permite:

- agregar cliente
- crear actividad
- ver resumen de actividades pendientes

Comportamiento:

- los nombres de cliente se normalizan en mayuscula por palabra
- los resumenes muestran hasta 3 items por defecto
- si una actividad tiene gastos, la tarjeta muestra hasta 2 etiquetas y luego `...`
- click en un resumen de actividad lleva a `Gastos`

### 2. Gastos

Permite:

- cargar gasto simple para la actividad seleccionada
- elegir solo entre `Empresa` o `Personal`
- impactar saldo de cuenta automaticamente

Comportamiento:

- la actividad queda cargada automaticamente al entrar desde un resumen
- el panel del lobby no navega
- los resumenes de gastos se agrupan por actividad
- cada tarjeta muestra hasta 3 gastos y luego `...`
- click en un resumen de gasto lleva a `Ingresos`

### 3. Ingresos

Permite:

- elegir actividad
- registrar uno o varios pagos parciales

Comportamiento:

- `Ingresos registrados` se agrupa por actividad, no por pago individual
- una actividad con varias cuotas mantiene una sola tarjeta acumulada
- la tarjeta muestra solo:
  - cobrado
  - fecha
  - actividad
  - pendiente
- click en un ingreso registrado lleva a `Movimientos`
- se muestran 3 resumenes por defecto con `Ver mas / Ver todo / Ver menos`

### 4. Movimientos

Permite:

- ver un resumen corto por actividad con movimiento
- abrir detalle

Detalle mostrado:

- actividad
- cobrado
- gastado
- pendiente

## Endpoints principales consumidos

- `GET /api/v1/neon/status`
- `GET /api/v1/neon/clients`
- `POST /api/v1/neon/clients`
- `GET /api/v1/neon/accounts`
- `GET /api/v1/neon/categories`
- `POST /api/v1/neon/categories`
- `GET /api/v1/neon/activities`
- `GET /api/v1/neon/activities/:id`
- `POST /api/v1/neon/activities`
- `POST /api/v1/neon/activities/:id/payments`
- `GET /api/v1/neon/expenses`
- `POST /api/v1/neon/expenses`

## Alcance real de esta etapa

Ya permite:

- crear clientes
- crear actividades
- cargar varios gastos a una actividad
- cargar varios ingresos parciales a una actividad
- ver resuemenes agrupados por actividad
- navegar entre bloques desde los resumenes
- ver movimientos finales por actividad

Todavia no implementa:

- dividir gasto
- centros de costo reales
- reportes
- ingresos independientes
- edicion y borrado funcionales

## Credenciales demo

- email interno: `neon.demo@saaspro.com`
- clave interna: `demo12345`
- en UI ya no se muestran campos: el acceso entra por boton `Iniciar`

## Siguiente lectura

- [Contexto funcional del producto](./product-context.md)
- [Diseno tecnico MVP](./mvp-technical-design.md)
