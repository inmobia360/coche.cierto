# Iniciativa: landing, navegación y Recursos v1

Estado: implementada en local, pendiente de publicación.

## Objetivo

Ayudar al usuario a entender qué resuelve CocheCierto y ofrecer rutas independientes hacia el diagnóstico, el informe de ejemplo, la metodología y las futuras herramientas de compra.

## Alcance

- Menú responsive con `Cómo funciona`, `Qué analizamos`, `Informe de ejemplo` y `Recursos`.
- Rutas canónicas `/como-funciona/`, `/recursos/`, `/metodologia/`, `/analizar-coche/`, `/demo/` y `/valorador/`.
- Página “Cómo funciona” con objetivo, cuatro pasos, entregables y límites.
- Página “Recursos” con herramientas reales y estados “Próximamente” donde no existe backend.
- Metodología visible para distinguir observado, calculado, estimado y pendiente.
- Flujo de voz: `foro-coches` aporta contexto de lenguaje y preocupaciones; `COPY-MENSAJE` redacta el resultado claro y cercano.

## Criterios de aceptación

- Ningún elemento del menú apunta a un destino inexistente.
- Las herramientas no implementadas no se presentan como disponibles.
- El CTA de valoración es visible en escritorio y móvil.
- Las páginas mantienen identidad visual, contraste y lectura responsive.
- Las promesas de la landing coinciden con lo que entrega el informe.
- Los hallazgos de foros no se convierten en afirmaciones generales.
- Cada cálculo futuro deberá mostrar fuente, fecha, supuestos y limitaciones.

## Fuera de alcance

No incluye todavía analizador real de anuncios, APIs de mercado, cuentas, pagos, publicación automática de contenidos ni envío de newsletters.

## Validación

- `node --check mvp-valorador/modal.js`
- `node --check mvp-valorador/how-it-works.js`
- `git diff --check`
- Verificación manual pendiente en producción tras el despliegue.
