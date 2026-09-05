# Handoff — CRM y cierre del ciclo

## Estado implementado localmente

- `crm_cases` mantiene la fase actual sin copiar los datos personales del lead.
- Cada caso puede tener responsable interno, prioridad y próxima acción para evitar seguimientos sin dueño.
- `crm_case_events` conserva una línea temporal mínima de transiciones.
- `crm_dealers` y `crm_dealer_contacts` permiten preparar un registro futuro separado.
- `crm_case_dealers` permite asociar candidatos, invitados, respondedores y seleccionados.
- Las invitaciones pueden vincularse opcionalmente a un concesionario verificado sin publicar el catálogo interno.
- `crm_aftercare_tasks` permite preparar servicios durante y después de la compra.
- La spec define un catálogo de eventos de producto, métricas con denominador y cohortes, y atribución de referidos mediante identificadores aleatorios.
- El valorador y el flujo de petición registran únicamente acciones explícitas y consentidas.
- La autorización de contacto es separada de recibir ofertas y no envía mensajes.
- La consola `crm/` no es indexable y permanece cerrada por defecto.

## Fases trazadas

`report_requested → report_verified → request_active → shared_manual → offer_received → comparison → contact_authorized → visit_requested → test_requested → purchased → aftercare → closed`.

Las fases `visit_requested`, `test_requested`, `purchased` y `aftercare` se avanzan manualmente desde la consola hasta que exista una integración autorizada. La caducidad se sincroniza como estado terminal `expired`.

## Pruebas disponibles

```text
npm --prefix backend run check:purchase-flow
npm --prefix backend run check:crm-lifecycle
```

Estas comprobaciones son estructurales y no sustituyen ejecutar la migración sobre MySQL.

## Puertas aún abiertas

1. Ejecutar `npm run db:migrate:crm` en MySQL staging y comprobar claves foráneas, rollback documentado y borrado; el script no promete atomicidad porque MySQL puede confirmar DDL implícitamente.
2. Sustituir el token interno provisional por autenticación con roles y secretos gestionados fuera del repositorio.
3. Aprobar base jurídica, información al usuario, conservación, supresión, encargos y registro de actividades.
4. Definir concesionarios del piloto; no se han creado registros reales.
5. Probar una cohorte ficticia y después un piloto autorizado, sin mensajes automáticos.
6. Autorizar por separado cualquier integración de email, WhatsApp, SMS, calendario, pagos o CRM externo.
7. Aprobar la extensión de medición, ejecutar su migración y validar idempotencia, retención, supresión y atribución en una cohorte ficticia.

No deben activarse `CRM_ENABLED=true` ni `CRM_SCHEMA_READY=true` hasta cerrar estas puertas. `CRM_SCHEMA_READY=true` se marca manualmente solo después de ejecutar la migración y `npm run db:check:crm` en staging.
