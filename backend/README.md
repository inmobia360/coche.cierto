# Backend CocheCierto

API inicial del MVP de diagnóstico, validación de email y captación de leads.

## Endpoints

- `GET /health` — estado de API y base de datos.
- `POST /api/leads` — registra la solicitud mínima y envía enlace de validación si SMTP está configurado.
- `POST /api/purchase-requests` — crea una petición privada anonimizada cuando MySQL está configurado y el usuario confirma que la compartirá manualmente.
- `GET /api/purchase-requests/:token` — devuelve únicamente la ficha pública de una petición activa.
- `POST /api/purchase-requests/:token/revoke` — retira una petición mediante su token privado.
- `DELETE /api/purchase-requests/:token` — elimina una petición y sus datos asociados mediante el token de propietario.
- `npm run check:purchase-flow` — valida invariantes de rutas, privacidad y migración sin conectarse a MySQL.
- `npm run check:crm-gates` — enumera las puertas locales y externas de activación, sin migrar ni modificar datos.
- `POST /api/purchase-requests/:ownerToken/invitations` — crea una invitación de concesionario separada, sin enviar mensajes.
- `POST /api/purchase-offer-invites/:inviteToken/offers` — recibe una oferta estructurada solo cuando `DEALER_OFFERS_ENABLED=true`.
- `GET /api/verify-email?token=...` — valida el email y habilita el informe.
- `GET /api/crm/status` — indica si el módulo está preparado y qué puertas no sensibles faltan, sin autorizar operaciones ni revelar secretos.
- `GET /api/crm/cases` y `GET /api/crm/cases/:id` — consulta interna de casos y trazabilidad.
- `POST /api/crm/cases/:id/events` — avanza una fase permitida con token interno.
- `POST /api/crm/dealers` y `POST /api/crm/dealers/:id/status` — prepara y verifica futuros concesionarios.
- `POST /api/crm/dealers/:id/contacts` — añade contactos operativos adicionales en el área restringida.
- `GET /api/crm/dealers/:id/contacts` — consulta interna de contactos, con estado de consentimiento pendiente o aprobado; nunca se expone al comprador.
- `POST /api/crm/dealers/:id/contacts/:contactId/status` — cambia manualmente el estado de autorización de un contacto; se exige uno aprobado para verificar el concesionario.
- `POST /api/crm/cases/:id/aftercare` — crea una tarea de acompañamiento o poscompra.
- El catálogo de tareas distingue documentación, inspección, seguro, transferencia, entrega, revisión financiera, mantenimiento inicial, primera revisión, garantía, reclamación de garantía y seguimiento.
- `GET /api/crm/aftercare` y `POST /api/crm/aftercare/:id/complete` — consulta y cierra tareas pendientes.

## Airtable opcional

Si se configuran `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID` y `AIRTABLE_LEADS_TABLE`, el backend guarda leads y los datos mínimos del informe para poder recuperarlos durante la beta. El token de Airtable solo vive en las variables privadas del servidor; no se incluye en GitHub ni en el navegador.

## Seguridad y límites

- CORS limitado a `APP_ORIGIN`.
- Helmet y límite de JSON.
- No almacena respuestas completas del cuestionario en esta primera versión.
- Consentimiento de guardado, compartición manual y comunicaciones comerciales separado; la recepción de ofertas permanece desactivada hasta aprobación.
- Las peticiones privadas guardan hashes separados para el token de propietario y el enlace compartido de solo lectura, además de la ficha mínima y el consentimiento manual; no guardan los tokens en claro ni datos de contacto por defecto.
- Las invitaciones de concesionario y sus ofertas tienen tokens y tablas separadas; la recepción permanece desactivada por defecto.

## Migración de peticiones y ofertas

La migración está en `migrations/001_purchase_requests_up.sql` y tiene reversión en `migrations/001_purchase_requests_down.sql`. No se ejecuta automáticamente al arrancar la API. Antes de aplicarla hay que revisar el entorno, hacer copia de seguridad, validar permisos y comprobar la política de conservación de datos.
- No incluye pagos, marketplace ni datos DGT. El CRM tiene una migración separada y permanece desactivado por defecto.
- El backend ya aplica rate limiting básico y tokens aleatorios con caducidad; en producción hay que añadir un almacén distribuido para rate limiting, logs sin PII, gestión centralizada de errores y una página real de informe.

## Arranque local

1. Copiar `.env.example` a `.env` y completar valores.
2. Ejecutar `npm install`.
3. Aplicar `schema.sql` en MySQL.
4. Ejecutar `npm start`.
## CRM interno

La consola `crm/` es local y permanece cerrada por defecto. Requiere MySQL, `CRM_ENABLED=true`, `CRM_SCHEMA_READY=true` solo después de migrar y comprobar el esquema, y un `CRM_ADMIN_TOKEN` gestionado fuera del repositorio. No se han cargado concesionarios reales. La migración reversible es `migrations/002_crm_lifecycle_up.sql` / `002_crm_lifecycle_down.sql`; la comprobación estructural es `npm run check:crm-lifecycle`.
Para staging existe `npm run db:migrate:crm`, pero exige `CRM_MIGRATION_CONFIRM=APPLY_CRM_002` y no se ejecuta automáticamente.
Después puede ejecutarse `npm run db:check:crm` con `CRM_DB_CHECK_CONFIRM=CHECK_CRM_002`; solo inspecciona la estructura y no lee registros.
