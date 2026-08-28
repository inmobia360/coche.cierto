# Plan técnico

- `src/risk-engine.js`: cálculo puro y veredictos (RF-2 a RF-5).
- `src/content.js`: extracción y UI en lista/ficha (RF-1, RF-3, RF-4, RF-6).
- `popup.*`: criterios persistentes (RF-5).
- `manifest.json`: carga ordenada del motor y contenido.

Validar con `node --check`, carga manual en Chrome, lista, ficha, popup, datos ausentes y navegación SPA.
