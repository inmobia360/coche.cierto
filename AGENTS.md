# Contexto del proyecto

Auto1 Risk Lens es una extensión Chrome Manifest V3 que analiza datos visibles de vehículos de subasta en Auto1 y muestra un ranking y diagnóstico de riesgo orientativo. Su evolución prevista es una plataforma independiente que combine encaje de uso, asequibilidad, coste total, selección y verificación de compra.

## Flujo de desarrollo

Usar Spec-Driven Development: Constitución → Spec → Clarificación → Plan → Tareas → Implementación → Validación → Cambio. El agente principal es `AUTO-VALORADOR.md`.

## Archivos de contexto

- `docs/constitution.md`: principios innegociables.
- `Propuesta_Plataforma_Inteligente_Compra_Coche_Nuevo_Usado.md`: visión y modelo de negocio.
- `specs/`: requisitos aprobados por iniciativa.

## Reglas

- Leer la constitución y la spec activa antes de tocar código.
- No presentar estimaciones como hechos ni afirmar que una unidad está mecánicamente bien sin inspección profesional.
- No añadir integraciones, scraping, pagos, cuentas o datos personales sin spec y revisión de seguridad.
- Mantener compatibilidad con Chrome Manifest V3.

## Verificación

Tras cada cambio, revisar `manifest.json`, validar JavaScript con `node --check` cuando esté disponible y ejecutar las pruebas definidas por la iniciativa. Documentar cualquier prueba no ejecutada.
