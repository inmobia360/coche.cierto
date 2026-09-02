# Spec 014 - Hoja de ruta asistida del informe

Estado: aprobado para implementación local

## Objetivo

Convertir el informe de orientación en una hoja de ruta accionable para comparar, verificar y decidir una compra de coche sin presentar estimaciones como hechos ni crear fricción innecesaria.

## Requisitos

- Mostrar por separado datos aportados, estimaciones y elementos pendientes de validar.
- Usar el presupuesto y las respuestas del usuario como contexto, sin inventar costes personales, estado mecánico, financiación ni documentación.
- Ordenar los siguientes pasos por momento: antes de buscar, antes de visitar, antes de negociar y antes de pagar.
- Incorporar fuentes oficiales contextualizadoras con fecha o periodo cuando estén disponibles: INE, DGT y Banco de España.
- Mantener visible que el informe es orientativo y no constituye tasación, peritaje, certificación documental, asesoramiento financiero o aprobación de crédito.

## Criterios de aceptación

- El PDF incluye un bloque de trazabilidad: "Sabemos", "Estimamos" y "Falta validar".
- El PDF contiene una hoja de ruta con al menos cuatro pasos y una condición de parada antes de entregar dinero.
- Las fuentes oficiales aparecen como referencias, no como garantía de exactitud para el caso individual.
- El backend pasa `node --check` y el PDF se puede generar sin errores de JavaScript.
