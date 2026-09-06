# Spec 030 · Meta Ads en CRM

## Autorización y alcance

Implementación solicitada explícitamente por el propietario del proyecto en esta conversación. Este corte añade una pestaña ADS de solo lectura y un contrato de estado para Meta Ads. No publica campañas, no modifica presupuesto y no envía datos del navegador a Meta.

La sesión staff, una vez validada por OTP, se conserva durante un máximo de 15 días mediante una cookie firmada por el servidor, `HttpOnly`, `Secure` y `SameSite=Strict`, vinculada al agente del navegador. No se usa la IP como identificador rígido porque puede cambiar en una conexión legítima; rotar `CRM_ADMIN_TOKEN` invalida las sesiones existentes.

## Requisitos

- El CRM debe mostrar una sección `ADS` accesible desde la navegación interna.
- Debe distinguir `disabled`, `not_configured`, `ready` y `error`.
- Las impresiones, clics, gasto y conversiones de Meta solo se muestran si proceden del adaptador oficial server-side; si no, se muestra `—`.
- La atribución propia existente (UTM y eventos agregados) se mantiene como fuente separada y no se presenta como métrica de Meta.
- El conector permanece desactivado por defecto y nunca expone tokens al navegador ni al repositorio.

## Fuera de alcance

Pixel/CAPI en la web, OAuth, sincronización real, publicación de anuncios, cambios de campaña y tratamiento de datos personales. Requieren iniciativa y revisión legal/seguridad específicas.

## Aceptación

- `GET /api/crm/ads` exige la misma autorización del CRM.
- Con la bandera apagada responde estado `disabled` y métricas nulas.
- La pestaña renderiza estado, campaña de referencia, destino y atribución propia sin inventar valores.
- Se validan JavaScript, pruebas CRM existentes y `manifest.json`.
