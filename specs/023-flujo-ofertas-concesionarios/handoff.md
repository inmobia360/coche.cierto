# Handoff — Flujo de ofertas colaborativas

## Veredicto actual

La experiencia local está preparada para el recorrido manual y la API tiene el contrato técnico para peticiones, invitaciones, ofertas y comparación. No está activada la recepción real ni se ha desplegado este cambio.

La auditoría detallada de preparación y los requisitos de activación están en `auditoria-preparacion-implementacion.md`.

## Alcance comprobado

- `/concesionarios/`: modo demo, sin geolocalización ni búsquedas externas.
- `/concesionarios/`: vista previa editable de los campos de necesidad antes de generar la ficha; guardar y compartir manualmente requieren casillas independientes.
- `/solicitud/`: vista de lectura, enlace de propietario separado, revocación solo para propietario e invitación manual.
- `/respuesta-oferta/`: formulario estructurado para concesionarios; envío bloqueado mientras el flag está desactivado.
- `/comparar-ofertas/`: hasta tres ofertas, sin orden comercial ni patrocinio.
- Backend: tokens hash, expiración, revocación, invitaciones y ofertas versionadas.
- MySQL: `schema.sql` y migración reversible en `backend/migrations/`.

## Evidencia disponible

- `node --check` correcto en backend y páginas nuevas.
- `git diff --check` correcto.
- Smoke test real de API sin MySQL: responde `503` de configuración y no crea datos.
- Prueba visual local con datos ficticios: primera carga, formulario, radios y resultados demo visibles.
- QA visual del PDF backend completado con datos ficticios: 1 página A4 renderizada a PNG; marca, QR de Recursos, jerarquía, caja de criterios, pie legal y URL/contacto visibles sin solapamientos ni recortes.
- Regresión local de consentimientos: sin casillas muestra primero el requisito de guardado; con solo guardado exige por separado la autorización de compartición manual.
- La invitación a un concesionario exige ahora un consentimiento independiente para recibir ofertas; se registra junto con la invitación en una transacción.
- El propietario puede copiar o compartir manualmente el enlace de solo lectura y eliminar definitivamente la petición desde su vista privada.
- Smoke test del endpoint `DELETE` sin MySQL: responde `503` como no configurado y no modifica datos.
- Validación de accesibilidad local: la vista de respuesta expone 19 campos con nombres/labels, incluidos vigencia y declaración de exactitud; el enlace inválido se maneja sin mostrar el formulario.
- Las rutas de peticiones, invitaciones y ofertas devuelven `Cache-Control: no-store`; CORS permite `DELETE` únicamente dentro del contrato de la API.
- Añadido `backend/scripts/check-purchase-flow.mjs`: `npm run check:purchase-flow` verifica 31 invariantes de rutas, tokens, consentimientos, privacidad y orden reversible de la migración sin conectarse a MySQL.
- La comparación excluye del bloque comparable las respuestas incompletas y las presenta como pendientes, con los campos mínimos exigidos y sin recomendación automática.
- Recorrido E2E en navegador integrado con API efímera en memoria y datos ficticios: petición creada, enlace de propietario abierto, invitación generada tras consentimiento, oferta estructurada registrada y comparación final visible como `1 oferta comparable`.
- Control de privacidad E2E: el enlace de solo lectura mostró la ficha autorizada sin controles de propietario ni datos personales; el servidor efímero fue detenido y eliminado al finalizar la prueba.
- Corrección de caducidad: el estado `expired` se actualiza por `purchase_requests.id`, columna existente en el esquema.
- Producción inspeccionada: aún muestra la implementación anterior con mapa/OSM.

## Riesgos no resueltos

- No hay MySQL autorizado para ejecutar la migración.
- No hay cliente/servidor MySQL o MariaDB local disponible; Docker está instalado pero el daemon no está activo, por lo que la migración queda pendiente de un staging autorizado.
- No existe todavía revisión legal específica para peticiones e invitaciones.
- No hay concesionarios piloto verificados.
- Playwright local tuvo `WinError 5` al lanzar Chromium; la validación visual se hizo mediante navegador conectado.
- El PDF generado por el endpoint es visualmente correcto para la plantilla actual, pero sigue siendo una ficha de trabajo: requiere validación de contenido y aprobación legal antes de considerarse entregable definitivo.

## Siguiente responsable

`SEGURIDAD-DATOS + LEGAL-CONFIANZA` deben revisar retención, base jurídica, roles, tokens y condiciones. Después `QA-VALIDACION` debe probar la migración en staging y el recorrido completo con datos ficticios. Solo entonces `INGENIERIA` puede proponer activar `DEALER_OFFERS_ENABLED` para un piloto limitado.
