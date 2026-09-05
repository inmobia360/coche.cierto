# Spec 026 — Republicación social asistida

## Objetivo

Reducir el trabajo de adaptar publicaciones de CocheCierto a cada red sin automatizar publicaciones ni acceder a datos de terceros.

## Alcance MVP

- Extensión Chrome Manifest V3 independiente.
- Borradores locales con texto, canal, campaña y enlace con UTMs.
- Copia del contenido y apertura del destino elegido.
- Confirmación humana obligatoria antes de publicar.
- Límite local de 20 borradores y borrado manual.

## Fuera de alcance

Scraping, lectura de grupos o contactos, publicación automática, invitaciones, evasión de límites, interacción masiva y acceso a cuentas mediante credenciales guardadas.

## Aceptación

- `manifest.json` es MV3 y solicita únicamente `storage`, `clipboardWrite` y `tabs`.
- Cada enlace conserva UTMs por canal y campaña.
- Ninguna acción publica por sí sola.
- El usuario puede borrar los borradores localmente.
