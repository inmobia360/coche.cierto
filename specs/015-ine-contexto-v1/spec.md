# Spec 015 — Contexto oficial del INE

## Objetivo

Incorporar una consulta backend controlada a la API pública del INE para aportar contexto estadístico agregado, con trazabilidad y sin inferir características individuales.

## Alcance MVP

- Usar únicamente la tabla INE 50902 como primera fuente fija.
- Consultar desde backend y conservar una caché temporal de seis horas.
- Devolver indicador, significado, fuente, tabla, fecha de consulta, ámbito, unidad y limitaciones.
- Mantener operativo el valorador si el INE no responde.
- No aceptar URLs, tablas o filtros arbitrarios desde el cliente.

## Criterios de aceptación

- `GET /api/ine-context` devuelve JSON válido cuando el INE responde.
- Una indisponibilidad devuelve `503` explicativo sin inventar datos.
- La respuesta diferencia dato oficial agregado de datos declarados por el usuario.
- No se infieren ingresos, solvencia, empleo, nacionalidad ni riesgo crediticio.

## Fuente

API JSON oficial del INE: `https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/50902`.
