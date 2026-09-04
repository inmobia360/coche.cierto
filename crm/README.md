# Consola CRM interna

Esta carpeta contiene una consola de operaciones local. No es una página pública ni un CRM activado.

## Uso previsto

1. Configurar el backend con MySQL de staging y un token interno gestionado fuera del repositorio.
2. Aplicar la migración 002 siguiendo el handoff de `specs/024-crm-ciclo-vida/`.
3. Activar `CRM_ENABLED=true` únicamente después de RGPD, autenticación y aprobación del piloto.
4. Introducir concesionarios como `draft`; pasar a `verified` solo con `data_processing_status=approved`.
5. Crear casos y avanzar fases con una razón operativa breve, sin datos personales.
6. Asignar responsable, prioridad y próxima acción; revisar primero los casos vencidos o sin fecha.
7. Gestionar tareas de acompañamiento y cerrar cada caso solo cuando exista evidencia operativa.

## Límites

- No se cargan concesionarios reales en el repositorio.
- La consola no envía emails, SMS, WhatsApp ni realiza llamadas.
- Los contactos están restringidos al backend interno y no aparecen en la ficha del comprador.
- El token no debe guardarse en archivos, navegador compartido, Git ni logs.
