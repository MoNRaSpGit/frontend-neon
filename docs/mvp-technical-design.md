# Neon - Diseno tecnico MVP

Fecha de actualizacion: 2026-05-05

## Objetivo

Bajar el contexto funcional cerrado a una primera implementacion MVP clara, corta y ordenada.

## Pantallas MVP

No agregar mas por ahora.

Pantallas iniciales:

- Dashboard
- Crear actividad
- Ver actividad
- Registrar movimiento
- Reportes

## Flujo MVP principal

### Flujo 1. Crear actividad

- crear actividad
- definir precio
- asociar cliente
- dejarla visible en dashboard y detalle

### Flujo 2. Registrar gasto

- poner monto
- elegir cuenta
- escribir descripcion
- elegir categoria
- decidir si divide o no divide
- guardar

Si divide:

- cargar partes
- validar suma exacta contra el total

### Flujo 3. Registrar ingreso

Dos caminos:

- desde actividad con `Registrar pago`
- ingreso independiente

En ambos casos:

- elegir cuenta
- ingresar monto
- fecha editable
- descripcion opcional
- guardar

### Flujo 4. Consultar actividad

Desde la actividad se debe ver:

- precio total
- cobrado
- pendiente
- gastos asociados
- resultado final

### Flujo 5. Consultar reportes

Vista inicial del MVP:

- ingresos del periodo
- gastos del periodo
- balance
- resultado por actividad
- gastos por categoria

## Entidades MVP

### 1. activities

Campos minimos:

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

- `activity_number` reinicia por ano
- `quoted_amount` es el precio del trabajo
- `commercial_status` no reemplaza al cobro real

### 2. clients

Campos minimos:

- id
- tenant_id
- name
- phone nullable
- notes nullable
- deleted_at nullable
- created_at
- updated_at

### 3. accounts

Campos minimos:

- id
- tenant_id
- name
- account_type
- opening_balance
- deleted_at nullable
- created_at
- updated_at

Tipos iniciales:

- cash
- bank

### 4. categories

Campos minimos:

- id
- tenant_id
- name
- movement_type
- classification
- is_system
- deleted_at nullable
- created_at
- updated_at

Reglas:

- `movement_type`: ingreso o egreso
- `classification`: empresa o personal
- categorias iniciales del sistema + categorias creadas por usuario

### 5. movements

Campos minimos:

- id
- tenant_id
- movement_type
- movement_date
- account_id
- total_amount
- description
- category_id
- source_type
- source_activity_id nullable
- deleted_at nullable
- created_at
- updated_at

Reglas:

- `movement_type`: ingreso o egreso
- `source_type`: activity o independent
- un movimiento se registra una sola vez

### 6. movement_allocations

Campos minimos:

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

Destinos iniciales:

- activity
- personal
- vehicle
- other

Regla:

- la suma de allocations debe ser igual al total del movimiento

### 7. activity_payments

Campos minimos:

- id
- tenant_id
- activity_id
- movement_id
- paid_amount
- created_at

Uso:

- enlazar pagos reales contra actividades
- soportar pagos parciales

### 8. vehicle_entries

Campos minimos:

- id
- tenant_id
- movement_allocation_id
- kilometers nullable
- liters nullable
- created_at
- updated_at

Uso:

- guardar datos extra de gastos de vehiculo

## Relaciones MVP

- una actividad puede tener un cliente
- una actividad puede tener muchos pagos
- una actividad puede recibir muchas allocations de gastos
- un movimiento pertenece a una cuenta
- un movimiento pertenece a una categoria
- un movimiento puede tener muchas allocations
- un pago de actividad referencia un movimiento de ingreso
- una allocation de vehiculo puede tener detalle de kilometraje y litros

## Reglas de calculo

### Actividad

Para cada actividad:

- `precio total` = `quoted_amount`
- `monto cobrado` = suma de pagos asociados
- `monto pendiente` = `quoted_amount - monto cobrado`
- `resultado` = `monto cobrado` o `quoted_amount` segun reporte elegido menos gastos asignados

Nota MVP:

- para operacion diaria, mostrar `cobrado` y `pendiente`
- para rentabilidad, mostrar gastos asignados y resultado

### Cuenta

Para cada cuenta:

- saldo = saldo inicial + ingresos - egresos

### Movimiento dividido

Validacion dura:

- suma de `movement_allocations.amount` = `movements.total_amount`

Si no coincide:

- no se guarda

## Lenguaje de UX

No usar como lenguaje principal:

- movimiento financiero
- distribucion

Usar:

- ingreso
- gasto
- dividir gasto
- registrar pago

## Alcance fuera del MVP

No meter todavia:

- transferencias entre cuentas
- multiusuario complejo
- multiempresa compleja
- contabilidad formal
- automatizaciones avanzadas

## Orden recomendado de implementacion

1. clientes
2. actividades
3. cuentas
4. categorias
5. gastos con o sin division
6. ingresos desde actividad e independientes
7. calculos de actividad y saldos
8. reportes base

## Resultado esperado del MVP

Al cerrar el MVP, el usuario ya debe poder:

- crear actividades
- registrar gastos
- dividir gastos
- registrar pagos parciales
- ver pendiente y cobrado por actividad
- ver saldo por cuenta
- ver reportes base sin usar planillas externas
