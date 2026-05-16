# Neon Docs

Fecha de actualizacion: 2026-05-16

## Objetivo

Esta carpeta documenta el producto `neon` del lado frontend.

Su funcion es dejar claro:

- que problema resuelve el modulo
- como se interpreta hoy el piloto
- cual es el estado visible actual de la UI
- como esta pensado tecnicamente el frontend
- que cambios finos se fueron haciendo en el modulo

## Alcance

`frontend-neon/docs` documenta:

- comportamiento real del frontend `neon`
- lenguaje del producto en piloto
- estructura funcional visible
- decisiones finas de UX del modulo
- estado actual del demo local
- bitacora operativa del frontend

No documenta:

- arquitectura general del SaaS
- reglas globales de auth, tenant, billing o core
- decisiones estructurales del backend compartido

Eso vive en `backend/docs`.

## Orden recomendado de lectura

1. [Estado actual del frontend](./product/current-state.md)
2. [Contexto funcional del producto](./product/product-context.md)
3. [Diseno tecnico del piloto](./product/technical-design.md)
4. [Bitacora del modulo](./operations/bitacora.md)
5. [Archivo historico](./archive/pre-entrega-prueba-1.md)

## Estructura de esta carpeta

### `product/`

Define el producto y su corte actual:

- estado visible del frontend
- contexto funcional
- diseno tecnico del piloto

### `operations/`

Guarda el seguimiento fino del modulo:

- que se cambio
- que se valido
- donde quedamos

### `archive/`

Guarda referencias historicas de pruebas anteriores que ya no son la foto principal.

## Regla de lectura

Si hay contradiccion entre una nota vieja y esta carpeta:

- manda esta carpeta

Si hay contradiccion entre una regla global del SaaS y este modulo:

- manda `backend/docs`

## Regla importante de este corte

Hoy `neon` sigue en estado de piloto.

La persistencia principal validada para demo sigue siendo local al frontend.

La bajada formal a backend quedara para el momento en que el cliente confirme:

- que el flujo del producto ya cerro
- que el lenguaje actual es el correcto
- que el modelo ya esta listo para endurecerse
