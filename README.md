# frontend-neon

Frontend del producto `neon` dentro de `SaasPro`.

## Estado actual

- piloto funcional en validacion con cliente
- auth SaaS conectado
- routing protegido
- persistencia demo/local para el flujo principal del piloto

## Regla importante de este corte

Hoy `neon` sigue funcionando como piloto de producto.

Eso significa:

- la experiencia visible se valida desde frontend
- el flujo principal de demo persiste localmente en navegador
- la bajada formal a backend todavia no es la prioridad del modulo

Cuando el piloto quede cerrado:

- se baja el flujo validado a persistencia formal en backend

## Documentacion

- arquitectura general del SaaS: `backend/docs`
- documentacion propia del modulo: `frontend-neon/docs`
