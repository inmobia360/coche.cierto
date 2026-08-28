# Spec 001 — MVP de diagnóstico de riesgo Auto1

## Objetivo

Priorizar vehículos visibles en Auto1 por riesgo orientativo y explicar las señales detectadas sin afirmar una garantía mecánica.

## Usuarios

Compradores profesionales o particulares que consultan listados y fichas de Auto1 en Chrome.

## Requisitos funcionales

- RF-1: CUANDO el usuario abra una lista compatible, EL SISTEMA mostrará hasta cinco vehículos visibles ordenados por riesgo ascendente.
- RF-2: CUANDO el usuario abra una ficha compatible, EL SISTEMA mostrará una puntuación de 0 a 100 y su nivel interpretativo.
- RF-3: CUANDO existan datos visibles de kilometraje, año, daños o historial, EL SISTEMA los usará como factores explicables.
- RF-4: SI faltan datos, ENTONCES EL SISTEMA los tratará como incertidumbre y no como evidencia de buen estado.
- RF-5: CUANDO el usuario configure kilometraje o antigüedad, EL SISTEMA guardará esos criterios y los aplicará al cálculo posterior.
- RF-6: EL SISTEMA deberá indicar que el resultado es orientativo y no sustituye inspección mecánica ni comprobación documental.

## Fuera de alcance

Pujas automáticas, compras vinculantes, scraping no autorizado, tasación definitiva, aprobación de crédito, diagnóstico mecánico remoto y ranking patrocinado.

## Finalización

La extensión carga sin errores, el motor produce resultados reproducibles, la UI funciona en lista y ficha, y cada RF queda validado con prueba o comprobación manual.

## Dudas abiertas

- Selectores y textos de Auto1 pueden cambiar; falta una página real de prueba automatizada.
- Deben definirse casos de datos ambiguos y navegación SPA con pruebas de integración.
