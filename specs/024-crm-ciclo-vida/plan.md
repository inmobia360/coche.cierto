# Plan de implementación

1. Crear migración MySQL reversible y contrato de estados.
2. Añadir API interna protegida, con `CRM_ENABLED=false` por defecto.
3. Crear una consola local sin datos reales para registrar concesionarios y casos.
4. Validar estructura, autorización, transiciones y cierre seguro de la consola.
5. En staging: ejecutar migración, probar retención/borrado, roles y piloto autorizado.
6. Solo después de revisión legal/RGPD y aprobación expresa: poblar concesionarios y activar el flujo.
