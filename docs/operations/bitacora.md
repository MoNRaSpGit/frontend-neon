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

## Corte 2026-05-27 - proveedores y creditos separados del diario

En este corte se aplico el cambio de criterio pedido por cliente para separar mejor:

- el alta del proveedor
- la carga de compras o recibos pendientes
- el pago real desde caja o banco

### Proveedores

Quedo agregado:

- ficha de `proveedores`
- campos de `direccion`, `telefono` y `notas`
- proveedor fijo `Proveedor generico`

Regla implementada:

- ya no se carga proveedor a mano libre en salidas nuevas
- diario y creditos usan un proveedor registrado

### Creditos

Quedo agregado un modulo `Creditos`.

Permite cargar:

- `compras`
- `recibos`
- `prestamos`

Y en cada pendiente definir:

- proveedor
- fecha
- vencimiento
- importe
- documento o detalle
- a que sector va cada gasto

Regla implementada:

- el destino del gasto se define al crear el pendiente
- cuando despues se paga desde diario, ya no se vuelve a pedir centro de costo

### Diario

Se ajusto el flujo de salidas.

Regla actual:

- `Diario` usa solo `Caja` y `Bancos` para mover plata real
- si el gasto es directo, sigue pidiendo proveedor y asignacion
- si el gasto es `pago de pendiente`, pide proveedor registrado e importe
- el pago se aplica contra pendientes del proveedor desde el mas viejo al mas nuevo

### Reportes

La deuda pendiente dejo de leerse por tarjeta y paso a leerse por proveedor.

Ahora se ve mejor:

- deuda pendiente unificada con filtros por vencimiento
- detalle de monto original, pagado y pendiente
- historial de pagos aplicados dentro del mismo pendiente

### Ajustes finos posteriores del mismo corte

Tambien quedo ajustado:

- `Reportes` como ultima pestana del workspace
- proveedores nuevos primero en su lista
- pendientes nuevos primero en su lista
- `Pagos realizados` separado de `Deuda pendiente`
- `Pagos realizados` muestra solo pendientes ya cerrados con `saldo 0`
- el detalle de pagos se ve apilado, un pago por renglon
- cada pendiente cerrado permite `Exportar PDF`

Regla actual de lectura:

- si una deuda tiene saldo pendiente, queda solo en `Deuda pendiente`
- si la deuda ya quedo cancelada, pasa a `Pagos realizados`
- el PDF se descarga directo desde navegador

### Validacion tecnica del corte 2026-05-27

Validaciones ejecutadas:

- `npm run typecheck` OK
- `npm run lint` OK
- `npm run test` OK
- `npm run test:smoke` OK
- `npm run build` OK

## Corte 2026-05-26 - ajustes finos en cuentas y credito

En este corte se aplicaron cambios de UX puntuales pedidos durante la validacion del piloto.

### Cuentas

Quedo agregado:

- crear cuentas de tipo `credito` con `fecha limite de pago`
- mostrar esa fecha en `Cuentas`
- mostrar esa fecha tambien en `Reportes > Saldos de cuentas`
- lectura visible tipo `Vence en X dias` o `Vencido hace X dias`

Tambien quedo agregado:

- `Editar` cuenta
- `Eliminar` cuenta

Regla implementada:

- si una cuenta ya tiene movimientos, no se deja editar
- si se borra una cuenta en modo prueba, tambien se borran sus movimientos asociados para mantener consistencia
- la edicion de cuenta se hace desde modal propio

### Diario

Se simplifico el bloque de salida del diario.

Quedo removido del formulario visible:

- `Tarjeta`
- `Vencimiento`
- `Pago de tarjeta` como tipo visible del flujo

Regla actual del corte:

- el diario queda mas corto y directo para carga real
- los movimientos nuevos ya no exigen esos campos en UI

### Ajuste visual

La `fecha limite` se remarco de forma sutil:

- sin pastilla
- sin fondo extra
- solo texto en tono naranja oscuro

### Validacion tecnica del corte 2026-05-26

Validaciones ejecutadas:

- `npm run typecheck` OK
- `npm run test -- --run src/features/neon/neon.v2.dashboard.test.ts` OK
- `npm run test:smoke` OK
- `npm run lint` OK
- `npm run build` OK

Validacion funcional aplicada:

- alta de cuenta credito con fecha limite
- lectura de fecha limite en cuentas
- lectura de fecha limite en reportes
- edicion de cuenta desde modal
- borrado de cuenta con limpieza de movimientos asociados
- bloqueo de edicion para cuentas con movimientos

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
