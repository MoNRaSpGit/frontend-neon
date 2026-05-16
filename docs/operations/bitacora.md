# Neon - Bitacora

Fecha de actualizacion: 2026-05-16

## Regla de este archivo

Este documento si guarda detalle fino del modulo `neon`.

Aca corresponde anotar:

- que se hizo en el frontend
- donde quedo el piloto
- que pidio el cliente
- que flujo se esta validando
- que validaciones ya pasaron

## Corte actual

`neon` sigue en estado de validacion funcional con cliente.

## Ajuste validado del flujo comercial

Se corrigio el enfoque comercial de actividades despues de feedback directo del cliente.

Cambio principal:

- `Empresa A / B / C` deja de leerse como separacion operativa total
- pasa a leerse como control comercial de facturacion

Regla actual:

- una actividad puede nacer `pendiente de facturar`
- al pasarla a `facturado`, se elige empresa y fecha de factura
- el pendiente de cobrar se calcula desde los ingresos del diario asignados a esa actividad
- cuando los ingresos cubren el importe facturado, la actividad deja de aparecer en pendientes de cobro

Tambien quedo implementado:

- edicion de actividad desde modal
- un solo monto visible en actividad
- correccion del monto desde la misma edicion cuando haga falta

## Lectura vigente del producto

- `Diario` es la entrada principal del modulo
- `cuentas` son origen o destino del dinero
- `credito` agrega tarjeta y vencimiento
- un movimiento puede repartirse a multiples centros de costo
- `actividades` no son el eje contable
- `alquileres` quedan separados como flujo propio dentro del modelo

## Demo preparado para mostrar

Se dejo una base demo local pensada para mostrar:

- actividades facturadas por `Empresa A`
- actividades facturadas por `Empresa B`
- una actividad `pendiente de facturar` para pasarla a `facturado`
- casos con `pendiente de cobrar`
- casos ya `cobrados`
- movimientos y centros para `vehiculos`, `personal`, `alquileres` y `otros`
- ejemplos de ingreso, gasto, credito y movimiento dividido

## Corte 2026-05-14 - devolucion cliente

En este corte se implementaron y validaron tres pedidos principales del cliente:

- `traspaso` entre cuentas
- `explorar cuenta` con lectura puntual de movimientos
- `tipo personalizado` en centros de costo

### Traspaso

Quedo agregado como tipo operativo nuevo del diario.

Regla implementada:

- sale dinero de una cuenta
- entra el mismo importe en otra cuenta
- impacta saldos
- no se cuenta como ingreso real ni como gasto real en reportes

### Explorar cuenta

Quedo visible en `Reportes`.

Permite:

- elegir una cuenta puntual
- ver ingresos, gastos y traspasos asociados a esa cuenta
- borrar movimientos desde esa lectura
- usar el patron de lista de mostrar mas / mostrar todo / mostrar menos

### Centros de costo con tipo

Se mantuvieron los tipos base:

- `vehiculo`
- `personal`
- `alquiler`
- `otros`

Y ademas se agrego:

- `tipo personalizado`

## Ajuste de rendimiento

Despues de la prueba funcional aparecio una lentitud visible al escribir en inputs.

Se corrigio:

- desmontando vistas no activas
- evitando calculos pesados de `Reportes` fuera de esa vista

Resultado esperado:

- inputs mas fluidos en `Diario`
- menos riesgo de degradacion UX por crecimiento de listas

## Validacion tecnica del corte 2026-05-14

Validaciones ejecutadas:

- `npm run lint` OK
- `npm run typecheck` OK
- `npm run test:smoke` OK
- `npm run build` OK

Validacion real aplicada:

- `traspaso` probado manualmente
- `explorar cuenta` probado manualmente
- ajuste visual de resumen de traspaso probado manualmente
- mejora de rendimiento percibida y revalidada manualmente

## Ajustes finales de UX y texto

En el mismo corte se cerraron detalles chicos pero importantes:

- `Explorar cuenta` ahora muestra `fecha - hora`
- se saneo encoding para eliminar mojibake visible
- el flujo `Limpiar` / `Restaurar demo` dejo de usar confirmacion nativa del navegador y paso a modal propio
- el modal se reescribio con lenguaje cliente

## Recomendacion actual

No meter mas cambios grandes hasta recibir devolucion del cliente.

Conviene retomar desde:

1. prueba real del flujo de actividades
2. feedback sobre lenguaje, centros y reportes
3. confirmacion de direccion
4. recien despues endurecer modelo, UX y persistencia formal
