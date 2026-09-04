# Mapa de datos para revisión legal/RGPD

Estado: preparado para revisión; no constituye aprobación legal ni define por sí solo la base jurídica o los plazos de conservación.

## Inventario funcional

| Elemento | Datos previstos | Finalidad | Acceso | Decisión pendiente |
|---|---|---|---|---|
| Lead | Email, teléfono y nombre opcional; respuestas mínimas del diagnóstico | Entregar y recuperar el informe solicitado | Backend y proveedor configurado, si procede | Base jurídica, conservación y proveedor encargado |
| Petición privada | Ficha mínima de necesidades y hashes de tokens | Permitir compartir manualmente una necesidad y revocarla | Backend; comprador mediante token | Plazo de conservación y procedimiento de supresión |
| Invitación/oferta | Hash de invitación, oferta estructurada y estado | Recibir una respuesta que el comprador pueda comparar | Backend; comprador solo ve la ficha autorizada | Conservación, responsabilidades del vendedor y soporte |
| Caso CRM | Referencias internas a lead/petición, fase, eventos, responsable, prioridad y próxima acción | Coordinar seguimiento y servicios | Personal interno autorizado | Roles, auditoría, exportación y retención |
| Concesionario | Razón social, nombre comercial, identificadores operativos y estados de verificación | Preparar un piloto futuro | Personal interno autorizado | Diligencia, contrato y fuente de cada dato |
| Contacto de concesionario | Nombre, cargo, email, teléfono/WhatsApp y estado de autorización | Facilitar seguimiento autorizado en el piloto | Personal interno autorizado; nunca comprador por defecto | Consentimiento/base jurídica, canal y conservación |
| Tarea de servicio | Tipo, vencimiento, responsable, estado y nota operativa sin PII | Acompañar entrega, mantenimiento, garantía y seguimiento | Personal interno autorizado | Alcance del servicio y supresión |

## Exclusiones explícitas

- No se guardan contraseñas ni tokens en claro.
- El CRM no duplica deliberadamente nombre, email, teléfono, respuestas o coordenadas exactas del comprador.
- Las notas operativas rechazan emails y teléfonos para evitar copiar contactos restringidos en texto libre.
- No se envían emails, WhatsApp ni SMS automáticamente desde este alcance.
- No se incorporan concesionarios reales ni contactos reales en esta fase.

## Puertas para Legal y Seguridad-Datos

1. Confirmar responsables y encargados del tratamiento, incluidos proveedores opcionales.
2. Definir base jurídica separada para informe, compartición manual, oferta y contacto.
3. Definir conservación, supresión, revocación, exportación y atención de derechos.
4. Confirmar roles internos, registro de accesos y auditoría sin PII innecesaria.
5. Aprobar textos visibles antes de habilitar `CRM_ENABLED=true` o cualquier canal externo.

Hasta resolver estas decisiones, `CRM_SCHEMA_READY` solo acredita estructura MySQL comprobada y no equivale a autorización legal.
