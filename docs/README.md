# Neon Docs

Fecha de actualizacion: 2026-05-06

Esta carpeta guarda la documentacion funcional y operativa de `frontend-neon`.

## Regla documental

- la arquitectura general del SaaS vive en `backend/docs`
- el comportamiento real del frontend `neon` se documenta aca

## Estado actual del frontend

`frontend-neon` ya dejo atras el flujo viejo por tarjetas `Actividades -> Gastos -> Ingresos -> Movimientos`.

Hoy la home esta alineada al modelo nuevo V3 y se organiza alrededor de:

- dashboard
- cuentas
- libro diario
- actividades
- reportes base

## Lo que hoy existe en la UI

- login simplificado con boton `Iniciar`
- ruta protegida del modulo `neon`
- dashboard base con:
  - saldo total
  - ingresos
  - gastos
  - falta cobrar
  - falta facturar
- seccion de cuentas para crear y listar cuentas
- seccion de libro diario para registrar:
  - ingreso o gasto
  - fecha
  - cuenta
  - monto total
  - descripcion
  - multiples lineas de asignacion
- seccion de actividades para:
  - crear cliente
  - crear actividad
  - ver cliente, cobrado y pendiente
- reportes base para:
  - ultimos movimientos
  - actividades
  - gastos por centro
  - ingresos por actividad

## Estado real implementado hasta hoy

Ya esta implementado y validado:

- cuentas base y cuentas nuevas
- libro diario simple
- division por multiples lineas
- asignacion a:
  - actividad
  - vehiculo
  - personal
  - otros
- kilometraje y litros en lineas de vehiculo
- actividades integradas al nuevo modelo
- cobrado y pendiente calculados desde ingresos del journal
- estados comerciales derivados para actividades

## Lo que todavia no esta cerrado en frontend

Pendientes principales:

- captura completa de datos V3 para salidas:
  - proveedor
  - documento
  - cantidad
  - unidad
  - moneda
- soporte real de credito en la UI
- tarjetas y vencimientos
- filtros por fecha
- edicion de movimientos
- borrado logico visible en UX
- vistas mas completas de reportes

## Endpoints principales que consume hoy

- `GET /api/v1/neon/status`
- `GET /api/v1/neon/clients`
- `POST /api/v1/neon/clients`
- `PATCH /api/v1/neon/clients/:id`
- `GET /api/v1/neon/accounts`
- `POST /api/v1/neon/accounts`
- `GET /api/v1/neon/activities`
- `GET /api/v1/neon/activities/:id`
- `POST /api/v1/neon/activities`
- `PATCH /api/v1/neon/activities/:id`
- `GET /api/v1/neon/journal`
- `POST /api/v1/neon/journal`

Compatibilidad heredada aun presente:

- `POST /api/v1/neon/activities/:id/payments`
- `GET /api/v1/neon/categories`
- `POST /api/v1/neon/categories`
- `GET /api/v1/neon/expenses`
- `POST /api/v1/neon/expenses`

## Donde quedamos hoy

El producto ya tiene una base util para demo real del modelo nuevo:

- se puede crear cuenta
- se puede crear cliente
- se puede crear actividad
- se puede registrar ingreso o gasto
- se puede dividir el movimiento por centros
- se puede consultar saldos, pendientes y reportes simples

## Proximos pasos recomendados

1. completar el modelo V3 de salidas
2. incorporar credito, tarjetas y vencimientos
3. limpiar UX y endpoints heredados que ya no son el nucleo
4. agregar filtros y reportes por periodo
5. habilitar edicion y borrado logico

## Siguiente lectura

- [Contexto funcional del producto](./product-context.md)
- [Diseno tecnico MVP / V3](./mvp-technical-design.md)
