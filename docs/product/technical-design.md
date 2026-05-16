# Neon - Diseno tecnico del piloto

Fecha de actualizacion: 2026-05-16

## Objetivo

Traducir el contexto funcional de `neon` a un estado tecnico real de piloto.

No busca cerrar arquitectura definitiva.

Busca dejar una base tecnica util para validar:

- libro diario
- cuentas y credito
- centros de costo multiples
- actividades y control comercial
- reportes suficientes para orientar el siguiente bloque

## Pantallas reales actuales

Hoy `frontend-neon` expone cuatro vistas:

- `Diario`
- `Resumen`
- `Actividades`
- `Reportes`

## Entidades y conceptos vigentes

### `clients`

Se mantienen como base de actividades numeradas.

### `accounts`

Tipos usados hoy:

- `cash`
- `bank`
- `credit`

Uso:

- registrar de donde sale o entra el dinero
- recalcular saldo por movimientos

### `activities`

Se mantienen como entidad comercial.

Estados usados en UI:

- `pendiente_de_facturar`
- `facturado`
- `pendiente_de_cobrar`
- `cobrado`

Regla operativa:

- el cobro real viene del libro diario
- la empresa se asigna al facturar
- editar una actividad abre modal

### `movements`

El movimiento es la pieza central del producto.

Campos funcionales visibles hoy:

- tipo de movimiento
- fecha
- cuenta
- importe total
- descripcion
- detalle de gasto
- proveedor
- moneda
- tipo de gasto
- tarjeta
- vencimiento

Uso actual:

- registrar ingresos
- registrar gastos
- registrar traspasos
- impactar saldos de cuenta
- capturar salidas del piloto

### `movement allocations`

Cada movimiento puede dividirse en varias lineas.

Destinos vigentes:

- `activity`
- `vehicle`
- `personal`
- `rental`
- `other`

Regla activa:

- suma de allocations = total_amount

### `vehicle metadata`

Los datos de vehiculo siguen dentro de metadata de allocation.

Campos usados:

- kilometers
- liters

## Persistencia de este corte

La persistencia principal del piloto sigue siendo local al frontend.

Su objetivo es:

- validar el flujo con cliente sin endurecer todavia backend ni base
- permitir demo real con datos propios
- iterar rapido sobre lenguaje y UX

## Reglas de calculo vigentes

### Cuenta

- saldo = saldo inicial + ingresos - gastos

### Actividad

- total = monto visible actual de la actividad
- facturado = monto vigente al momento de pasar a `facturado`
- cobrado = suma de ingresos asignados a la actividad
- pendiente = facturado - cobrado

### Deuda de tarjeta

- deuda = gastos a credito - pagos de tarjeta asociados

### Movimiento dividido

- validacion dura de suma exacta
- si no coincide, no se guarda

## Mini cierre tecnico del piloto

Este corte ya deja validado:

- diario como entrada natural
- cuentas y saldo automatico
- credito con tarjeta y vencimiento
- reparto de un mismo movimiento entre varios destinos
- alquileres fuera de actividades
- control comercial por empresa ligada a la factura
- edicion de actividad por modal
- reportes base para prueba real

## Lo que sigue abierto

Se mantiene deliberadamente abierto:

- catalogos definitivos
- lenguaje final de algunas vistas
- estructura formal de alquileres
- limpieza final de piezas legacy
- bajada formal a backend
