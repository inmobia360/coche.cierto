# Spec 020 — Calculadora de presupuesto prudente

## Objetivo

Ofrecer en `/que-coche-me-puedo-permitir/` una primera orientación útil sobre cuánto presupuesto de coche puede asumir
una persona sin convertir una estimación en aprobación financiera ni pedir email antes del resultado básico.

## Problema que resuelve

El usuario busca cuánto coche puede permitirse, pero el precio de compra no refleja seguro, impuestos, mantenimiento,
energía, puesta a punto, financiación ni margen para imprevistos. La herramienta debe mostrar un rango prudente y hacer
visible qué supuestos lo explican.

## Entradas mínimas

- Ingreso neto mensual aproximado.
- Gastos fijos mensuales aproximados.
- Ahorro disponible y reserva que no quiere utilizar.
- Kilómetros mensuales aproximados.
- Uso principal: urbano, mixto o carretera.
- Compra al contado o financiada, sin solicitar datos bancarios.

Todos los importes serán rangos o aproximaciones y se podrán modificar. No se solicitará nombre, email, teléfono,
documentación, cuenta bancaria ni ubicación exacta para obtener el resultado básico.

## Salida mínima

- Margen mensual estimado antes del coche.
- Coste mensual prudente del coche como rango.
- Precio máximo orientativo de compra, separado de entrada, cuotas, costes iniciales y reserva.
- Tres escenarios: prudente, probable y exigente.
- Supuestos, fuentes/fecha cuando proceda y datos pendientes de confirmar.
- CTA: `Crear mi valoración gratuita` que lleva al valorador actual conservando la intención y los datos no sensibles
  necesarios.

La herramienta no mostrará “te puedes permitir” como certeza, no aprobará crédito, no calculará solvencia individual ni
recomendará una marca o modelo concreto.

## Reglas de cálculo

La base provisional se encuentra en `coche.cierto/specs/003-informe-estrategia-compra/budget-model.md` y se detalla en
`clarifications.md`. Sus rangos no son tarifas universales y requieren revisión antes de mostrarse como valores por defecto.

1. El resultado debe ser determinista, explicable y reproducible en frontend/backend según la arquitectura aprobada.
2. El coste total debe separar cuota o precio, seguro, impuestos, mantenimiento, energía, puesta a punto e imprevistos.
3. La entrada y cualquier cuota final se mostrarán separadas de la cuota mensual; nunca se comparará solo la cuota.
4. Cuando falte una fuente autorizada, el valor se marcará como supuesto editable, no como dato de mercado.
5. Los límites, porcentajes y rangos deberán ser revisados por `FINANZAS-TCO` y `LEGAL-CONFIANZA` antes de publicarse.

## Conversión y medición

Emitir, con consentimiento cuando corresponda, `landing_view`, `tool_start`, `tool_complete`, `valuation_start` y
`next_action`, siguiendo el contrato de Spec 018. No enviar respuestas a terceros ni registrar importes individuales en
logs analíticos sin aprobación de minimización.

## Privacidad y seguridad

- Procesamiento local mientras sea viable; si se envía al backend, solo campos mínimos y protegidos.
- No persistir el resultado básico por defecto.
- No usar la calculadora para perfilado crediticio, publicidad personalizada ni decisiones automatizadas de acceso.
- El consentimiento comercial será independiente de usar la herramienta.

## Fuera de alcance

Financiación real, ofertas de crédito, comparadores de vehículos, recomendación de modelos, scraping de anuncios, pagos,
cuentas, campañas y llamadas LLM.

## Criterios de aceptación

- Un usuario puede completar la herramienta y ver resultado sin email.
- Cada salida muestra rango, escenario, supuestos y límites.
- Casos límite: ingresos/gastos inválidos, ahorro insuficiente, cero kilómetros, campos vacíos y cifras extremas.
- El CTA llega al valorador y conserva el contexto permitido.
- Se puede auditar cada cifra mediante fórmula, versión, fuente o supuesto.
- Responsive, teclado, lector de pantalla y errores comprensibles comprobados por QA.
