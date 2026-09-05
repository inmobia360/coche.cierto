# Plan de implementación

1. Crear migración MySQL reversible y contrato de estados.
2. Añadir API interna protegida, con `CRM_ENABLED=false` por defecto.
3. Crear una consola local sin datos reales para registrar concesionarios y casos.
4. Validar estructura, autorización, transiciones y cierre seguro de la consola.
5. En staging: ejecutar migración, probar retención/borrado, roles y piloto autorizado.
6. Solo después de revisión legal/RGPD y aprobación expresa: poblar concesionarios y activar el flujo.

## Extensión de medición y crecimiento

7. Aprobar el catálogo de eventos y las definiciones de métricas.
8. Crear tablas versionadas de eventos y atribución de referidos, con deduplicación.
9. Instrumentar el valorador, informes y compartición manual sin identificar visitantes anónimos.
10. Añadir paneles internos de embudo, cohortes, operaciones, referidos y poscompra.
11. Validar supresión, exportación, revocación y límites de conservación antes de cualquier proveedor externo.
