# Neon - Pre Entrega Prueba 1

Fecha: 2026-05-07

## Actualizacion De Cierre Local

Queda asentado este corte como referencia interna.

Estado al cerrar esta pasada:

- el cliente ya esta usando la app
- por eso se decide no seguir tocando flujo fuerte en este momento
- cualquier cambio nuevo deberia entrar solo si destraba algo importante o si el cliente lo pide explicitamente

## Donde Quedamos Hoy

La interpretacion correcta del pedido del cliente ya no es:

- `Neon` por un lado
- `Móviles audiovisuales` por otro

La separacion correcta ahora es:

- `Empresa A`
- `Empresa B`

Y dentro de cada empresa siguen existiendo sus lineas:

- `Neon`
- `Móviles audiovisuales`
- `Otros`

Eso ya quedo ajustado en el frontend para que la empresa activa sea la empresa real y no la linea de trabajo.

## Pendiente De Subir

Queda pendiente de subir una mejora chica del aviso de actualizacion del frontend.

La mejora ya quedo hecha en local pero no se sube todavia porque:

- el cliente esta usando la app ahora
- no queremos meter un deploy extra sin necesidad inmediata

La mejora pendiente es esta:

- ademas del chequeo por intervalo, el cartel de `hay una version nueva disponible` vuelve a chequear cuando la pestana recupera foco o vuelve a estar visible

Objetivo de esa mejora:

- hacer mas confiable la deteccion de nuevas versiones
- evitar el caso donde el navegador duerme la pestana y no corre el chequeo a tiempo

## Criterio Para Retomar

Antes de volver a tocar producto conviene esperar una de estas dos cosas:

1. devolucion directa del cliente usando esta version
2. necesidad clara de subir la mejora pendiente del cartel de actualizacion

## Estado General

La base actual de `Neon` esta en un punto funcional y bastante estable para una primera prueba real con usuario.

El sistema ya permite:

- trabajar con dos empresas: `Neon` y `Audiovisual`
- cargar y persistir datos de prueba en el frontend
- manejar centros de costo por empresa
- usar esos centros en libro diario y reportes
- registrar actividades con datos de facturacion
- derivar mejor el estado comercial segun factura y cobros reales

## Cambios Principales Incluidos

### 1. Empresa activa

Se agrego un selector visible para alternar entre:

- `Neon`
- `Audiovisual`

Lo nuevo que se carga ya queda asociado a esa empresa.

### 2. Centros de costo

Se agrego una pestaña propia de `Centros`.

Desde ahi ahora se puede:

- crear centros nuevos
- separarlos por tipo
- gestionarlos por empresa
- corregir un centro si fue creado mal
- borrar un centro

Protecciones activas:

- si un centro ya fue usado en movimientos, no se deja editar
- si un centro ya fue usado en movimientos, no se deja borrar
- al borrar, pide confirmacion extra

### 3. Reportes

La lectura por centros de costo fue refinada.

Ahora el flujo es:

1. elegir tipo de centro
2. elegir centro puntual
3. opcionalmente elegir cuenta
4. opcionalmente buscar por texto

Esto ya toma los centros creados en la pestaña `Centros`.

### 4. Actividades y facturacion

En actividades se agrego soporte para:

- fecha de factura
- importe facturado
- empresa emisora

La empresa emisora se toma desde la empresa activa.

### 5. Estados comerciales

Se saco del formulario la carga manual de `pendiente de cobrar`.

Ahora el criterio apunta a:

- `pendiente de facturar`
- `facturado`
- y despues el sistema interpreta el estado operativo real segun cobros

En la practica:

- si no esta facturado: pendiente de facturar
- si esta facturado pero falta cobrar: pendiente de cobrar
- si esta facturado y ya se cobro: cobrado

## Validacion Tecnica

Resultado del PF tecnico:

- `build`: OK
- `tests`: OK
- `lint`: OK

No se encontraron errores de compilacion ni de chequeo estatico para esta pasada.

## Alcance Real De Esta Prueba

Esta prueba sigue montada sobre modo demo local del frontend.

Eso significa:

- no depende del backend para operar
- los datos persisten localmente en el navegador
- sirve muy bien para validacion funcional y de flujo
- no debe leerse todavia como integracion final productiva

## Riesgos / Cosas A Mirar Manana

### 1. Expectativa de persistencia

Los datos quedan guardados localmente en el navegador donde se prueba.

Hay que validar con el usuario si esa sensacion de persistencia le alcanza para la etapa actual.

### 2. Flujo comercial

El criterio nuevo de estado comercial esta mucho mas alineado con lo que pidio el cliente, pero mañana conviene mirar si:

- entiende bien cuando algo pasa de `facturado` a `pendiente de cobrar`
- le resulta natural ver el estado derivado
- no extraña el control manual anterior

### 3. Centros de costo

La estructura nueva ya escala mejor, pero mañana conviene probar si:

- entiende rapido la pestaña `Centros`
- el tipo elegido le resulta claro
- `Otros` como generico le alcanza o necesita otra categoria mas clara

### 4. Reportes

La logica mejoro, pero conviene validar si el usuario encuentra rapido:

- tipo de centro
- centro puntual
- lectura de resultados

El objetivo manana no es solo ver si "anda", sino si se entiende sin explicacion larga.

## Guion Corto De Prueba Recomendada

### Bloque 1. Empresa

1. Entrar en `Neon`
2. cambiar entre `Neon` y `Audiovisual`
3. confirmar que cambian actividades, centros y reportes visibles

### Bloque 2. Centros de costo

1. crear un centro nuevo en cada empresa
2. crear uno en tipo correcto
3. crear uno en tipo incorrecto y corregirlo antes de usarlo
4. borrar uno sin uso
5. intentar borrar o editar uno ya usado y confirmar que el sistema lo frena

### Bloque 3. Libro diario

1. cargar ingreso
2. cargar gasto
3. asignar centros de costo nuevos
4. probar actividad, vehiculo, alquiler, personal y otros

### Bloque 4. Actividades

1. crear actividad sin facturar
2. crear actividad facturada con fecha e importe
3. confirmar que la empresa activa queda respetada
4. revisar como se muestra el estado comercial

### Bloque 5. Reportes

1. entrar a reportes
2. elegir tipo de centro
3. elegir centro puntual
4. filtrar por cuenta
5. usar busqueda
6. comprobar si la lectura le resulta clara al usuario

## Criterio De Exito Para Manana

La prueba de manana deberia considerarse positiva si logramos esto:

- el usuario entiende la separacion por empresa
- logra crear y usar centros sin trabarse
- encuentra informacion en reportes sin ayuda excesiva
- entiende mejor el flujo de facturacion / cobro
- aparecen errores chicos de UX, pero no errores graves de flujo ni de consistencia

## Conclusion

La version actual ya esta apta para una primera prueba real de uso.

No la veo como "terminada", pero si como una base lo bastante seria para que el usuario empiece a tensarla y nos muestre:

- donde se confunde
- donde falta velocidad
- donde la logica de negocio todavia necesita afinarse

Ese es exactamente el tipo de devolucion que esta prueba deberia buscar.
