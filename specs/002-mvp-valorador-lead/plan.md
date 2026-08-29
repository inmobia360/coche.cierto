# Plan técnico — MVP Valorador y Lead

## Módulos

- `diagnostic-flow`: preguntas, progreso, revisión y reinicio (RF-1, RF-2, RF-3, RF-6, RF-10).
- `recommendation-engine`: reglas transparentes para categoría, motorización y alternativas (RF-4, RF-5, RF-9).
- `lead-capture`: contacto, intención, plazo y consentimiento separado (RF-7, RF-8).
- `analytics`: eventos mínimos del embudo sin recopilar más datos de los necesarios.
- `content`: explicación de límites, supuestos y siguiente paso.

## Estrategia

Primero construir un prototipo de flujo con datos locales y reglas auditables. No integrar marketplace ni proveedores externos hasta validar finalización y calidad de leads. Los pesos iniciales deben estar en configuración versionada y acompañados de hipótesis.

## Validación

Pruebas de reglas con perfiles sintéticos etiquetados, pruebas de casos límite económicos, revisión de consentimiento y prueba manual con compradores reales. No usar perfiles sintéticos para medir conversión.
