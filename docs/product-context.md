# Neon - Contexto funcional V3

Fecha de actualizacion: 2026-05-10

## Definicion final del producto

`neon` es un sistema de gestion financiera y operativa basado en:

- libro diario
- centros de costo
- cuentas
- actividades

El objetivo es reemplazar Excel sin perder flexibilidad, pero agregando:

- estructura
- trazabilidad
- automatizacion
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

El libro diario registra dos tipos de movimientos:

- entradas
- salidas

### Entradas

Permiten:

- ingresos asociados a actividades
- ingresos independientes
- division en una o varias lineas

### Salidas

Cada salida debe contemplar en V3:

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

Si el origen es credito, el sistema debe contemplar:

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

Son el nucleo del sistema.

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
- otros

Regla dura:

- la suma de las lineas debe ser igual al total del movimiento
- si no coincide, no se guarda

## Vehiculos

Cuando el centro es vehiculo, el sistema puede guardar:

- kilometraje
- litros

Esto habilita reportes posteriores de:

- consumo
- gasto anual
- costo operativo

## Actividades

Las actividades siguen existiendo como un tipo de centro de costo con logica propia.

Datos funcionales:

- numero correlativo
- cliente
- descripcion
- importe
- tipo

Tipos actuales:

- NEON
- MOVIL AUDIOVISUAL
- OTROS

### Empresa comercial de factura

`Empresa A / B / C` no se interpreta hoy como estructura operativa completa del negocio.

Regla validada con cliente:

- `neon` se trabaja como un todo
- la empresa se usa para controlar por quien quedo facturada una actividad
- la empresa se elige cuando una actividad pasa a `facturado`
- no divide cuentas, diario, vehiculos, personal o alquileres

## Estados de actividad

Estados funcionales:

- pendiente de facturar
- facturado
- pendiente de cobrar
- cobrado

Automatizaciones validadas:

- si se marca `facturado`, pasa a `pendiente de cobrar`
- si ingresan cobros asociados, baja el pendiente
- si el pendiente llega a `0`, queda en `cobrado`
- cuando esta cobrado, debe desaparecer de pendientes

Regla adicional vigente:

- el importe pendiente de cobrar se calcula contra el importe facturado real
- si una actividad fue cotizada por un valor y luego se edita antes de facturar, ese mismo monto corregido se usa como base facturada

## Reportes esperados

El valor principal del producto esta en los reportes.

Minimo esperado en V3:

- saldos por cuenta
- tarjetas y vencimientos de credito
- gastos por centro
- ingresos por centro
- pendientes de facturar
- pendientes de cobrar
- pendientes de cobrar por empresa facturada
- total facturado en el año por empresa facturada
- resultados por actividad
- total ingresos
- total gastos

## Fechas, moneda y borrado

Reglas funcionales:

- todos los registros tienen fecha editable
- se pueden cargar datos atrasados
- el borrado es logico
- la moneda base es pesos
- se debe soportar dolares cuando la cuenta lo requiera

## Donde estamos hoy

Al dia de hoy ya existe una base tecnica funcional sobre el modelo nuevo:

- cuentas por tenant
- libro diario con ingresos y gastos
- asignacion simple o dividida por multiples lineas
- actividades como centro de costo
- recalculo de cobrado y pendiente desde ingresos del libro diario asignados a actividad
- dashboard simple con saldos, ingresos, gastos, falta cobrar y falta facturar
- reportes base de gastos por centro e ingresos por actividad
- control comercial por empresa ligada a la factura
- edicion de actividad desde modal

## Que todavia falta para cerrar V3

Pendientes mas importantes:

- enriquecer los datos de salidas: proveedor, documento, cantidad, unidad, moneda
- agregar cuenta tipo credito con comportamiento real
- modelar tarjetas y vencimientos
- soportar deuda pendiente y su reporte
- ampliar catalogo de centros de costo visibles en UI
- filtros y reportes por fecha
- edicion y borrado logico de movimientos
- resultados por actividad mas completos
- terminar de definir si `Empresa C` queda solo para no facturado o tambien para una tercera empresa real

## Resumen

`neon` queda definido en V3 como:

- un libro diario inteligente
- con cuentas
- con centros de costo
- con actividades integradas
- con foco en control operativo y financiero real
