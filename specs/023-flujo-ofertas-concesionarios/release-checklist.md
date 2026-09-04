# Checklist de release — flujo de ofertas

Este checklist es preparatorio. No autoriza por sí mismo un despliegue, una migración ni la activación de ofertas.

## Antes de desplegar

- [ ] Revisar el diff completo y separar cambios preexistentes de esta iniciativa.
- [ ] Confirmar revisión de `LEGAL-CONFIANZA` y `SEGURIDAD-DATOS`.
- [ ] Confirmar que la política de privacidad cubre peticiones, invitaciones, ofertas, conservación y revocación.
- [ ] Confirmar concesionarios piloto, responsables y canal de soporte.
- [ ] Crear copia de seguridad MySQL y comprobar restauración.
- [ ] Aplicar `backend/migrations/001_purchase_requests_up.sql` en staging.
- [ ] Ejecutar pruebas de token, caducidad, revocación, roles y validación de campos.
- [ ] Mantener `DEALER_OFFERS_ENABLED=false` durante la validación inicial.

## Validación local/staging

- [ ] Primera carga directa de `/concesionarios/`, `/solicitud/`, `/respuesta-oferta/` y `/comparar-ofertas/`.
- [ ] Comprobar móvil, teclado, foco, textos y ausencia de desplazamiento horizontal.
- [ ] Crear una petición con datos ficticios.
- [ ] Verificar que el enlace compartido solo lee y que el propietario puede revocar.
- [ ] Verificar que la URL no contiene los datos de necesidades.
- [ ] Generar una invitación sin enviar mensajes.
- [ ] Enviar una oferta ficticia solo en staging y comprobar versionado.
- [ ] Consultar y comparar hasta tres ofertas.
- [ ] Confirmar que no aparecen email, teléfono, DNI, coordenadas exactas ni datos bancarios del comprador.
- [ ] Revisar logs y red para confirmar ausencia de PII.

## Activación piloto

- [ ] Aprobar por escrito el cambio de `DEALER_OFFERS_ENABLED`.
- [ ] Activar solo en staging o grupo piloto identificable.
- [ ] Monitorizar completitud, errores, revocaciones, incidencias, satisfacción y abandono.
- [ ] Mantener separación entre encaje técnico y patrocinio.
- [ ] Tener preparado el rollback de migración y de configuración.

## Producción

- [ ] Desplegar backend y páginas en una ventana controlada.
- [ ] Verificar `/health`, configuración efectiva y versión desplegada.
- [ ] Verificar cada URL pública mediante entrada directa.
- [ ] Comprobar ausencia de errores de consola, recursos 404 y regresiones del valorador.
- [ ] Confirmar que la producción coincide con el commit y la migración aprobados.
- [ ] Documentar fecha, commit, versión de esquema, flags y evidencias.
