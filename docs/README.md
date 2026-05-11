# Neon Docs

Fecha de actualizacion: 2026-05-10

Esta carpeta guarda la documentacion funcional y operativa de `frontend-neon`.

## Regla documental

- la arquitectura general del SaaS vive en `backend/docs`
- el comportamiento real del frontend `neon` se documenta aca

## Estado actual del frontend

`frontend-neon` ya no se interpreta como un flujo viejo por tarjetas.

Hoy la home del piloto se organiza en cuatro vistas:

- `Diario`
- `Resumen`
- `Actividades`
- `Reportes`

La idea central del corte actual es esta:

- primero existe el movimiento
- despues se elige de donde sale o entra el dinero
- si es credito se completan tarjeta y vencimiento
- despues se reparte ese movimiento entre centros de costo

## Lo que hoy existe en la UI

### Resumen

Vista simple para abrir el modulo sin perder foco.

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

Ademas soporta `pago de tarjeta` como tipo operativo para bajar deuda.

### Actividades

Se mantienen como entidad comercial numerada.

Permite:

- crear cliente
- crear actividad
- ver seguimiento comercial
- ver pendientes
- ver todas las actividades

El lenguaje vigente es:

- `pendiente de facturar`
- `facturado`
- `pendiente de cobrar`

Regla vigente del piloto:

- la empresa se asigna al facturar la actividad
- `Empresa A / B / C` no separan la operacion diaria completa
- sirven como control comercial de lo facturado
- el cobro real baja desde el libro diario cuando entra dinero asignado a esa actividad

Ademas hoy permite:

- editar actividad desde modal
- cambiar el monto del trabajo en la misma edicion
- pasar de `pendiente de facturar` a `facturado`
- ver cuanto queda pendiente de cobrar segun ingresos reales

### Reportes

Se reordeno para validar la idea pedida por cliente:

- elegir fechas
- elegir centro
- ver una historia concreta

Hoy incluye:

- saldos por cuenta
- deuda pendiente y tarjetas
- gastos e ingresos por centro de costo
- movimientos del centro
- libro diario filtrado
- actividades pendientes
- resultados por actividad

Y ya distingue mejor segun el caso:

- vehiculo
- actividad
- alquiler
- personal
- otros

## Base funcional implementada

Hoy ya esta implementado y validado:

- cuentas base y cuentas nuevas
- soporte de cuentas:
  - `cash`
  - `bank`
  - `credit`
- libro diario V3 para piloto
- division por multiples lineas
- asignacion a:
  - actividad
  - vehiculo
  - personal
  - alquiler
  - otros
- kilometraje y litros en lineas de vehiculo
- deuda pendiente por credito
- neteo de deuda con pagos de tarjeta
- actividades integradas al nuevo modelo
- cobrado y pendiente calculados desde ingresos del journal
- empresa comercial ligada a la factura de actividad
- modal de edicion para actividades
- monto del trabajo como unico importe editable en UI
- filtros por periodo en reportes
- rango personalizado en reportes

## Presets de prueba vigentes

Para que el cliente se vea reflejado rapido, la UI ya sugiere:

### Cuentas

- `Caja $`
- `BROU $`
- `BBVA $`
- `ITAU U$S`
- `Credito`

### Tarjetas

- `Visa Itau`
- `Master BBVA`
- `Porto Seguro`

### Centros de costo base

- vehiculos:
  - `Toyota RAA1111`
  - `Micro SAH2222`
  - `Movil RAE2323`
- personal / casa:
  - `Casa`
  - `Uso personal`
- alquileres:
  - `ALQ1`
  - `ALQ2`
- otros:
  - `Generador`
  - `Herramientas`
  - `OTROS1`

## Dataset demo cargado

El tenant demo quedo con una base corta para mostrar el sistema sin ruido.

Hoy incluye:

- `2` gastos
- `2` ingresos
- `3` actividades
- casos visibles de:
  - vehiculo
  - personal
  - alquiler
  - actividades

Script de reseteo:

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

## Donde quedamos hoy

El producto ya tiene una base util para prueba real con cliente:

- puede cargar ingresos y gastos
- puede dividirlos entre varios destinos
- puede registrar credito y vencimientos
- puede separar alquileres de actividades
- puede mirar cuentas, deuda y reportes por centro
- puede seguir pendientes de facturar y pendientes de cobrar por empresa comercial
- abre directamente en `Diario`, que hoy es la entrada principal pedida por cliente

## Siguiente paso recomendado

No meter mas codigo fuerte hasta recibir devolucion.

El camino sugerido es:

1. que el cliente pruebe el flujo diario
2. escuchar ajustes de lenguaje, centros y reportes
3. confirmar si la direccion es correcta
4. recien despues endurecer modelo y UX final

## Siguiente lectura

- [Contexto funcional del producto](./product-context.md)
- [Diseno tecnico MVP / V3](./mvp-technical-design.md)
- [Bitacora del modulo](./bitacora.md)
