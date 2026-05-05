# Neon - Contexto funcional

Fecha de actualizacion: 2026-05-05

## Objetivo general

Desarrollar un sistema de gestion financiera orientado a actividades y trabajos, con foco en reemplazar planillas manuales y centralizar ingresos, gastos y resultados del negocio.

El sistema debe ser simple, evitar duplicacion de datos y permitir obtener reportes claros para tomar decisiones.

## Enfoque general

El sistema es `activity-first`.

El usuario:

- comienza creando una actividad
- luego registra gastos para esa actividad
- despues registra ingresos para esa actividad
- finalmente consulta movimientos del circuito completo

## Actividades

Cada actividad representa un trabajo.

Debe incluir:

- numero correlativo automatico que reinicia cada ano
- fecha
- descripcion
- cliente
- tipo de actividad
- precio del trabajo definido manualmente

Tipos iniciales:

- neon
- movil audiovisual
- otros

## Estado financiero de la actividad

Cada actividad debe mostrar:

- precio total
- monto cobrado
- monto pendiente

El saldo se calcula automaticamente.

## Estados comerciales

Una actividad puede estar en:

- pendiente de facturar
- facturado
- pendiente de cobrar
- cobrado

Regla importante:

- el estado comercial es independiente del flujo real de dinero

## Movimientos

El sistema maneja:

- ingresos
- gastos

Cada movimiento tiene:

- fecha editable
- monto total
- cuenta
- descripcion

## Gastos y distribucion

Un gasto puede:

- no dividirse y quedar 100 por ciento en un solo destino
- dividirse en multiples partes

Ejemplos:

- `500` -> gastos personales
- `500` -> `200` actividad `#1`, `300` personal

Reglas obligatorias:

- la suma de las partes debe ser igual al total
- si no coincide, no deja guardar
- el gasto se registra una sola vez

## Centros de costo

Destinos posibles:

- actividades
- gastos personales
- vehiculo
- otros

## Vehiculo

El vehiculo funciona como centro de costo especial.

Debe permitir:

- registrar gastos
- kilometraje opcional
- litros opcionales

Con eso despues se busca calcular:

- consumo
- gasto total del vehiculo

## Clientes

Cada actividad puede tener un cliente.

Debe permitir:

- ver deuda actual en vista rapida
- ver historial completo expandible

## Cuentas

El sistema maneja multiples cuentas:

- caja
- bancos

Reglas:

- cada movimiento impacta en una cuenta
- el saldo se calcula automaticamente en base a movimientos

## Ingresos

Hay dos tipos:

### 1. Desde actividad

Se registran desde la actividad con accion tipo `Registrar pago`.

Caracteristicas:

- pueden ser multiples pagos parciales
- generan ingreso vinculado a la actividad
- impactan en la cuenta elegida

El sistema calcula automaticamente:

- total cobrado
- pendiente

### 2. Independientes

Ingresos no asociados a una actividad.

Ejemplo:

- `gane 50 en la loteria`

## Reportes

Los reportes son el valor principal del sistema.

Debe permitir:

- ingresos totales por periodo
- gastos totales por periodo
- balance general
- resultado por actividad
- gastos por categoria
- ingresos por tipo
- deuda de clientes
- saldos por cuenta
- gastos del vehiculo

Reglas iniciales:

- periodo por defecto: mes actual
- orden principal: por fecha

## UX e interfaz

La interfaz debe ser simple y visual.

Pantalla principal tipo tarjetas:

- Actividades
- Gastos
- Ingresos
- Movimientos

Comportamiento real actual:

- al entrar se ven solo las 4 tarjetas compactas
- cada tarjeta se despliega al hacer click
- los resumenes internos conectan el flujo entre modulos

Ejemplos:

- Actividades -> pendientes
- Gastos -> total del mes
- Ingresos -> total del mes

## Flujo principal

- crear actividad
- registrar gasto simple para esa actividad
- registrar ingresos parciales para esa actividad
- ver movimientos resumidos
- consultar el resultado operativo basico

## Edicion y borrado

Se puede editar todo.

El borrado es logico:

- no aparece en la vista normal
- queda guardado internamente

### Reglas de borrado

Si se borra un gasto:

- se recalculan automaticamente actividad, reportes y saldos

Si se cancela o elimina una actividad:

- los gastos no se eliminan
- quedan asociados como `Actividad cancelada`

## Categorias

En el flujo visible actual, el usuario elige solo entre:

- `Empresa`
- `Personal`

La UI ya no expone una grilla completa de categorias en esta etapa.

## Fechas

Todos los registros tienen fecha editable.

Reglas:

- se pueden cargar datos atrasados
- la visualizacion se ordena por fecha

## Moneda

El sistema trabaja en pesos.

## Resumen final

Este no es un sistema contable tradicional.

Es un sistema de control financiero orientado a actividades donde el usuario:

- registra trabajos
- registra ingresos y gastos
- divide gastos en multiples destinos
- obtiene reportes automaticos

Foco principal:

- simplicidad
- evitar duplicacion
- claridad total del negocio

## Estado

Contexto actualizado al cierre del slice actual.

Listo para continuar con:

- dividir gasto
- centros de costo
- reportes base
