# Contexto del proyecto: CocheCierto

CocheCierto es una plataforma digital inteligente concebida como asesor independiente para la toma de decisión de compra de vehículos (nuevo, km 0, seminuevo y ocasión). Combina encaje de uso y perfil de vida, asequibilidad financiera y TCO (Coste Total de Propiedad), diagnóstico de riesgos e incertidumbres y recomendaciones accionables.

## Flujo de desarrollo

Usar Spec-Driven Development (SDD): Constitución → Spec → Clarificación → Plan → Tareas → Implementación → Validación → Cambio. El agente orquestador principal es COCHECIERTO.md (o AUTO-VALORADOR.md).

## Archivos de contexto

- docs/constitution.md: principios innegociables de CocheCierto.
- docs/Propuesta_Maestra_Marca_CocheCierto.md: identidad, promesa y estrategia de marca.
- docs/Propuesta_Plataforma_Inteligente_Compra_Coche_Nuevo_Usado.md: modelo de producto y negocio.
- specs/: requisitos y especificaciones aprobadas por iniciativa.

## Reglas innegociables

- Leer la constitución y la spec activa antes de modificar código.
- No presentar estimaciones como hechos ni afirmar que una unidad está mecánicamente impecable sin inspección presencial o peritaje oficial.
- No añadir integraciones externas, analíticas no declaradas, pagos o tratamiento de datos personales sin spec aprobada y revisión de seguridad.
- Mantener la separación limpia y modular entre el Frontend web (mvp-valorador/) y el Backend API (ackend/).

## Verificación

Tras cada cambio, validar JavaScript con 
ode --check, verificar la integridad de enlaces/rutas y ejecutar las pruebas definidas en la spec. Documentar cualquier prueba o evidencia.
