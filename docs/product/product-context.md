# Neon - Contexto funcional del producto

Fecha de actualizacion: 2026-05-16

## Definicion actual del producto

`neon` es un sistema de gestion financiera y operativa basado en:

- libro diario
- centros de costo
- cuentas
- actividades

El objetivo es reemplazar Excel sin perder flexibilidad, pero agregando:

- estructura
- trazabilidad
- reportes claros

## Regla principal del modelo

Todo movimiento nace en el libro diario.

Despues se asigna a:

- cuentas
- centros de costo
- actividades, si corresponde

No es una app guiada por pantallas tipo flujo.

Es una herramienta de gestion basada en un libro diario inteligente.

## Libro diario

El libro diario registra:

- entradas
- salidas
- traspasos

### Entradas

Permiten:

- ingresos asociados a actividades
- ingresos independientes
- division en una o varias lineas

### Salidas

Cada salida debe contemplar en este piloto:

- fecha
- proveedor
- documento
- cantidad
- unidad de medida
- detalle
- kilometraje opcional
- moneda
- importe total

Luego se define el origen del dinero:

- caja
- banco
- credito

Si el origen es credito, el sistema contempla:

- tarjeta
- fecha de vencimiento

## Cuentas

El sistema maneja cuentas como origen o destino del dinero.

Casos base:

- caja
- bancos
- credito

Cada movimiento impacta una cuenta y recalcula su saldo.

## Centros de costo

Son el nucleo de lectura del sistema.

Ejemplos validados:

- actividades
- vehiculos
- casa
- alquileres
- uso personal
- otros

## Regla de division

Un movimiento puede dividirse en multiples lineas.

Cada linea puede apuntar a uno de estos destinos:

- actividad
- vehiculo
- personal
- alquiler
- otros

Regla dura:

- la suma de las lineas debe ser igual al total del movimiento

## Actividades

Las actividades siguen existiendo como entidad comercial con logica propia.

Datos funcionales:

- numero correlativo
- cliente
- descripcion
- importe
- tipo

Tipos actuales:

- `neon`
- `movil_audiovisual`
- `otros`

## Empresa comercial de factura

`Empresa A / B / C` no se interpreta hoy como estructura operativa completa del negocio.

Regla validada con cliente:

- `neon` se trabaja como un todo
- la empresa se usa para controlar por quien quedo facturada una actividad
- la empresa se elige cuando una actividad pasa a `facturado`
- no divide cuentas, diario, vehiculos, personal o alquileres

## Estados de actividad

Estados funcionales:

- `pendiente de facturar`
- `facturado`
- `pendiente de cobrar`
- `cobrado`

Automatizaciones validadas:

- si se marca `facturado`, pasa a `pendiente de cobrar`
- si ingresan cobros asociados, baja el pendiente
- si el pendiente llega a `0`, queda en `cobrado`
- cuando esta cobrado, desaparece de pendientes

Regla adicional vigente:

- el importe pendiente de cobrar se calcula contra el importe facturado real
- si una actividad fue cotizada por un valor y luego se edita antes de facturar, ese mismo monto corregido se usa como base facturada

## Reportes esperados

El valor principal del producto esta en los reportes.

Minimo esperado en este piloto:

- saldos por cuenta
- tarjetas y vencimientos de credito
- gastos por centro
- ingresos por centro
- pendientes de facturar
- pendientes de cobrar
- pendientes de cobrar por empresa facturada
- total facturado en el anio por empresa facturada
- resultados por actividad
- total ingresos
- total gastos

## Regla de este corte

Hoy el foco esta en validar:

- flujo diario
- lenguaje
- centros de costo
- lectura de reportes

La persistencia formal en backend queda para despues de cerrar el piloto con cliente.
