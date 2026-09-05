# Especificación 029 — Alta de partners desde CRM y landing profesional

## Objetivo

Permitir que el equipo cree partners desde el CRM y que profesionales soliciten colaborar desde `pro.cochecierto.com`, sin activar suscripciones ni dar acceso automático.

## Flujo

`landing_pro → solicitud_recibida → pendiente_revision → aprobado → onboarding → activo`.

La solicitud pública crea un partner en estado `pending_review`, registra `source=landing_pro` en los metadatos de áreas de servicio y crea un contacto con consentimiento pendiente. El CRM decide manualmente si aprueba, rechaza o convierte en partner fundador.

## Seguridad

- Validación de longitud, formato y honeypot/rate limit.
- No se envían emails ni mensajes automáticamente.
- Suscripciones, cobros y facturación quedan fuera de alcance.
- La lista de partners y contactos permanece protegida por `crmGuard`.

## Aceptación

1. El formulario manual del CRM sigue funcionando.
2. La landing puede enviar una solicitud y recibe confirmación neutra.
3. La solicitud aparece como pendiente de revisión con su origen.
4. Un reenvío idéntico no crea duplicados por email y razón social normalizados.
5. Ningún partner pasa a activo o de pago automáticamente.
