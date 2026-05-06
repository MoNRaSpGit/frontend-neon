# Neon - Diseno tecnico MVP / V3

Fecha de actualizacion: 2026-05-06

## Objetivo de este corte

Traducir el contexto V3 a un estado tecnico real de piloto.

No se busca cerrar arquitectura definitiva.

Se busca dejar una base funcional para validar con cliente:

- flujo de libro diario
- cuentas y credito
- centros de costo multiples
- reportes suficientes para orientar el siguiente bloque

## Pantallas reales actuales

Hoy `frontend-neon` expone cuatro vistas:

- `Diario`
- `Resumen`
- `Actividades`
- `Reportes`

No se toma como vigente el flujo viejo por tarjetas.

## Entidades y conceptos vigentes

### 1. clients

Se mantienen como base de actividades numeradas.

### 2. accounts

Tipos usados hoy:

- `cash`
- `bank`
- `credit`

Uso:

- registrar de donde sale o entra el dinero
- recalcular saldo por movimientos

### 3. activities

Se mantienen como entidad comercial.

Estados usados en UI:

- `pendiente_de_facturar`
- `facturado`
- `pendiente_de_cobrar`

Regla operativa:

- el cobro real viene del libro diario
- no se trata a `cobrado` como estado manual principal

### 4. movements

El movimiento es la pieza central del producto.

Campos funcionales visibles hoy:

- movement type
- date
- account
- total amount
- description
- expense detail
- provider
- currency
- expense kind
- card label
- due date

Uso actual:

- registrar ingresos y gastos
- impactar saldos de cuenta
- capturar salidas V3 del piloto

### 5. movement allocations

Cada movimiento puede dividirse en varias lineas.

Destinos vigentes:

- `activity`
- `vehicle`
- `personal`
- `rental`
- `other`

Regla activa:

- suma de allocations = total_amount

### 6. vehicle metadata

Los datos de vehiculo siguen dentro de metadata de allocation.

Campos usados:

- kilometers
- liters

## Flujo funcional vigente

### Gasto

1. se registra el movimiento base
2. se elige de donde sale el dinero
3. si es `credit`, se completa tarjeta y vencimiento
4. se asigna el gasto a uno o varios centros de costo

### Ingreso

1. se registra el movimiento base
2. se elige donde entra el dinero
3. se asigna el ingreso a uno o varios centros de costo

No obliga actividad.

Esto permite:

- cobros de actividad
- ingresos por alquileres
- ingresos personales o de otros flujos

## Presets de prueba

El frontend expone presets para acelerar la validacion:

### Cuentas sugeridas

- `Caja $`
- `BROU $`
- `BBVA $`
- `ITAU U$S`
- `Credito`

### Tarjetas sugeridas

- `Visa Itau`
- `Master BBVA`
- `Porto Seguro`

### Centros de costo sugeridos

- vehiculos:
  - `Toyota RAA1111`
  - `Micro SAH2222`
  - `Movil RAE2323`
- personal:
  - `Casa`
  - `Uso personal`
- alquileres:
  - `ALQ1`
  - `ALQ2`
- otros:
  - `Generador`
  - `Herramientas`
  - `OTROS1`

## Dataset demo vigente

El tenant demo se puede resetear con:

- `backend/scripts/reset-neon-demo-pilot-data.js`

El set cargado hoy cubre:

- `2` gastos
- `2` ingresos
- actividad
- vehiculo
- personal
- alquiler

## Reportes vigentes

Hoy la UI ya cubre una primera lectura util de:

- saldos por cuenta
- deuda por tarjeta y vencimiento
- pagos de tarjeta recientes
- gastos e ingresos por centro
- libro diario filtrado
- resultados por actividad
- actividades pendientes

Y ademas adapta el resumen principal segun foco:

- vehiculo
- actividad
- alquiler
- personal
- otros

## Reglas de calculo vigentes

### Cuenta

- saldo = saldo inicial + ingresos - gastos

### Actividad

- total = quoted_amount
- cobrado = suma de ingresos asignados a la actividad
- pendiente = quoted_amount - cobrado

### Deuda de tarjeta

- deuda = gastos a credito - pagos de tarjeta asociados

### Movimiento dividido

- validacion dura de suma exacta
- si no coincide, no se guarda

## Mini cierre del piloto

Este corte ya deja validado casi todo el pedido principal del cliente:

- libro diario como entrada natural
- diario como pantalla inicial del modulo
- cuentas y saldo automatico
- credito con tarjeta y vencimiento
- reparto de un mismo movimiento entre varios destinos
- alquileres fuera de actividades
- lectura base de vehiculos, actividades y deuda

## Lo que sigue en estado de prueba

Se mantiene deliberadamente abierto:

- catalogos definitivos
- lenguaje final de algunas vistas
- estructura formal de alquileres
- limpieza final de piezas legacy
- endurecimiento de UX avanzada

## Camino recomendado despues de la devolucion

Si el cliente confirma direccion:

1. consolidar catalogos oficiales
2. endurecer reportes mas usados
3. cerrar alquileres y centros especiales
4. recien despues abrir edicion y borrado logico
