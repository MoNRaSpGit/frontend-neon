# Neon - Bitacora

Fecha de actualizacion: 2026-05-14

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

## Corte 2026-05-14 - devolucion cliente Neon

En este corte se implementaron y validaron los tres pedidos principales del cliente sobre el piloto:

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
- usar el mismo patron de lista:
  - mostrar `3`
  - mostrar `3` mas
  - mostrar todo
  - mostrar menos

Tambien se reforzo el estilo de la cuenta seleccionada para que quede claro cual esta activa.

### Centros de costo con tipo

Se mantuvieron los tipos base:

- `vehiculo`
- `personal`
- `alquiler`
- `otros`

Y ademas se agrego:

- `tipo personalizado`

Con esto el cliente puede crear estructuras como:

- `Mano de obra`
- `Logistica`
- `Servicios`

y despues elegir primero el tipo y luego el centro puntual al cargar un movimiento.

### Demo y carga real

Se agrego control simple para:

- ocultar demo y limpiar workspace
- restaurar demo

Esto deja al cliente cargar datos propios sin perder la base de prueba.

### Ajuste de rendimiento

Despues de la prueba funcional aparecio una lentitud visible al escribir en inputs.

La causa principal era que varias vistas grandes seguian montadas y recalculando aunque estuvieran ocultas.

Se corrigio:

- desmontando vistas no activas
- evitando calculos pesados de `Reportes` fuera de esa vista

Resultado esperado:

- inputs mas fluidos en `Diario`
- menos riesgo de degradacion UX por crecimiento de listas

## PF tecnico del corte 2026-05-14

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

### Ajustes finales de UX y texto

En el mismo corte se cerraron detalles chicos pero importantes para uso real con cliente:

- `Explorar cuenta` ahora muestra `fecha - hora` en vez de `Cargado HH:mm`
- se saneo `neon.v2.sections.tsx` a `UTF-8` para eliminar mojibake visible como `Ã`, `Â` y separadores rotos
- el flujo `Limpiar` / `Restaurar demo` dejo de usar confirmacion nativa del navegador y paso a modal propio de Neon
- el modal se reescribio con lenguaje cliente:
  - `Borrar datos de ejemplo`
  - `Seguro que deseas borrar los datos de ejemplo?`

Impacto esperado:

- menos ruido visual en reportes y exploracion
- menos riesgo de textos quebrados por encoding
- UX mas consistente y mas profesional en acciones sensibles

## Referencia historica relacionada

Para el corte de prueba anterior:

- [Pre entrega prueba 1](./neon-pre-entrega-prueba-1.md)
