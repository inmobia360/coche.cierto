# Auditoría de preparación para implementar el flujo con concesionarios

**Fecha:** 2026-09-04  
**Alcance:** cambios locales de la spec 023, backend, páginas de comprador/concesionario y validación en navegador integrado.  
**Conclusión:** la primera entrega está implementada en local y el recorrido E2E funciona con una API efímera de prueba. No está aprobada para producción ni para recepción real de ofertas.

## Matriz de estado

| Área | Estado | Evidencia / faltante |
| --- | --- | --- |
| Resumen editable de necesidades | Hecho | `/concesionarios/` permite corregir los campos antes de compartir. |
| Ficha para el concesionario | Hecho en local | PDF/web con necesidades, pendientes, precio, garantía, prueba e inspección. |
| Compartición | Hecho en local | Token de propietario y token de solo lectura separados; copia y compartición manual. |
| Consentimientos | Hecho para primera entrega | Guardar, compartir manualmente y recibir ofertas se solicitan por separado. Contacto y marketing siguen fuera de alcance. |
| Revocación y eliminación | Hecho en contrato | Propietario puede retirar o eliminar; falta probarlo contra MySQL real. |
| Oferta estructurada | Hecho en contrato | Campos de vendedor, vehículo, precio, financiación, garantía, entrega, vigencia y declaración. Flag `DEALER_OFFERS_ENABLED=false`. |
| Comparación | Hecho en local | Máximo tres comparables; incompletas quedan como pendientes y no se ordena por pago/cuota. |
| Privacidad técnica | Parcialmente verificada | Hashes, `no-store`, noindex y minimización implementados; faltan pruebas de seguridad y configuración real. |
| Persistencia | No verificada | No existe MySQL/MariaDB local; migración reversible preparada. |
| Accesibilidad | Parcialmente verificada | Labels y flujo básico comprobados; faltan auditoría completa de teclado, lector, contraste y móvil. |
| Medición de utilidad | Pendiente | Faltan definición de métricas, consentimiento/legitimación y almacenamiento de resultados. |
| Legal/RGPD y acuerdos | Pendiente crítico | No se ha aprobado responsable/encargados, base jurídica, conservación, información ni relación con concesionarios. |
| Producción | No preparada | La web pública aún muestra la implementación anterior; no se ha desplegado este cambio. |

## Qué falta para implementar de verdad

### 1. Decisiones de producto y legales

Antes de activar ofertas hay que aprobar por escrito:

- quién es responsable del tratamiento y qué proveedores actúan como encargados;
- finalidad y base jurídica de guardar la petición, compartirla con un concesionario concreto y recibir su oferta;
- información de privacidad de primera y segunda capa, derechos, canal de ejercicio y responsable de atenderlos;
- plazo de conservación, borrado automático, copias de seguridad y tratamiento de peticiones retiradas;
- categorías de datos y destinatarios autorizados, incluidos concesionarios y proveedores técnicos;
- si procede una evaluación de impacto y quién la aprueba;
- condiciones de participación del concesionario: identidad, verificación, exactitud, reclamaciones, retirada y prohibición de reutilizar datos;
- separación de ofertas, contacto posterior y comunicaciones comerciales;
- política de patrocinio: ningún pago puede cambiar el encaje técnico.

La AEPD identifica como medidas de responsabilidad proactiva el registro de actividades, evaluación de riesgos, protección desde el diseño, seguridad y gestión de brechas ([AEPD](https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/medidas-de-cumplimiento)). El RGPD exige documentar las actividades de tratamiento y las medidas aplicables, y prevé una evaluación de impacto cuando el tratamiento pueda entrañar alto riesgo ([artículos 30, 32 y 35 en EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/oj/spa)). Esto es una lista de revisión para el asesor jurídico, no un dictamen.

### 2. Staging técnico

Se necesita un entorno aislado y autorizado con:

- MySQL compatible con el esquema y credenciales de aplicación separadas;
- ejecución y verificación de `backend/migrations/001_purchase_requests_up.sql` y su rollback en una base desechable;
- secretos reales fuera del repositorio (`MYSQL_*`, `EMAIL_TOKEN_SECRET`, `REQUEST_BASE_URL`), TLS y rotación;
- backups, restauración probada, logs sin tokens ni payloads completos y alertas;
- límites de tasa, expiración, revocación, borrado y control de acceso probados con concurrencia;
- política de CORS y `Cache-Control: no-store` verificada desde el dominio frontend;
- procedimiento de rollback y responsable de guardia.

### 3. QA de aceptación

El equipo QA debe ejecutar con datos ficticios:

1. migración, rollback y restauración;
2. creación con cada radio permitido y rechazo de valores inválidos;
3. propietario, solo lectura, invitación y concesionario con permisos cruzados;
4. expiración, revocación y eliminación, incluida la invalidación de ofertas;
5. dos ofertas de la misma invitación y versionado concurrente;
6. respuestas incompletas, XSS en campos, tokens inválidos y rate limiting;
7. ausencia de email, teléfono, ubicación exacta y tokens en eventos/logs;
8. teclado, foco, lector de pantalla básico, móvil, contraste y estados de error;
9. PDF renderizado, descarga, enlaces y ausencia de datos ocultos;
10. regresión del valorador y comprobación de que producción no cambia por accidente.

La prueba E2E local ya cubre el recorrido funcional básico con una API efímera; no sustituye esta batería con MySQL real.

### 4. Piloto controlado

Empezar con pocos concesionarios identificados y aceptados, proceso manual, sin distribución automática ni contacto por defecto. Medir por separado:

- porcentaje de fichas completas;
- tiempo hasta primera respuesta;
- porcentaje de ofertas comparables;
- campos pendientes y contradicciones;
- abandono por etapa;
- satisfacción del comprador y del vendedor;
- solicitudes de retirada, reclamaciones y uso indebido.

No activar comunicaciones comerciales ni compartir contacto hasta una casilla y acción específicas para un concesionario concreto.

### 5. Activación y producción

Solo después de cerrar los puntos anteriores:

1. aprobar la spec legal/operativa y registrar la decisión;
2. pasar QA de staging y revisión de seguridad;
3. desplegar backend y páginas con commit identificado;
4. mantener `DEALER_OFFERS_ENABLED=false` durante el smoke test;
5. verificar dominio, HTTPS, API, migración, cabeceras, páginas públicas y rollback;
6. activar el flag únicamente para el piloto y con fecha de revisión;
7. observar métricas y detener el piloto si aparecen errores, quejas o respuestas no comparables.

## Dictamen final

**Preparación local:** apta para revisión de stakeholders y demostración controlada.  
**Preparación para producción:** no apta todavía.  
**Bloqueadores de activación:** legal/RGPD, staging MySQL, QA con persistencia real y piloto autorizado.  
**Cambios externos realizados:** ninguno.
