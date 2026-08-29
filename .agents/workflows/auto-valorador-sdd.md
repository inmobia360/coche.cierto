# Flujo operativo de AUTO-VALORADOR

## Puerta 0 — alcance

`PRODUCTO-SDD` identifica iniciativa, usuario, problema, fuera de alcance y spec aplicable. Si no existe spec aprobada, el proceso se detiene en propuesta.

## Puertas consecutivas

1. Constitución y restricciones.
2. Spec y criterios observables.
3. Clarificación de decisiones abiertas.
4. Plan mínimo y tareas acotadas.
5. Handoffs entre perfiles.
6. Implementación por `INGENIERIA`.
7. Validación funcional, responsive, seguridad y regresión por `QA-VALIDACION`.
8. Registro del cambio y riesgos pendientes.

## Formato de handoff

```text
De: SUBAGENTE
A: SUBAGENTE
Objetivo:
Entradas leídas:
Archivos afectados:
Hechos comprobados:
Supuestos:
Decisiones:
Evidencia:
Criterios de aceptación:
Riesgos/bloqueos:
Preguntas abiertas:
Siguiente acción:
```

## Stop conditions

Detener y elevar al agente principal si falta autorización, hay datos personales sensibles, una afirmación legal/financiera/mecánica no verificable, una fuente sin licencia, conflicto entre spec y código, o una acción externa irreversible.

## Política de referencias externas

La interfaz pública no mencionará literalmente foros, plataformas, portales ni fuentes externas específicas como respaldo de opiniones, precios, riesgos o recomendaciones sin autorización previa. Los enlaces externos solo se permitirán para ampliar información o visitar sitios oficiales de verificación. La investigación interna de los subagentes no se mostrará como validación de una unidad.
