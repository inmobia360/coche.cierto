# Activo P0 — Checklist de revisión y riesgos

## Alcance beta local

La ruta canónica `/que-revisar-coche-segunda-mano/` ofrece una checklist interactiva para ordenar comprobaciones antes de comprar un coche usado. Procesa las respuestas en el navegador, no las persiste y no solicita email.

## Estados

Cada comprobación debe estar en uno de estos estados:

- `confirmed`: el usuario declara que lo ha comprobado;
- `pending`: todavía no está comprobado;
- `mismatch`: la documentación o la observación no coincide;
- `alert`: existe una señal que justifica frenar.

`pending` nunca se interpreta como correcto. El resultado debe mantener separadas las confirmaciones de las alertas y recomendar documentación, prueba e inspección profesional cuando proceda.

## Eventos locales

Se emiten `landing_view`, `tool_start`, `tool_complete`, `valuation_start` y `next_action` mediante el evento local `cochecierto:event`, con `source_page`, `cluster=risk` y `version=p0-v1`. No se incluyen respuestas detalladas, identidad, email, URL de anuncio ni tokens.

## Criterios de aceptación

- El usuario obtiene el resumen sin email.
- El resumen diferencia confirmadas, pendientes y alertas/incoherencias.
- La CTA conserva `source=review-checklist&intent=risk` al entrar en el valorador.
- La página tiene title, description, canonical, H1, Open Graph, schema y enlace a fuente oficial.
- La interfaz funciona con teclado, es responsive y no afirma diagnóstico mecánico ni garantía.
