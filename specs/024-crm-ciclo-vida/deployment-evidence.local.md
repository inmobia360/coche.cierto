# Evidencia de despliegue — CRM 024

Fecha: 2026-09-05 (Europe/Madrid)

- Commit publicado: 8d861ec en main.
- Hostinger: despliegue de api.cochecierto.com en estado completed.
- Node.js 20, aplicación Express.
- GET /health: HTTP 200; ok=true, servicio activo y base de datos conectada.
- Panel: https://cochecierto.com/crm/; muestra CRM no activado.
- Base de datos verificada: 12 tablas, incluida crm_product_events.
- CRM_ENABLED=false; APIs sociales y comunicaciones externas desactivadas.

Siguiente control: autenticación interna, piloto cerrado, prueba de idempotencia y revisión RGPD.
