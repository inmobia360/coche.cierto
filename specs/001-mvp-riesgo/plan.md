# Plan técnico — Spec 001

- `src/risk-engine.js`: cálculo puro de riesgo y veredictos; cubre RF-2 a RF-5.
- `src/content.js`: extracción y renderizado en lista/ficha; cubre RF-1, RF-3, RF-4 y RF-6.
- `popup.*`: configuración persistente; cubre RF-5.
- `manifest.json`: carga ordenada de motor, contenido y estilos.

## Validación

Ejecutar `node --check` sobre los JavaScript. Verificar manualmente carga de extensión, lista, ficha, popup, datos ausentes y cambio de ruta SPA. Añadir tests unitarios del motor antes de ampliar lógica de negocio.
