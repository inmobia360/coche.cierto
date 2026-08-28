# AGENTS.md — coche.subasta

## Proyecto

Extensión Chrome para analizar vehículos de ocasión en subastas y priorizar oportunidades por rentabilidad ajustada al riesgo para un autónomo en España.

## Contexto obligatorio

- Leer `docs/constitution.md` antes de cambiar comportamiento.
- Leer la spec activa dentro de `specs/` antes de implementar.
- Si una decisión de negocio no está definida, preguntar antes de escribir código.
- No modificar `specs/` durante una implementación salvo que la tarea lo pida explícitamente.

## Comandos de verificación

- Sintaxis: `node --check src/risk-engine.js`, `node --check src/content.js`, `node --check popup.js`.
- Manifiesto: cargar `manifest.json` en `chrome://extensions` con modo desarrollador.
- Smoke test: abrir una lista y una ficha autorizada de Auto1 y comprobar ranking, puntuación y explicación.

## Reglas de producto

- El precio de compra no equivale al coste total puesto en stock.
- Datos ausentes reducen la confianza; no se convierten en señales positivas.
- El precio máximo de puja debe proteger el margen prudente y una reserva de contingencia.
- La fiscalidad, garantía, matriculación y documentación deben verificarse antes de recomendar una operación.
- No se ejecutan pujas ni compras automáticamente.

## Al terminar una tarea

Indicar la spec y los requisitos cubiertos, ejecutar las verificaciones disponibles, registrar cualquier incertidumbre y detenerse en el límite de la tarea asignada.
