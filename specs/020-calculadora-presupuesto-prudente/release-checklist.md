# Checklist de release 020

Estado actual: **Release Candidate local — no desplegable todavía**.

## Evidencia técnica ya disponible

- [x] Página canónica y metadatos SEO creados.
- [x] Cálculo local sin persistencia ni llamadas externas.
- [x] Fórmula separa precio, gastos iniciales, reserva y coste mensual.
- [x] CTA contextual hacia el valorador.
- [x] Eventos locales sin PII.
- [x] `node --check` superado.
- [x] Manifest V3 confirmado.
- [x] `qa/test-budget.py` superado en 390×844 y 1440×900.
- [x] Capturas visuales revisadas: `qa/budget-390.png` y `qa/budget-1440.png`.

## Puertas que requieren aprobación antes de publicar

- [x] `FINANZAS-TCO`: aprobado para beta el 2026-09-01 por decisión explícita del usuario: `initialLow=1.100 €`,
  `initialHigh=2.700 €`, `monthlyShare=15–25 %`, `reserveFloor=1.000 €`; usar referencias MITECO y permitir coste
  propio declarado para energía. Las cifras son orientativas, con revisión semestral y fuente/fecha/versionado.
- [x] Registrar política de referencias y actualización: `docs/data/cost-reference-policy.md`.
- [x] `LEGAL-CONFIANZA`: aprobado para beta el 2026-09-01 por decisión explícita del usuario: copy de orientación,
  “precio máximo provisional”, “reserva protegida en este cálculo” y disclaimer de no asesoramiento, solvencia,
  aprobación crediticia, tasación, peritaje, inspección ni garantía.
- [x] `SEGURIDAD-DATOS`: aprobado para beta el 2026-09-01 por decisión explícita del usuario: procesamiento local,
  sin persistencia, resultado básico sin email obligatorio, eventos locales sin PII y consentimiento comercial separado.
- [x] `CONVERSION-CRM`: aprobado para beta el 2026-09-01 por decisión explícita del usuario: eventos locales mínimos,
  payload sin PII, sin receptor externo, consentimiento comercial separado y email solo para entregar el informe.
- [x] `PRODUCTO-SDD`: aprobado para beta el 2026-09-01 por decisión explícita del usuario: CTA al valorador,
  contexto `source=budget-tool` e `intent=budget`, resultado sin email obligatorio y alcance limitado sin marketplace,
  financiación real, recomendaciones patrocinadas ni análisis LLM.
- [x] `DIRECTOR`: autorizado el 2026-09-01 por decisión explícita del usuario para release beta y despliegue cuando
  exista un conector de hosting autenticado.

## Regla de cierre

Secretaria solo marcará la Spec 020 como `APPROVED/DEPLOYED` cuando cada puerta tenga nombre del aprobador, fecha,
decisión y evidencia enlazable. Mientras falte cualquiera, el estado correcto es `RC LOCAL` y no se despliega.
