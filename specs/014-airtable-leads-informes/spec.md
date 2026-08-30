# Spec 014 - Airtable para leads e informes beta

## Objetivo

Usar Airtable como panel operativo para leads y como almacenamiento temporal de los datos mínimos necesarios para recuperar un informe privado durante 7 días.

## Alcance

- Crear un registro de lead por solicitud válida.
- Guardar respuestas normalizadas y resultado orientativo, sin credenciales ni PDF.
- Guardar únicamente el hash del token privado y su caducidad.
- Recuperar un informe tras reiniciar el backend cuando Airtable esté configurado.
- Mantener el modo memoria como fallback si no existen variables Airtable.

## Privacidad y seguridad

- La API de Airtable solo se invoca desde el backend.
- El token personal de Airtable se configura como secreto del servidor.
- La URL del usuario contiene un token opaco, nunca el email ni sus respuestas.
- No se guardan contraseñas SMTP, datos bancarios ni el PDF completo.
- Los registros caducados deben eliminarse o anonimizarse mediante una tarea posterior.

## Campos mínimos

`request_id`, `email`, `intent`, `purchase_window`, `usage_type`, `recommended_category`, `priority`, `questionnaire_version`, `recommendation_version`, `consent_result`, `consent_commercial`, `token_hash`, `expires_at`, `verified_at`, `status`, `created_at`.

## Criterios de aceptación

- [ ] Sin configuración Airtable, el flujo actual sigue funcionando.
- [ ] Con configuración Airtable, se crea un lead sin exponer el token.
- [ ] Un informe validado puede recuperarse tras reiniciar el proceso.
- [ ] Un token caducado o inexistente no permite descargar el PDF.
- [ ] Las variables se validan y no se incluyen en Git.
- [ ] Se documenta que Airtable es proveedor de tratamiento y que la retención beta es limitada.
