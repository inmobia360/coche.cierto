# Propuesta de release — valorador de baja fricción

## Estado

Implementado en local. No hacer push ni desplegar hasta completar la validación indicada abajo.

## Cambios

- Eliminado el bloque repetitivo `valuator-seo-extended` y su FAQPage asociada.
- Reducido el flujo privado a nueve preguntas esenciales.
- Eliminada la pantalla de resumen intermedia.
- Sustituida la selección basada en botones/sliders por radios nativos dentro de un `fieldset`.
- Conservadas las preguntas profesionales como recorrido condicional.

## Validación previa

1. Ejecutar `node --check valorador/app.js`.
2. Servir el sitio localmente y probar ruta privada, ruta profesional, navegación atrás y edición desde resultado.
3. Verificar teclado, foco visible, móvil y ausencia de scroll horizontal.
4. Revisar que no se ha roto el contrato de leads y decidir si la versión de cuestionario permanece en `v1` o pasa a una nueva versión.
5. Registrar métricas base: inicio, avance por pregunta, finalización, resultado visto y siguiente acción.

Resultado actual: `node --check valorador/app.js` y validación de `manifest.json` pasan; la prueba Playwright está
preparada en `qa/test-valuador-baja-friccion.py`, pero no pudo arrancar Chromium en este entorno por `WinError 5`
(permisos del proceso auxiliar). Debe repetirse en un entorno con navegador habilitado.

## Propuesta para push

- Commit sugerido: `feat(valuator): reduce friction in valuation questionnaire`.
- Revisar `git diff --name-status` y ejecutar las pruebas del proyecto.
- Push propuesto a `origin/seo/fase5` solo después de la aprobación de la validación local.

## Propuesta para Hostinger

- Desplegar el commit aprobado en el entorno autorizado.
- Verificar públicamente `/valorador/`, rutas profundas, header, footer, service worker y carga directa.
- Completar una valoración privada y otra profesional en móvil y escritorio.
- Confirmar HTTP 200, ausencia de errores de consola, visualización del resultado y que el lead solo se envía con consentimiento.
- Si falla cualquiera de las comprobaciones, detener el release y documentar la incidencia.
