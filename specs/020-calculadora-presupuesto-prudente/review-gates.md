# Revisión de puertas 1–3 — 1 de septiembre de 2026

## 1. Finanzas-TCO — revisión técnica provisional

La fórmula reutilizada coincide con el modelo existente: precio del coche separado de gastos iniciales, reserva y coste
mensual. La implementación conserva rangos beta para gastos iniciales y usa una proporción mensual configurable. El coste
energético ya no se inventa por defecto: se introduce opcionalmente por 100 km y, si falta, se muestra como pendiente.

Las referencias de mercado y su ciclo de actualización quedaron documentados en `docs/data/cost-reference-policy.md`.
Resultado: **aprobado para beta el 2026-09-01 por decisión explícita del usuario**. Los rangos son orientativos; la
energía usa referencias MITECO o un coste propio declarado, con revisión semestral.

## 2. Legal-Confianza — revisión de claims

La pantalla declara que es orientación, no aprobación, crédito, tasación ni garantía; no solicita email para el resultado y
no presenta un modelo o entidad financiera. La expresión “reserva protegida” describe la resta matemática, no una garantía.

Resultado: **aprobado para beta el 2026-09-01 por decisión explícita del usuario**. Se mantienen estimación, provisionalidad,
  límites de asesoramiento y ausencia de garantía; una revisión jurídica profesional podrá exigir ajustes posteriores.

## 3. Seguridad-Datos + Conversión-CRM

La versión local no persiste datos ni llama a terceros. Los eventos se emiten como `CustomEvent` sin importes, email,
nombre, teléfono, URL privada o identificadores. `tool_start` se emite al primer campo usado; `tool_complete` al obtener
resultado; el CTA emite `valuation_start` y `next_action`. No existe aún un receptor analítico externo, por lo que no se
debe añadir uno hasta aprobar consentimiento, minimización y retención.

Resultado Seguridad-Datos: **aprobado para beta el 2026-09-01 por decisión explícita del usuario**. La calculadora no
persiste datos, no exige email para el resultado y no enviará eventos a terceros sin una aprobación específica.

La puerta Conversion-CRM queda **aprobada para beta el 2026-09-01 por decisión explícita del usuario**: se mantienen
los eventos locales mínimos (`landing_view`, `tool_start`, `tool_complete`, `valuation_start`, `next_action`), sin
payload de PII ni receptor externo. El email del informe y el consentimiento comercial permanecen separados.

## 4. Producto-SDD

La beta enlaza la calculadora con el valorador mediante `source=budget-tool` e `intent=budget`. El usuario puede ver el
resultado sin email y el alcance excluye marketplace, financiación real, recomendaciones patrocinadas y análisis LLM.

Resultado: **aprobado para beta el 2026-09-01 por decisión explícita del usuario**.

## 5. Dirección

El Director autorizó el release beta y su despliegue el 2026-09-01. La autorización queda condicionada únicamente a
disponer del canal de hosting autenticado y a completar la verificación posterior de producción.

## 6. QA-VALIDACION

Se ejecutó `qa/test-budget.py` con servidor local y Chromium en viewport móvil de 390×844. Resultado: `budget_qa=ok`.
El test comprueba carga, heading y CTA, errores de campos, cálculo, etiquetas accesibles, foco de teclado, ausencia de
desbordamiento horizontal, ausencia de errores de página y eventos `tool_start`/`tool_complete` sin email, ingresos ni
ahorro. También se verificó sintaxis con `node --check` y compatibilidad Manifest V3.

Además se inspeccionaron visualmente las capturas `qa/budget-390.png` y `qa/budget-1440.png`: el CTA es visible, los
botones tienen jerarquía de acción, el layout pasa de una columna a dos sin desbordamiento y el banner de privacidad no
impide completar el cálculo. Resultado: **QA funcional móvil/escritorio y accesibilidad básica superados**.
