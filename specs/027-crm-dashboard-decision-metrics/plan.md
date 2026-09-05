# Plan de implementación — 027

1. Aprobar el catálogo de métricas y sus denominadores con Producto, Conversión-CRM y Seguridad-Datos.
2. Definir contrato API de KPIs, series y alertas con estados explícitos.
3. Rediseñar la composición del dashboard alrededor de periodo, embudo, tendencias y siguiente decisión.
4. Añadir estados responsive, claro/oscuro, accesibilidad y alternativa tabular para gráficos.
5. Implementar primero métricas propias e idempotencia; validar con datos de staging.
6. Preparar el adaptador Search Console detrás de bandera, sin credenciales ni llamadas en esta fase.
7. Ejecutar revisión legal y de seguridad antes de cualquier OAuth, retención o sincronización externa.

## Validación previa a activación

- `CRM_ENABLED=false` por defecto.
- No existen secretos de Google en el repositorio ni en respuestas del navegador.
- Search Console aparece como `Desactivado` y no genera datos ficticios.
- Pruebas de responsive, foco, contraste, estados vacíos y error de sincronización.
- Pruebas de idempotencia y filtros con periodos/cohortes conocidos.
