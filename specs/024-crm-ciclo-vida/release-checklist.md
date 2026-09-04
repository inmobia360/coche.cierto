# Puerta de activación

- [ ] Revisión legal/RGPD documentada.
- [ ] Revisar y aprobar el mapa de datos `data-map.md`, incluida base jurídica y conservación.
- [ ] MySQL staging operativo y migración verificada.
- [ ] Ejecutar `npm run db:migrate:crm` con confirmación privada y conservar su salida.
- [ ] Ejecutar `npm run db:check:crm` con confirmación privada; debe comprobar tablas y columnas sin leer registros.
- [ ] Marcar `CRM_SCHEMA_READY=true` únicamente después de que la comprobación anterior sea satisfactoria.
- [ ] Autenticación interna real, secretos fuera del repositorio y roles revisados.
- [ ] Pruebas de supresión, caducidad, exportación y auditoría.
- [ ] Piloto autorizado con concesionarios identificados.
- [ ] Aprobación expresa para activar `CRM_ENABLED=true`.

Hasta cumplir todo lo anterior, la consola y la API deben permanecer cerradas.
