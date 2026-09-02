# Revisión de Secretaria — 1 de septiembre de 2026

## Veredicto

El proyecto puede continuar con documentación, especificación y auditorías. No está listo para adquisición de tráfico,
producción masiva ni conexión de una API LLM porque siguen abiertas validaciones de confianza, funcionamiento desplegado,
medición y decisión técnica.

## Pendientes priorizados

| Prioridad | Pendiente | Responsable | Salida esperada |
|---|---|---|---|
| Crítica | Confirmar textos legales definitivos y claims | LEGAL-CONFIANZA + director | Aprobado para beta por el usuario el 2026-09-01; queda revisión jurídica profesional si procede |
| Alta | Probar navegación, leads, email, verificación e informes en entorno desplegado | QA-VALIDACION + INGENIERIA | Evidencia reproducible |
| Alta | Aprobar catálogo de eventos y medición con consentimiento | CONVERSION-CRM + SEGURIDAD-DATOS | Ambos aprobados para beta el 2026-09-01; no se conecta receptor externo hasta definir una nueva revisión |
| Alta | Validar las cuatro páginas/activos P0 del mapa de búsquedas | MIKE + PRODUCTO-SDD | Intención, CTA, utilidad y criterio de éxito |
| Alta | Cerrar la calculadora de presupuesto prudente como primer activo P0 | PRODUCTO-SDD + FINANZAS-TCO + LEGAL-CONFIANZA + SEGURIDAD-DATOS | Puntos 1–6 aprobados para beta; queda conector de hosting y verificación de producción |
| Alta | Obtener el workbook completo o confirmar que se trabajará con el mapa textual | director + MIKE | Fuente de keywords trazable |
| Alta | Comparar APIs LLM para personalización y engagement | LLM-ARQUITECTURA | En curso: informe inicial creado; falta contrato, evaluación y revisión de datos |
| Media | Revisar SEO técnico, schema, canonicals, sitemap y enlaces internos | SEO-AEO-GEO | Auditoría técnica |
| Media | Cerrar responsive, accesibilidad y enlaces sociales | UX-CONTENIDO + QA-VALIDACION | Evidencia manual |
| Media | Verificar descargas PDF de las guías P0 en producción | SECRETARIA + QA-VALIDACION | HTTP 200, descarga correcta, CTA y eventos comprobados |

## Seguimiento

Secretaria volverá a revisar este documento cuando exista una nueva evidencia o decisión. Un pendiente solo se marca como
cerrado con responsable, criterio de aceptación y prueba enlazable.

## Regla añadida — 2 de septiembre de 2026

Antes de cualquier salida a web, Secretaría debe ejecutar la [regla de primera carga directa](web-release-rules.md):
logo, navegación completa —incluida “Guías”—, footer único, rutas profundas y service worker deben funcionar sin
recargar. Si una URL solo se corrige al recargar, el release queda bloqueado.

La revisión incluye también la [regla de menú móvil](web-release-rules.md#menú-móvil-y-conversión): barra única,
CTA `Valorar`, panel agrupado, cierre accesible y ausencia de textos cortados o desplazamiento horizontal.

## Hecho en local — 2 de septiembre de 2026

Se generaron e integraron cuatro PDFs P0 con descarga directa durante la beta. La auditoría local confirmó 446 enlaces
estáticos válidos, cuatro PDFs de una página y un CTA interno en cada PDF hacia `/valorador/`. La verificación pública
queda pendiente hasta el próximo despliegue autorizado.

## Ejecución de prioridad inmediata SEO y P0 — 2 de septiembre de 2026

### Completado en local

| Entrega | Evidencia | Estado |
|---|---|---|
| Superficie P0 de presupuesto | `/que-coche-me-puedo-permitir/` existente y enlazada en sitemap | RC local |
| Superficie P0 de revisión/riesgo | `/que-revisar-coche-segunda-mano/` con checklist y límites | RC local |
| Metadatos P0 | Canonical, robots, OG/Twitter, H1 y JSON-LD en los dos activos | Validado por `qa/test-seo.py` |
| Enlazado | Recursos y guía de índices enlazan la checklist; CTA conserva intención | Validado por `qa/test-static-links.py` |
| Medición | Eventos locales sin PII para presupuesto y revisión | Sin receptor externo |
| Control SEO | `qa/test-seo.py` añadido; sitemap excluye copias internas | Validado: `seo_qa=ok public_pages=3` |
| Recorrido web | Rutas, header, menú, footer y nueva ruta P0 | Validado por `qa/test-url-flow.py` con Chromium local |
| Checklist | Ocho puntos, resumen, CTA y eventos locales | Validado: `review_qa=ok items=8 local_events=3+` |

### Pendientes conservados

- Crear `/coste-real-coche/` y cerrar su modelo de costes con `FINANZAS-TCO`.
- Cerrar `/analizar-anuncio-coche/` como activo P0 sin scraping ni diagnóstico.
- Validar los cuatro territorios con `MIKE` y `PRODUCTO-SDD`.
- Aprobar receptor de analítica consentida y probarlo en entorno autorizado.
- Revisar textos legales definitivos y realizar pruebas de API/email en entorno desplegado.
- Importar el workbook de keywords cuando esté disponible.
- No iniciar campañas, páginas P1, contenido masivo, integraciones ni scraping.
