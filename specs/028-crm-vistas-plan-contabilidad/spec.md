# Especificación 028 — Vistas independientes, plan de negocio y contabilidad

## Objetivo

Convertir el CRM en una consola privada por vistas independientes. El dashboard CEO muestra solo el resumen ejecutivo; oportunidades, partners, tareas, contabilidad, plan de negocio, analítica y alertas se abren de forma explícita desde la navegación.

## Alcance

- Acceso a pantalla completa hasta validar la sesión.
- Logotipo real de CocheCierto en navegación y acceso.
- Navegación por hash con una sola vista principal visible.
- Dashboard CEO con gráficos de embudo, tendencia y cumplimiento.
- Contabilidad manual inicial de ingresos y gastos, sin conexión bancaria.
- Plan de negocio editable con objetivos mensuales y versiones locales.
- Comparación presupuesto vs real y alertas de desviación.

## Datos y privacidad

La primera versión conserva borradores de contabilidad y objetivos en el navegador del staff autenticado. No se guardan datos personales de clientes ni credenciales bancarias. La persistencia server-side requerirá migración, permisos, retención y revisión específica.

## Aceptación

1. Sin sesión, solo se ve la pantalla de acceso.
2. Con sesión, cada enlace lateral muestra exclusivamente su vista y conserva el estado en el hash.
3. El logotipo usa el activo oficial del proyecto y tiene texto alternativo.
4. Contabilidad permite registrar, editar y eliminar movimientos de prueba, mostrando totales mensuales.
5. Plan de negocio permite editar objetivos de los 12 meses, guardar una versión y comparar con datos contables.
6. Los gráficos tienen resumen textual y no presentan datos inventados como reales.
7. El diseño funciona en escritorio, tablet y móvil, en claro y oscuro.
8. Search Console permanece visible como desactivado y no realiza llamadas externas.
