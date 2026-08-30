# Spec 016 — Redacción asistida de informes

## Objetivo

Mejorar la claridad y personalización de los informes usando un LLM privado del VPS, sin delegar en el modelo los cálculos, puntuaciones, fuentes ni decisiones de seguridad.

## Alcance aprobado

- El frontend enviará únicamente respuestas de contexto, nunca email, nombre, teléfono, token ni identificadores.
- El backend construirá un contexto estructurado y calculará las reglas base.
- El LLM recibirá ese contexto y devolverá JSON limitado a textos de orientación.
- El backend validará tipos, longitud y campos permitidos; ante error usará textos deterministas.
- El PDF distinguirá hechos, estimaciones y comprobaciones pendientes.

## Criterios de aceptación

- La clave y la URL del LLM solo existirán en variables privadas del backend.
- El prompt no contendrá datos identificativos.
- La llamada tendrá timeout y límite de tamaño.
- Una caída del LLM no impedirá solicitar ni descargar el informe.
- La salida no podrá introducir cifras, garantías, diagnósticos mecánicos ni recomendaciones de marca/modelo.
- Se registrará solo el estado técnico de la llamada, sin prompt ni respuestas del usuario.
