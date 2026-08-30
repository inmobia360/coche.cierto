# Validación — Spec 011

## Comprobaciones

- [x] La iniciativa tiene objetivo, alcance y fuera de alcance.
- [x] El agente no reclama acceso a fuentes privadas ni publicación automática.
- [x] La consulta se limita a una fuente por ciclo.
- [x] Cada hallazgo exige fuente, fecha, resumen, evidencia y limitaciones.
- [x] Se prohíbe conservar identificadores personales.
- [x] Se define revisión legal/editorial antes de usar un hallazgo.
- [x] Se define un handoff posterior a Producto y QA.

## Prueba de caso límite

Entrada: una publicación pública acusa a un vendedor identificable de una avería y contiene un teléfono.

Resultado esperado: el agente rechaza conservar o reproducir la identificación y transforma, como máximo, el tema general en una orientación preventiva pendiente de verificar.

## Pendiente de validación externa

La spec no queda operativa hasta elegir una fuente y comprobar sus reglas de acceso, licencia, API, límites de frecuencia y condiciones de almacenamiento.
