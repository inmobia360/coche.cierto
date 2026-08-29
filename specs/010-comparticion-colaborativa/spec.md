# Spec 010 — Compartición colaborativa y crecimiento responsable

## Estado

Propuesta para aprobación. Define un MVP de colaboración privada alrededor de un análisis de compra. No activa publicaciones automáticas, recompensas económicas ni una red social abierta.

## Objetivo

Permitir que el propietario de un análisis pida ayuda a una persona de confianza sin exponer información financiera o personal innecesaria.

## Alcance del MVP

- Botón `Compartir para pedir opinión` dentro de un informe.
- Enlace privado con identificador aleatorio no predecible.
- Resumen de unidad, precio, coste estimado, encaje, riesgo, confianza y pendientes.
- Votación estructurada: `Lo compraría`, `Lo revisaría antes`, `Lo descartaría`.
- Campo opcional de comentario sujeto a moderación y límites.
- Tarjeta visual compartible por el usuario mediante el sistema del dispositivo.
- Revocación y caducidad del enlace.

## Datos que nunca se comparten por defecto

- Ingresos, ahorro, presupuesto personal detallado o teléfono del propietario.
- DNI, dirección, matrícula, bastidor completo o documentos originales.
- Nombre y teléfono del vendedor.
- Fotografías con datos personales visibles.

## Flujo

1. El usuario revisa el informe y pulsa compartir.
2. El sistema muestra una vista previa de los datos que verá el invitado.
3. El usuario confirma el alcance y genera el enlace.
4. El usuario decide cuándo y a quién enviarlo desde su propio dispositivo.
5. El invitado ve el resumen y puede votar o dejar una aportación estructurada.
6. El propietario consulta las respuestas y puede revocar el enlace.

## Seguridad y privacidad

- El enlace no debe contener datos personales ni parámetros descriptivos.
- El propietario puede revocar el acceso.
- El enlace tendrá caducidad configurable y límite de intentos abusivos.
- No se accederá a la agenda ni se enviarán invitaciones automáticamente.
- Las aportaciones no modificarán automáticamente el informe ni sus puntuaciones.
- Se registrará solo la actividad técnica mínima necesaria para seguridad y métricas.
- La política de privacidad debe explicar compartición, conservación y borrado.

## Contenido y lenguaje

El resumen debe distinguir:

- `[Observado en el anuncio]`.
- `[Aportado por el usuario]`.
- `[Calculado]`.
- `[Estimado]`.
- `[Pendiente de verificar]`.

Nunca se afirmará que una unidad está garantizada, que un vendedor actúa de forma fraudulenta o que una votación comunitaria demuestra el estado del coche.

## Moderación

El MVP priorizará respuestas estructuradas. Si se permite texto libre, deberá existir límite de longitud, opción de denunciar y revisión antes de mostrarlo públicamente. No se publicarán nombres, acusaciones, teléfonos ni datos de terceros.

## Tarjeta compartible

La tarjeta incluirá solo datos no sensibles: tipo de unidad, precio, coste estimado, encaje, riesgo, confianza, comprobaciones pendientes y enlace privado. Se generará inicialmente como vista web; las versiones sociales se añadirán tras revisar privacidad, marca y metadatos.

## Métricas

- Informes compartidos.
- Aperturas de enlaces.
- Votos recibidos.
- Invitados que completan un diagnóstico propio.
- Revocaciones y denuncias.
- Tiempo desde el resultado hasta el primer compartir.

No se considerará éxito el número bruto de mensajes ni se premiará el spam.

## Fuera de alcance

- Red social abierta.
- Publicación automática en redes.
- Acceso a contactos del dispositivo.
- Recompensas económicas o programa de referidos activo.
- Rankings de vendedores o marcas.
- Contacto automático con vendedores.
- Comparación colaborativa de anuncios de terceros sin consentimiento.

## Criterios de aceptación

- El propietario ve y confirma los datos antes de generar el enlace.
- Un enlace revocado deja de mostrar el informe.
- El enlace caducado muestra una explicación y no revela datos.
- El invitado puede votar sin crear una cuenta.
- El informe original no cambia por una votación.
- La tarjeta no expone datos personales.
- El flujo funciona en móvil y escritorio sin desbordamiento.
- No se envían invitaciones ni mensajes sin acción expresa del usuario.

## Handoff

`PRODUCTO-SDD → UX-CONTENIDO → SEGURIDAD-DATOS → LEGAL-CONFIANZA → CONVERSION-CRM → INGENIERIA-WEB → QA-VALIDACION`

`INFORME-ACCIONABLE`, `AUTO-RIESGO`, `SOCIAL-CONTENIDO` y `SEO-AEO-GEO` revisan el formato del resumen y de la tarjeta antes del desarrollo.
