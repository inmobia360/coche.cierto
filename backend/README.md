# Backend CocheCierto

API inicial del MVP de diagnóstico, validación de email y captación de leads.

## Endpoints

- `GET /health` — estado de API y base de datos.
- `POST /api/leads` — registra la solicitud mínima y envía enlace de validación si SMTP está configurado.
- `GET /api/verify-email?token=...` — valida el email y habilita el informe.

## Airtable opcional

Si se configuran `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID` y `AIRTABLE_LEADS_TABLE`, el backend guarda leads y los datos mínimos del informe para poder recuperarlos durante la beta. El token de Airtable solo vive en las variables privadas del servidor; no se incluye en GitHub ni en el navegador.

## Seguridad y límites

- CORS limitado a `APP_ORIGIN`.
- Helmet y límite de JSON.
- No almacena respuestas completas del cuestionario en esta primera versión.
- Consentimiento de resultado separado de consentimiento comercial.
- No incluye CRM, pagos, marketplace ni datos DGT.
- El backend ya aplica rate limiting básico y tokens aleatorios con caducidad; en producción hay que añadir un almacén distribuido para rate limiting, logs sin PII, gestión centralizada de errores y una página real de informe.

## Arranque local

1. Copiar `.env.example` a `.env` y completar valores.
2. Ejecutar `npm install`.
3. Aplicar `schema.sql` en MySQL.
4. Ejecutar `npm start`.
