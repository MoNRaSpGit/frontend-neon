# Neon - Estado actual del frontend

Fecha de actualizacion: 2026-05-16

## Estado general

`frontend-neon` hoy se mantiene como piloto funcional en validacion con cliente.

No se interpreta ya como un flujo viejo por tarjetas.

La entrada principal del modulo es:

- `Diario`

## Regla importante de este corte

Hoy el piloto sigue usando persistencia local del frontend para el flujo principal de demo.

Eso significa:

- el cliente puede probar el sistema con sensacion real de uso
- el frontend guarda el workspace localmente
- la bajada formal a backend todavia no es la prioridad del modulo

## Vistas visibles actuales

- `Diario`
- `Resumen`
- `Actividades`
- `Reportes`

## Idea central del producto hoy

- primero existe el movimiento
- despues se elige de donde sale o entra el dinero
- si es credito se completan tarjeta y vencimiento
- despues se reparte ese movimiento entre centros de costo

## Lo que hoy existe en la UI

### Resumen

Hoy muestra:

- saldo total
- movimiento acumulado
- pendiente de facturar
- pendiente de cobrar
- deuda pendiente
- control comercial por empresa facturada:
  - `Empresa A`
  - `Empresa B`
  - `Empresa C`

### Diario

Es la parte mas importante del piloto.

Permite registrar:

- ingreso o gasto
- fecha
- cuenta
- importe total
- detalle
- multiples lineas de asignacion

Y para salidas tambien:

- detalle
- proveedor
- moneda
- kilometraje y litros cuando aplica

Si la cuenta es `credit`, tambien permite:

- tarjeta
- vencimiento

Ademas soporta:

- `pago de tarjeta`
- `traspaso` entre cuentas

### Actividades

Se mantienen como entidad comercial numerada.

Permite:

- crear cliente
- crear actividad
- ver seguimiento comercial
- editar actividad desde modal
- pasar de `pendiente de facturar` a `facturado`
- ver cuanto queda pendiente de cobrar segun ingresos reales

Regla vigente del piloto:

- la empresa se asigna al facturar la actividad
- `Empresa A / B / C` funcionan como control comercial
- el cobro real baja desde el diario cuando entra dinero asignado a esa actividad

### Reportes

Hoy incluye:

- saldos por cuenta
- deuda pendiente y tarjetas
- gastos e ingresos por centro de costo
- movimientos del centro
- libro diario filtrado
- actividades pendientes
- resultados por actividad
- exploracion por cuenta con movimientos asociados

Y distingue mejor entre:

- vehiculo
- actividad
- alquiler
- personal
- otros

## Base funcional implementada

Hoy ya esta implementado y validado:

- cuentas base y cuentas nuevas
- soporte de cuentas `cash`, `bank` y `credit`
- `traspaso` entre cuentas sin contaminar ingresos ni gastos
- libro diario V3 para piloto
- division por multiples lineas
- asignacion a actividad, vehiculo, personal, alquiler, otros y tipo personalizado
- kilometraje y litros en lineas de vehiculo
- deuda pendiente por credito
- neteo de deuda con pagos de tarjeta
- actividades integradas al nuevo modelo
- cobrado y pendiente calculados desde ingresos del journal
- empresa comercial ligada a la factura de actividad
- modal de edicion para actividades
- filtros por periodo en reportes
- rango personalizado en reportes
- exploracion por cuenta con borrado de movimientos desde reportes
- control para ocultar demo y restaurarla

## Presets y demo local

La UI ya sugiere presets para cuentas, tarjetas y centros de costo, y mantiene un dataset demo corto para mostrar el sistema sin ruido.

Referencia operativa relacionada:

- `backend/scripts/reset-neon-demo-pilot-data.js`

## Lo que todavia no se cierra a proposito

Este corte se mantiene en estado de piloto.

Todavia no se endurece:

- catalogo oficial definitivo de cuentas
- catalogo oficial definitivo de tarjetas
- gestion fuerte de alquileres como entidad propia
- edicion y borrado logico visibles
- limpieza final de piezas heredadas
- cierre fino del lenguaje entre `cotizado`, `facturado` y `cobrado`

## Siguiente paso recomendado

No meter mas codigo fuerte hasta recibir devolucion.

El camino sugerido es:

1. que el cliente pruebe el flujo diario
2. escuchar ajustes de lenguaje, centros y reportes
3. confirmar si la direccion es correcta
4. recien despues endurecer modelo y UX final
