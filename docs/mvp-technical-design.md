# Neon - Diseno tecnico MVP / V3

Fecha de actualizacion: 2026-05-06

## Objetivo

Bajar el contexto funcional V3 a un corte tecnico claro:

- que ya esta implementado
- que sigue faltando
- en que orden conviene seguir

## Corte tecnico actual

Hoy el nucleo nuevo ya existe.

Bloques implementados:

1. cuentas
2. libro diario simple
3. centros de costo simples
4. division por multiples lineas
5. actividades integradas al nuevo modelo
6. cobrado y pendiente calculados desde journal
7. dashboard simple

## Pantallas reales actuales

Hoy `frontend-neon` expone:

- dashboard
- cuentas
- libro diario
- actividades
- reportes base

No se toma como vigente el flujo viejo por tarjetas.

## Entidades vigentes

### 1. clients

Campos activos:

- id
- tenant_id
- name
- phone nullable
- notes nullable
- deleted_at nullable
- created_at
- updated_at

### 2. accounts

Campos activos:

- id
- tenant_id
- name
- account_type
- opening_balance
- deleted_at nullable
- created_at
- updated_at

Tipos usados hoy:

- cash
- bank

Pendiente V3:

- credito

### 3. activities

Campos activos:

- id
- tenant_id
- activity_number
- activity_year
- activity_date
- description
- client_id nullable
- activity_type
- commercial_status
- quoted_amount
- deleted_at nullable
- created_at
- updated_at

Notas:

- `facturado` se normaliza a `pendiente_de_cobrar`
- `cobrado` se deriva desde ingresos del journal

### 4. movements

Campos activos:

- id
- tenant_id
- movement_type
- movement_date
- account_id
- total_amount
- description
- source_type
- source_activity_id nullable
- deleted_at nullable
- created_at
- updated_at

Uso actual:

- registrar ingresos y gastos
- impactar saldos de cuenta

Pendiente V3 en esta entidad:

- proveedor
- documento
- cantidad
- unidad de medida
- moneda
- datos de credito

### 5. movement_allocations

Campos activos:

- id
- tenant_id
- movement_id
- destination_type
- destination_activity_id nullable
- destination_label nullable
- amount
- metadata_json nullable
- created_at
- updated_at

Destinos activos:

- activity
- vehicle
- personal
- other

Regla activa:

- suma de allocations = total_amount

### 6. vehicle metadata

Hoy los datos de vehiculo se guardan dentro de `metadata_json` de la allocation.

Campos activos:

- kilometers nullable
- liters nullable

## Reglas de calculo vigentes

### Cuenta

- saldo = saldo inicial + ingresos - gastos

### Actividad

- total = quoted_amount
- cobrado = suma de lineas de ingreso asignadas a esa actividad
- pendiente = quoted_amount - cobrado
- estado:
  - `pendiente_de_facturar` si todavia no fue facturada
  - `pendiente_de_cobrar` cuando entra a circuito comercial
  - `cobrado` cuando pendiente llega a cero

### Movimiento dividido

- validacion dura de suma exacta
- si no coincide, no se guarda

## Estado implementado por modulo

### Backend

Ya existe:

- `GET /api/v1/neon/accounts`
- `POST /api/v1/neon/accounts`
- `GET /api/v1/neon/clients`
- `POST /api/v1/neon/clients`
- `PATCH /api/v1/neon/clients/:id`
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

### Frontend

Ya existe:

- formularios de cuentas
- formularios de clientes
- formularios de actividades
- formulario de journal con multiples lineas
- resumenes base del dashboard
- reportes simples

## Proximos pasos tecnicos

Orden recomendado desde hoy:

1. enriquecer `movements` para salidas V3
2. agregar soporte de `credito`
3. modelar tarjetas y vencimientos
4. crear reporte de deuda pendiente
5. limpiar endpoints y UI heredados
6. filtros por fecha y periodo
7. edicion y borrado logico visibles

## Resultado esperado del siguiente bloque

Al cerrar el siguiente bloque, el usuario ya deberia poder:

- registrar salidas con mas datos operativos
- registrar gastos a credito
- saber cuanto debe y cuando vence
- ver reportes basicos mas cercanos a la operativa real del cliente
