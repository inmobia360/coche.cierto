# Spec 022 — Buscador local de concesionarios

## Estado

Propuesta implementable en modo demo; pendiente de activar Google Places y de revisión legal específica.

## Objetivo

Permitir que una persona que ya ha recibido su orientación encuentre opciones de contacto locales, ordenadas por distancia, sin convertir la recomendación técnica en una recomendación comercial.

## Alcance de esta primera entrega

- Página independiente `/concesionarios/`.
- Búsqueda por municipio, código postal o zona aproximada introducida por el usuario.
- Radio de 5, 10, 25 o 50 km.
- Resultados de demostración claramente etiquetados como simulados.
- Canales de contacto representados sin enviar datos del usuario.
- Eventos locales sin PII.
- Enlace desde el resultado del valorador, sin bloquear ni pedir ubicación para completar el diagnóstico.

## Fuera de alcance

- Activar Google Places sin clave, facturación, atribución y revisión de términos.
- Enviar leads o datos personales a concesionarios.
- Ordenar por patrocinio, comisión o pago.
- Guardar coordenadas exactas o domicilio.
- Copiar masivamente datos de Google en una base propia.
- Solicitar valoraciones de usuarios o crear perfiles comerciales.

## Criterios de aceptación

- El diagnóstico sigue llegando al resultado sin pasar por el buscador.
- El buscador funciona sin ubicación del dispositivo y explica que el modo demo no son datos reales.
- El radio es seleccionable por teclado y móvil.
- La lista se ordena de menor a mayor distancia.
- Cada canal de contacto muestra su acción y emite un evento local sin email, coordenadas ni respuestas.
- No hay API externa ni secreto en el frontend cuando `GOOGLE_PLACES_ENABLED` no está activado.
- `node --check` pasa en los scripts nuevos y existentes.

## Fases posteriores

1. Matriz de viabilidad y autorización de Google Places.
2. Proxy backend con `Nearby Search (New)` y `Place Details (New)`, usando FieldMask mínimo.
3. Persistencia únicamente de `place_id` y eventos agregables.
4. Panel estadístico con umbrales de privacidad.
5. PDF descargable de necesidades.
6. Compartición con terceros solo con consentimiento específico.

