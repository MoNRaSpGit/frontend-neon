# Neon - Contexto funcional

Fecha de captura: 2026-05-05

## Objetivo general

Desarrollar un sistema de gestion financiera personal y empresarial orientado a servicios y eventos.

## Idea central

El sistema debe registrar cada movimiento financiero una sola vez.

Desde ese registro:

- se distribuye automaticamente en distintos destinos
- impacta en cuentas
- alimenta reportes
- se asocia a actividades, clientes o gastos personales

## Pilares del producto

### 1. Actividades

Cada trabajo o evento tiene:

- numero correlativo automatico
- fecha
- descripcion
- cliente asociado
- tipo de ingreso
- estado operativo y financiero

Estados esperados:

- pendiente de facturar
- facturado
- pendiente de cobrar
- cobrado

### 2. Movimientos financieros

El usuario registra:

- ingresos
- egresos

Cada movimiento tiene:

- fecha
- monto total
- cuenta
- descripcion

### 3. Distribucion de movimientos

Un mismo movimiento puede dividirse en multiples partes.

Ejemplo:

- gasto total `500`
- `200` para actividad `#24`
- `300` para gasto personal

Esto es nativo del sistema y no una opcion secundaria.

## Centros de costo

Todo se organiza por centros de costo:

- actividades
- gastos personales
- vehiculo
- otros

Cada parte de un movimiento debe asignarse a un centro de costo.

## Vehiculo

El vehiculo se trata como centro de costo especial.

Debe permitir:

- gastos
- kilometraje opcional
- litros opcionales

Con eso despues se busca generar:

- consumo promedio
- gasto total del vehiculo

## Clientes

Cada actividad puede tener un cliente asociado.

Se espera ver:

- deuda actual rapida
- historial completo expandible

## Cuentas

Se manejan multiples cuentas:

- caja
- bancos

Cada movimiento impacta en una cuenta.

## Reportes clave

El sistema debe soportar:

- ingresos por periodo
- egresos por periodo
- balance
- ingresos por tipo
- gastos por categoria
- resultado por actividad
- deuda e historial por cliente
- gasto y consumo de vehiculo

## Flujo esperado del usuario

- crear actividad
- registrar ingresos
- registrar gastos
- dividir movimientos si aplica
- asociar centros de costo
- consultar reportes

## Criterio UX

- flujo simple
- rapido
- sin duplicacion de datos
- registrar facil
- ver resultados rapido

## Regla de implementacion

Este contexto define el bloque funcional siguiente.

No obliga a resolver todo junto en una sola iteracion.

La implementacion debe bajar esto en etapas cortas sobre el shell ya publicado.
