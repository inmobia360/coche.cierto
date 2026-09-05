# Runbook de staging — CRM 024

Este procedimiento no activa producción ni modifica datos públicos.

## 1. Variables privadas

Crear `backend/.env` fuera de Git con `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER` y `MYSQL_PASSWORD`. Añadir temporalmente:

```env
CRM_MIGRATION_CONFIRM=APPLY_CRM_003
CRM_DB_CHECK_CONFIRM=CHECK_CRM_002
CRM_ENABLED=false
CRM_SCHEMA_READY=false
CRM_ADMIN_TOKEN=<token generado fuera del repositorio>
```

## 2. Aplicación y comprobación

Desde la raíz del proyecto:

```powershell
npm --prefix backend run db:migrate:crm
npm --prefix backend run db:migrate:crm-observability
npm --prefix backend run db:check:crm
npm --prefix backend run check:crm-observability
```

La comprobación estructural solo inspecciona tablas y columnas; no lee registros de negocio.

## 3. Piloto cerrado

Después de revisar RGPD, autenticación interna, retención, supresión y exportación, establecer `CRM_SCHEMA_READY=true` y mantener `CRM_ENABLED=false` hasta la autorización expresa del piloto. Solo entonces se puede habilitar `CRM_ENABLED=true` en staging, nunca reutilizando el token en el navegador compartido.

## 4. Criterio de salida

El piloto debe demostrar: acceso staff autenticado, eventos duplicados sin doble conteo, alertas sin PII, carga del CRM sin CRM 003 y ausencia de comunicaciones externas automáticas.
