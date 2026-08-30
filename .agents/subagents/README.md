---
name: cochecierto-subagents
description: Perfiles portables de subagentes para ejecutar AUTO-VALORADOR con trazabilidad SDD.
---

# Subagentes de CocheCierto

Estos perfiles convierten los roles definidos en `AUTO-VALORADOR.md` en instrucciones reutilizables. Son deliberadamente portables: el agente principal los activa según la spec y conserva la decisión final.

## Regla de activación

Antes de activar un perfil se leen, en este orden: `AGENTS.md`, `docs/constitution.md`, la spec activa y el contexto específico de la tarea. Se activa el mínimo equipo necesario.

## Contrato común de salida

Todo subagente debe devolver:

- objetivo y alcance ejecutado;
- entradas y archivos leídos;
- archivos afectados (o `ninguno`);
- decisiones y supuestos separados de los hechos;
- evidencia y criterios de aceptación;
- riesgos, bloqueos y preguntas abiertas;
- siguiente handoff recomendado.

No puede desplegar, publicar, enviar comunicaciones, comprar servicios, usar secretos ni introducir scraping o integraciones sin autorización y spec.

## Orden por defecto

`PRODUCTO-SDD → PERSONAS-SEGMENTACION/TAXONOMIA-VEHICULOS → FINANZAS-TCO/AUTO-RIESGO → INFORME-ACCIONABLE → UX-CONTENIDO/COPY-MENSAJE → LEGAL-CONFIANZA/SEGURIDAD-DATOS → INGENIERIA → QA-VALIDACION`.

`DATOS-MERCADO`, `PRECIO-OCASION`, `INE-CONTEXTO`, `SEO-AEO-GEO`, `CONVERSION-CRM`, `EMAIL-CICLO-VENTA`, `SOCIAL-CONTENIDO`, `NEGOCIO-ESCALA`, `ENERGIA-MOVILIDAD` y `foro-coches` se activan solo cuando la spec lo requiera.

## Perfiles

- [PRODUCTO-SDD](PRODUCTO-SDD.md)
- [INGENIERIA](INGENIERIA.md)
- [QA-VALIDACION](QA-VALIDACION.md)
- [SEGURIDAD-DATOS](SEGURIDAD-DATOS.md)
- [UX-CONTENIDO](UX-CONTENIDO.md)
- [INFORME-ACCIONABLE](INFORME-ACCIONABLE.md)
- [TAXONOMIA-VEHICULOS](TAXONOMIA-VEHICULOS.md)
- [FINANZAS-TCO](FINANZAS-TCO.md)
- [foro-coches](foro-coches.md)

Los demás roles de `AUTO-VALORADOR.md` permanecen como especializaciones gobernadas por este contrato hasta que una iniciativa necesite un perfil más detallado.
# Perfiles de subagentes

Los perfiles de esta carpeta son instrucciones de trabajo. Cada iniciativa debe mantener una spec, criterios de validación y un handoff explícito.

## Inteligencia editorial

`INTELIGENCIA-EDITORIAL.md` trabaja junto a `LEGAL-CONFIANZA`, `COPY-MENSAJE`, `PRODUCTO-SDD` y `QA-VALIDACION`. Su documentación operativa está en `docs/editorial-intelligence/` y su spec es la `011`.
