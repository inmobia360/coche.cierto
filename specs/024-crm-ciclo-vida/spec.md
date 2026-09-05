# Especificación 024 — CRM del ciclo de vida CocheCierto

## Objetivo

Crear la base para acompañar cada caso desde el diagnóstico hasta la compra y los servicios posteriores, y permitir registrar concesionarios y contactos para un piloto futuro. No se crean concesionarios reales en esta fase.

## Alcance local

- Registro interno de casos, etapas, eventos y tareas de poscompra.
- Registro de empresa y contactos separado, nunca visible al comprador.
- Asociación explícita caso–concesionario, con estados de relación.
- Transiciones controladas y trazables; no se permiten saltos arbitrarios.
- Pantalla CRM local con estados vacíos y activación cerrada por defecto.
- Trazabilidad condicionada: el sistema registra solicitud de informe, validación, petición privada, invitación y oferta solo cuando existe la acción explícita correspondiente.
- La autorización de contacto es una acción separada de recibir ofertas y no envía comunicaciones por sí misma.
- Las tareas de acompañamiento usan un catálogo explícito para separar preparación, entrega y servicios posteriores: documentación, inspección, seguro, transferencia, entrega, revisión financiera, mantenimiento inicial, garantía, reclamación de garantía y seguimiento.

## Fuera de alcance hasta autorización

- Importar o contactar concesionarios reales.
- Envío automático de email, WhatsApp o SMS.
- Alta automática de usuarios por navegar o iniciar el valorador sin consentimiento.
- Activación en producción, scraping, pagos o integración con un CRM externo.
- Decisiones legales sobre base jurídica, conservación o encargados.

## Principios de datos

Se reutilizan referencias internas a `leads` y `purchase_requests` sin duplicar nombre, email, teléfono, respuestas o coordenadas. Los contactos de concesionarios viven en una tabla restringida. El CRM no tiene rutas públicas: requiere bandera de activación y autorización interna.

## Ciclo de caso

`visitor → diagnostic_started → report_requested → report_verified → request_draft → request_active → shared_manual → offer_received → comparison → contact_authorized → visit_requested → test_requested → purchased → aftercare → closed`.

Estados de salida: `withdrawn`, `expired` y `blocked`.

## Medición del ciclo de vida

El CRM distinguirá el estado operativo del caso de los eventos de producto. Un caso puede tener varios informes, invitaciones o intentos de compartir; cada acción debe conservar su fecha, origen y referencia sin duplicar los datos personales del lead.

### Eventos mínimos

Se registrarán únicamente después de la acción correspondiente y, cuando implique datos identificables o contacto, después del consentimiento aplicable:

| Evento | Momento | Identificadores y metadatos permitidos |
|---|---|---|
| `diagnostic_started` | Se inicia el valorador | versión, página de origen, sesión técnica |
| `diagnostic_step_completed` | Se completa una pregunta o bloque | paso, versión, tiempo transcurrido |
| `diagnostic_abandoned` | Caduca o se abandona explícitamente | último paso, motivo técnico si existe |
| `orientation_viewed` | Se muestra la orientación inmediata | versión del resultado |
| `report_requested` | Se solicita guardar o recibir informe | canal, versión, consentimiento de entrega |
| `report_verified` | Se valida el email | proveedor y versión del flujo, sin guardar el email en el evento |
| `report_opened` | Se abre un informe válido | report_id interno, canal |
| `resource_viewed` | Se consulta un recurso desde el informe | recurso, perfil y etapa |
| `subscription_started` / `subscription_cancelled` | Alta o baja de una suscripción aprobada | plan, versión, motivo opcional |
| `share_previewed` / `share_created` | Se revisa y genera un enlace privado | caso, caducidad, campos autorizados |
| `share_opened` / `share_responded` | El invitado abre y responde | referral_id, tipo de respuesta, sin identidad por defecto |
| `referred_diagnostic_started` / `referred_user_activated` | El invitado inicia y valida su propia valoración | referral_id, caso nuevo |
| `offer_received` / `comparison_viewed` | Se recibe o consulta una oferta | caso, oferta versionada, concesionario interno |
| `purchase_declared` | El usuario declara una compra | fuente de confirmación, fecha aproximada |
| `aftercare_task_completed` | Se completa una tarea poscompra | tipo y responsable interno |

Los eventos serán idempotentes mediante un `event_id` único. Los reintentos no podrán inflar conversiones. No se registrarán pulsaciones en elementos que no impliquen una acción real como si fueran conversiones.

### Atribución y referidos

La atribución de una recomendación usará un `referral_id` aleatorio, separado del token privado del informe. Se conservarán `referrer_case_id`, `referred_case_id` cuando exista, `source`, `campaign` y las fechas de creación, apertura y activación. No se accederá a la agenda ni se enviarán mensajes automáticamente.

Un referido contará como activado cuando complete una valoración y valide el email para guardar el resultado. El sistema atribuirá una activación una sola vez al enlace utilizado, con ventana configurable documentada. Las recompensas económicas o descuentos quedan fuera de esta ampliación hasta disponer de una spec de pagos, reglas antifraude y revisión legal.

### Vistas y métricas del CRM

La consola interna deberá ofrecer, con controles de acceso y datos agregados:

- Embudo: inicio, finalización, orientación, solicitud, validación, apertura y activación.
- Operaciones: casos por etapa, antigüedad, responsable, prioridad y próxima acción vencida.
- Compartición: enlaces creados, aperturas, respuestas, activaciones atribuidas y revocaciones.
- Negocio: conversiones por origen, campaña, perfil y cohorte; ingresos solo cuando exista un registro de pago autorizado.
- Poscompra: tareas abiertas, vencidas y completadas por tipo.

Las métricas deberán definir numerador, denominador, ventana temporal y unidad (caso, usuario, informe, invitación o evento). Se podrán comparar cohortes por semana o mes de activación. El número bruto de enlaces, mensajes o clics no se considerará éxito por sí mismo.

### Privacidad, calidad y retención

La analítica de abandono previa al email será técnica y no identificable, salvo que exista una base jurídica aprobada. Los eventos identificables reutilizarán referencias internas y no copiarán nombre, email, teléfono, respuestas completas ni coordenadas. Cada evento tendrá versión de esquema y política de conservación; la supresión de un caso deberá anonimizar o eliminar sus eventos según la decisión legal aprobada.

No se habilitarán proveedores externos de analítica, email, WhatsApp, SMS, pagos o CRM hasta aprobar una spec específica, contrato, base jurídica, roles, conservación y prueba de supresión.

## Criterios de aceptación de medición

- Cada transición del ciclo genera como máximo un evento de transición válido.
- Un usuario con varios informes conserva sus recorridos separados por `case_id` y `report_id`.
- Los eventos duplicados por reintento no alteran las métricas.
- Un referido se atribuye al enlace utilizado y no se cuenta antes de completar valoración y validación.
- La consola permite filtrar por etapa, origen, campaña, cohorte y responsable sin mostrar PII innecesaria.
- Las métricas muestran definición, periodo y unidad de conteo.
- Revocar o caducar un enlace impide nuevas aperturas y no revela datos.
- La supresión y exportación respetan referencias, auditoría y política aprobada.
- El CRM permanece cerrado por defecto y no envía comunicaciones.
