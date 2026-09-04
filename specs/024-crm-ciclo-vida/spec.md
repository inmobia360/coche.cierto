# Especificación 024 — CRM del ciclo de vida CocheCierto

## Objetivo

Crear la base para acompañar cada caso desde el diagnóstico hasta la compra y los servicios posteriores, y permitir registrar concesionarios y contactos para un piloto futuro. No se crean concesionarios reales en esta fase.

## Alcance local

- Registro interno de casos, etapas, eventos y tareas de poscompra.
- Registro de empresa y contactos separado, nunca visible al comprador.
- Asociación explícita caso–concesionario, con estados de relación.
- Transiciones controladas y trazables; no se permiten saltos arbitrarios.
- Pantalla CRM local con estados vacíos y activación cerrada por defecto.
- Trazabilidad condicionada: el sistema registra solicitud de informe, validación, petición privada, invitación y oferta solo cuando existe la acción explícita correspondiente.
- La autorización de contacto es una acción separada de recibir ofertas y no envía comunicaciones por sí misma.
- Las tareas de acompañamiento usan un catálogo explícito para separar preparación, entrega y servicios posteriores: documentación, inspección, seguro, transferencia, entrega, revisión financiera, mantenimiento inicial, garantía, reclamación de garantía y seguimiento.

## Fuera de alcance hasta autorización

- Importar o contactar concesionarios reales.
- Envío automático de email, WhatsApp o SMS.
- Alta automática de usuarios por navegar o iniciar el valorador sin consentimiento.
- Activación en producción, scraping, pagos o integración con un CRM externo.
- Decisiones legales sobre base jurídica, conservación o encargados.

## Principios de datos

Se reutilizan referencias internas a `leads` y `purchase_requests` sin duplicar nombre, email, teléfono, respuestas o coordenadas. Los contactos de concesionarios viven en una tabla restringida. El CRM no tiene rutas públicas: requiere bandera de activación y autorización interna.

## Ciclo de caso

`visitor → diagnostic_started → report_requested → report_verified → request_draft → request_active → shared_manual → offer_received → comparison → contact_authorized → visit_requested → test_requested → purchased → aftercare → closed`.

Estados de salida: `withdrawn`, `expired` y `blocked`.
