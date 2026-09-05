# Spec 024-A — Acceso staff con doble factor

## Objetivo

Proteger `https://cochecierto.com/crm/` con dos factores independientes antes de mostrar o modificar datos operativos.

## Alcance

- Inicio de sesión con identificador de staff y contraseña almacenada únicamente como hash Argon2id o scrypt.
- Segundo factor TOTP compatible con aplicaciones autenticadoras. La semilla se guarda cifrada fuera del repositorio y nunca se muestra después de configurarla.
- Sesión de servidor mediante cookie `HttpOnly`, `Secure`, `SameSite=Strict`, caducidad corta y renovación controlada.
- Protección CSRF para operaciones mutables.
- Límite de intentos por cuenta e IP, respuestas genéricas y registro de auditoría sin credenciales ni PII.
- Cierre de sesión, revocación de sesiones y recuperación mediante procedimiento staff fuera de la aplicación.
- Roles mínimos: `staff_read` y `staff_operator`; las operaciones de escritura requieren `staff_operator`.

## Fuera de alcance

No se habilita acceso público, registro autónomo, recuperación por email, SMS, WhatsApp ni APIs sociales. No se almacenan códigos TOTP en claro ni secretos en GitHub, navegador local o logs.

## Variables privadas

`CRM_AUTH_SECRET`, `CRM_STAFF_PASSWORD_HASH`, `CRM_TOTP_SECRET_ENCRYPTED`, `CRM_SESSION_TTL_SECONDS` y `CRM_ENABLED`. La configuración debe realizarse en Hostinger sin reemplazar accidentalmente las variables existentes.

## Criterios de aceptación

1. Una contraseña correcta sin TOTP no crea sesión.
2. Un TOTP incorrecto o caducado no crea sesión y activa el rate limit.
3. Una sesión válida exige cookie segura y CSRF válido para POST/PATCH/DELETE.
4. La sesión caduca y puede revocarse sin reiniciar la base de datos.
5. Las rutas CRM responden 401/403 sin sesión o con rol insuficiente.
6. No aparecen contraseña, semilla, token, cookie ni PII en respuestas o logs.
7. El panel no se indexa y no ofrece información operativa cuando está bloqueado.
8. Las pruebas cubren éxito, fallo de cada factor, replay de TOTP, expiración, revocación, CSRF y límites.

## Handoff

SEGURIDAD-DATOS revisa almacenamiento y retención → INGENIERÍA implementa → QA-VALIDACIÓN ejecuta pruebas → propietario autoriza el piloto interno.
