# Spec 025 — Analítica propia y atribución de CocheCierto

## Objetivo

Unificar Search Console, GA4 y redes sociales en el CRM sin enviar datos a proveedores externos desde el navegador sin autorización.

## MVP implementado

- Captura técnica de `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` y `utm_term`.
- Persistencia únicamente durante la sesión y envío junto con la solicitud del informe.
- Límite de 120 caracteres por valor y sin email, teléfono, respuestas completas ni identificadores publicitarios.
- El CRM conserva el origen de adquisición como dimensión de embudo; los clics sociales se distinguen de visitas y conversiones.

## Fases posteriores, sujetas a revisión

1. Conector servidor a Search Console API (clics, impresiones, CTR y posición).
2. Conector servidor a GA4 Data API (sesiones y conversiones con consentimiento analítico).
3. Adaptadores oficiales de YouTube, Meta, TikTok y X, con scopes mínimos, secreto fuera del repositorio, retención y base jurídica documentadas.

## Criterios de aceptación

- Una URL con UTMs conserva la atribución durante la sesión y la entrega una vez al endpoint de leads.
- Sin UTMs no se inventa ningún origen.
- Ningún dato de atribución se muestra al comprador ni se trata como conversión por sí mismo.
- Los conectores externos permanecen desactivados hasta aprobar credenciales, consentimiento y prueba de supresión.
