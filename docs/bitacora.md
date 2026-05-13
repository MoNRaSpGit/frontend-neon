# Neon - Bitacora

Fecha de actualizacion: 2026-05-13

## Regla de este archivo

Este documento si puede guardar detalle fino del modulo `neon`.

Aca si corresponde anotar:

- que hicimos hoy
- donde quedamos
- que pidio el cliente
- que flujo se esta validando
- que validaciones ya pasaron

## Corte actual

`neon` queda en estado de validacion funcional con cliente.

## Ajuste validado en este corte

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

## Lo que queda como lectura vigente

- `Diario` es la entrada principal del modulo
- `cuentas` son origen o destino del dinero
- `credito` agrega tarjeta y vencimiento
- un movimiento puede repartirse a multiples centros de costo
- `actividades` no son el eje contable
- `alquileres` quedan separados como flujo propio dentro del modelo

## Donde quedamos

La recomendacion actual es no meter mas cambios grandes hasta recibir devolucion del cliente.

Conviene retomar desde:

1. prueba real del flujo de actividades:
   - pendiente de facturar
   - facturado
   - pendiente de cobrar
   - cobrado
2. confirmar con cliente si la diferencia entre monto presupuestado y monto final necesita tratamiento especial o no
3. feedback sobre lenguaje, centros y reportes
4. recien despues endurecer modelo y UX final

## Demo preparado para mostrar al cliente

Se dejo un seed demo local pensado para grabar el flujo comercial validado.

El caso armado hoy deja visible:

- actividades facturadas por `Empresa A`
- actividades facturadas por `Empresa B`
- una actividad `pendiente de facturar` para pasarla a `facturado` durante la demo
- casos con `pendiente de cobrar`
- casos ya `cobrados`
- movimientos y centros para `vehiculos`, `personal`, `alquileres` y `otros`
- ejemplos de ingreso, gasto, credito y movimiento dividido

La idea de este seed es que el video pueda mostrar sin inventar datos en vivo:

- que `Empresa A / B / C` son control comercial
- que la empresa se elige al facturar la actividad
- que el reporte de `pendiente de cobrar` y `facturado en el año` cambia por empresa

## Ajuste final del diario

En la ronda final de correcciones quedo afinado el flujo de `Ingreso` contra `Actividad`:

- en `Ingreso`, el selector de actividad muestra solo actividades con saldo pendiente
- al elegir una actividad, `Importe total` muestra el pendiente completo como referencia
- el monto real cobrado se carga en la linea de asignacion
- si el cobro es parcial, la actividad conserva el resto como `pendiente de cobrar`
- si se cambia de `Ingreso` a `Gasto`, o se cambia el destino a otro centro de costo, el monto guiado se reinicia

## PF tecnico de este cierre

Validaciones ejecutadas en `frontend-neon`:

- `npm run lint` OK
- `npm run typecheck` OK
- `npm run test:smoke` OK
- `npm run build` OK

Observacion:

- `npm test` no corrio por una restriccion del entorno local (`EPERM` sobre `C:\\Users\\ju4nr`) antes de ejecutar suites, asi que no se detecto un fallo funcional del modulo desde ese comando general

## Referencia historica relacionada

Para el corte de prueba anterior:

- [Pre entrega prueba 1](./neon-pre-entrega-prueba-1.md)
