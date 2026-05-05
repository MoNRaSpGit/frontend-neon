# Neon Docs

Fecha de actualizacion: 2026-05-05

Esta carpeta guarda la documentacion particular de `frontend-neon`.

Regla actual:

- la documentacion estructural del SaaS vive en `backend/docs`
- la documentacion puntual del modulo `neon` vive aca

## Estado actual

`neon` ya dejo atras el shell puro.

Bloques cerrados hasta hoy:

- bloque 1: shell en produccion
- bloque 2 parcial: clientes, actividades, cuentas, `Registrar pago` y gasto simple

Hoy ya existe:

- frontend publicado
- auth SaaS real
- routing protegido
- dashboard base
- `saas-admin` enlazado
- endpoint backend activo
- base conectada
- alta de clientes
- alta de actividades
- detalle de actividad
- cuentas base por tenant
- registro de pagos desde actividad
- recalculo automatico de `cobrado` y `pendiente`
- categorias de gasto
- registro de gasto simple

## Validacion en produccion

Se confirmo:

- modulo: `neon`
- fase: `shell`
- tenant actual: `Neon Demo`
- usuario actual: `neon.demo@saaspro.com`
- DB: `connected`

## Credenciales demo

- email: `neon.demo@saaspro.com`
- clave: `demo12345`

## Alcance actual

El modulo actual ya permite:

- crear clientes
- crear actividades
- ver actividades
- ver detalle de actividad
- registrar pagos parciales desde actividad
- ver cuentas y saldo actual
- crear categorias de gasto
- registrar gasto simple

Todavia conserva la base del shell:

- modulo
- tenant actual
- usuario actual
- estado de base
- timestamp del backend

Endpoints principales consumidos:

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

## Lo que todavia no hace

Todavia no implementa:

- dividir gasto
- centros de costo
- reportes
- ingresos independientes
- edicion y borrado

## Siguiente lectura

- [Contexto funcional del producto](./product-context.md)
- [Diseno tecnico MVP](./mvp-technical-design.md)
