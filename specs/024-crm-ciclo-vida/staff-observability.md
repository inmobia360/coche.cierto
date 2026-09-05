# Ampliación 024 — observabilidad del panel interno

## Decisión de despliegue

El primer piloto se servirá bajo `cochecierto.com/crm`, detrás de autenticación interna y con `noindex`. Mantener el mismo origen reduce duplicación de sesión, DNS y superficie operativa. `crm.cochecierto.com` queda como opción posterior si se necesita aislar despliegue, cookies, SSO o escalado.

## Alcance ejecutable

- Panel staff con resumen de embudo, casos operativos, poscompra y alertas.
- Registro idempotente de eventos agregados de producto y campaña, sin PII.
- Eventos previstos: `email_sent`, `email_clicked`, `outbound_social_clicked`, `share_created`, `share_opened`, `referred_user_activated` y `social_sync_failed`.
- Cada evento conserva `event_id`, tipo, fecha, origen/campaña, versión y metadatos permitidos. No se conectan proveedores ni APIs sociales en esta ampliación.
- Las visitas a redes se miden como clics salientes desde CocheCierto; no se presentan como visitas confirmadas en la red.
- Alertas operativas deterministas: CRM cerrado, sincronización fallida, eventos sin idempotencia y tareas vencidas. Umbrales son hipótesis configurables y deben revisarse con datos reales.

## Seguridad y activación

Las rutas requieren la misma bandera `CRM_ENABLED`, esquema comprobado y credencial interna. `CRM_ENABLED=false` sigue siendo el valor por defecto. Los adaptadores de email y redes permanecen desactivados hasta una spec específica, credenciales, base jurídica, retención, supresión y piloto autorizado.

## Aceptación

1. Un `event_id` repetido no aumenta el contador.
2. El panel muestra periodo, unidad y definición de cada métrica.
3. Una alerta incluye causa, severidad y siguiente acción, sin datos personales.
4. La ausencia de integración externa se muestra como “desactivada”, nunca como dato estimado.
5. El panel no es indexable ni accesible sin credencial interna.
