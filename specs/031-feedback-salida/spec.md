# Spec 031 · Feedback de salida del valorador

## Objetivo

Capturar una opinión breve y voluntaria de usuarios que abandonan el valorador para mejorar la beta. La captura es propia y separada de Meta Ads.

## Límites

- No se guardan email, nombre, teléfono, IP ni respuestas del cuestionario.
- Se conserva únicamente un identificador temporal de sesión, ruta, dispositivo, UTM de origen y respuesta agregable.
- No se envía información a terceros.
- El CRM muestra solo agregados y nunca sustituye métricas publicitarias.

## Requisitos

- Mostrar tras interacción y salida por la parte superior en escritorio.
- No mostrar durante el primer segundo, al completar una respuesta o durante 30 días tras cierre.
- Permitir cerrar sin responder.
- Validar y limitar la entrada en backend, con rate limiting.
- Exigir migración explícita antes de almacenar datos.

## Fuera de alcance

Perfilado publicitario, Meta Pixel/CAPI, identificación persistente entre dispositivos y análisis de texto individual.

## Aceptación

- `POST /api/exit-feedback` rechaza identificadores o respuestas inválidas.
- `GET /api/crm/exit-feedback` requiere `crmGuard` y devuelve conteos agregados.
- La migración es `004_exit_feedback_up.sql` y tiene reversión equivalente.
