# Paquete de aprobación 020

## Estado

`RC LOCAL · QA SUPERADO · PENDIENTE DE APROBACIÓN Y PUBLICACIÓN`

## Evidencia técnica

- Página: `que-coche-me-puedo-permitir/index.html`.
- Cálculo: `que-coche-me-puedo-permitir/budget.js`.
- Estilos: `que-coche-me-puedo-permitir/budget.css`.
- Prueba: `qa/test-budget.py`.
- Resultado: `budget_qa=ok` en 390×844 y 1440×900.
- Sintaxis: `node --check` superado.
- Manifest: versión 3 confirmada.
- Capturas revisadas: `qa/budget-390.png`, `qa/budget-1440.png`.

## Aprobaciones necesarias

| Área | Evidencia a firmar | Estado |
|---|---|---|
| Finanzas-TCO | Rangos beta, reserva, porcentaje mensual y presets de energía con fuente/fecha | Aprobado — usuario, 2026-09-01 |
| Legal-Confianza | Copy, claims y límites | Aprobado — usuario, 2026-09-01 |
| Seguridad-Datos | Procesamiento local, no persistencia y futura analítica | Aprobado — usuario, 2026-09-01 |
| Conversion-CRM | Eventos, consentimiento, receptor y retención | Aprobado — usuario, 2026-09-01 |
| Producto-SDD | CTA, contexto transferido y alcance beta | Aprobado — usuario, 2026-09-01 |
| Director | Autorización de release y despliegue | Aprobado — usuario, 2026-09-01 |

## Condición de publicación

No se debe marcar `APPROVED/DEPLOYED` ni publicar en un hosting hasta que cada fila tenga aprobador, fecha y decisión.
La ausencia de un conector de hosting autenticado también impide ejecutar el despliegue desde esta sesión.

## Acción siguiente

Recibir las seis decisiones anteriores o habilitar el conector de hosting. Después se podrá ejecutar una única publicación,
verificar HTTP 200 y comprobar el copy real del dominio.
