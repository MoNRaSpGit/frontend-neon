# Neon Docs

Fecha de actualizacion: 2026-05-05

Esta carpeta guarda la documentacion particular de `frontend-neon`.

Regla actual:

- la documentacion estructural del SaaS vive en `backend/docs`
- la documentacion puntual del modulo `neon` vive aca

## Estado actual

`neon` esta en fase `shell` y el bloque 1 ya quedo cerrado.

Hoy ya existe:

- frontend publicado
- auth SaaS real
- routing protegido
- dashboard base
- `saas-admin` enlazado
- endpoint backend activo
- base conectada

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

El shell actual muestra:

- modulo
- fase
- tenant actual
- usuario actual
- estado de base
- timestamp del backend

Endpoint consumido:

- `GET /api/v1/neon/status`

## Lo que todavia no hace

Todavia no implementa:

- actividades
- movimientos
- distribuciones
- cuentas
- centros de costo
- clientes
- reportes

## Siguiente lectura

- [Contexto funcional del producto](./product-context.md)
- [Diseno tecnico MVP](./mvp-technical-design.md)
