# Especificación 027 — Dashboard de decisiones y conectores de analítica

## Objetivo

Evolucionar el panel privado de CocheCierto hacia un dashboard de decisiones inspirado en patrones de analítica B2B: lectura rápida del estado, comparación temporal, embudo accionable y alertas priorizadas. La interfaz debe conservar la identidad CocheCierto, ser responsive y mostrar siempre la fuente, periodo, unidad y estado de conexión de cada dato.

Esta spec **define el flujo de Google Search Console, pero no activa su integración**. Ninguna cuenta, API, credencial ni sincronización se configura como parte de esta iniciativa.

## Dirección visual

- Composición a ancho completo con navegación lateral en escritorio y navegación compacta en móvil/tablet.
- Cabecera con periodo, comparación y estado de datos; filtros visibles y persistentes.
- Primera fila: cuatro KPI compactos con valor actual, variación frente al periodo anterior y definición accesible.
- Segunda zona: embudo de ciclo de vida y tendencia temporal; cada gráfico debe indicar unidad y denominador.
- Tercera zona: tarjetas de adquisición, referidos, SEO orgánico y operaciones.
- Panel de “siguiente decisión” que convierte una señal en acción concreta, con severidad y fecha.
- Estados `conectado`, `sin datos`, `desactivado`, `error` y `datos atrasados`; nunca rellenar con estimaciones silenciosas.
- Claro/oscuro mediante las variables existentes; contraste AA, foco visible y tablas legibles sin depender del color.
- En móvil, las tarjetas se apilan; no se usan pestañas horizontales obligatorias para acceder a una métrica crítica.

## Métrica rectora y catálogo

La métrica rectora del panel es **valoraciones completadas que llegan a un siguiente paso útil**, definida como `valoraciones_completadas / valoraciones_iniciadas` dentro de la misma cohorte y ventana. No se presenta como éxito comercial ni como aprobación financiera.

### Adquisición y activación

| Métrica | Numerador / denominador | Unidad | Uso |
|---|---|---|---|
| Inicio de valoración | sesiones con inicio | sesión | Detectar demanda inicial |
| Finalización | valoraciones completadas / inicios | valoración | Medir fricción del formulario |
| Solicitud de informe | solicitudes / completadas | valoración | Medir intención |
| Validación de email | emails validados / solicitudes | usuario | Medir entrega autorizada |
| Activación atribuida | referidos que completan y validan / enlaces abiertos | referido | Medir viralidad real |

### Compartición y viralidad

- enlaces creados, abiertos, revocados y caducados;
- tasa de apertura = aperturas únicas / enlaces creados;
- tasa de activación = referidos activados / aperturas únicas;
- tiempo mediano desde apertura hasta activación;
- distribución por origen/campaña y cohorte semanal.

Los clics de compartir o visitas salientes no cuentan como conversión por sí solos.

### Operaciones y calidad

- casos por etapa, antigüedad, responsable y prioridad;
- tareas vencidas / tareas abiertas;
- tiempo mediano hasta primera acción y hasta resolución;
- errores de flujo por tipo y tasa de reintento;
- eventos duplicados rechazados por idempotencia;
- latencia y última sincronización de cada conector.

### Contenido y redes

El panel puede registrar publicaciones y enlaces con `source`, `campaign`, `content_id` y fecha. Mientras no exista un adaptador oficial autorizado, solo se muestran clics salientes medidos por CocheCierto. No se presentan impresiones, alcance o visitas de una red como si estuvieran confirmados.

## Flujo de Google Search Console (definido, desactivado)

1. Un administrador abre **Configuración → Fuentes de datos → Google Search Console**.
2. El panel muestra el estado `Desactivado`, el alcance solicitado (solo lectura) y qué métricas aportará.
3. En una futura activación, el administrador iniciará OAuth de Google con el alcance mínimo `webmasters.readonly` y solo para `https://cochecierto.com/`.
4. El servidor almacenará el refresh token cifrado fuera del repositorio; el navegador nunca recibirá secretos.
5. Un job programado consultará la API oficial por fecha, país, dispositivo, consulta y página según el nivel aprobado; guardará agregados y `last_synced_at`.
6. El CRM mostrará clics, impresiones, CTR y posición media junto con periodo, zona horaria, propiedad y hora de sincronización.
7. Ante error, el estado pasa a `error`, se conserva el último dato válido con fecha visible y se crea una alerta; no se sustituye por cero.
8. El administrador podrá desconectar, revocar consentimiento y solicitar supresión de los datos sincronizados.

### Reglas de seguridad del conector

- Activación por bandera independiente y desactivada por defecto.
- OAuth server-side, scopes mínimos, secretos solo en Hostinger y registros sin tokens.
- Rutas CRM protegidas por sesión staff y autorización por rol.
- No almacenar datos personales de usuarios de Search Console ni exportar consultas a terceros.
- Retención, supresión y responsable del tratamiento deben aprobarse antes de activar.

## Contrato de datos del dashboard

Cada serie o KPI devuelve: `metric`, `value`, `period`, `comparison`, `unit`, `definition`, `source`, `status`, `last_updated_at` y, cuando aplique, `cohort` y `filters`. Los valores no disponibles usan `null` más un estado explicativo.

Las alertas devuelven `severity`, `cause`, `first_seen_at`, `next_action`, `source` y `status`; nunca PII.

## Criterios de aceptación

1. El panel permite cambiar periodo, comparación, origen, campaña y cohorte sin perder el contexto.
2. Cada KPI muestra definición, denominador, unidad y fuente mediante texto accesible.
3. La ausencia de Search Console se ve como `Desactivado`; no hay datos simulados ni llamadas a Google.
4. Un error de sincronización conserva la fecha del último dato válido y genera una alerta visible.
5. El embudo distingue usuarios, valoraciones, informes, enlaces y eventos.
6. Un evento repetido no cambia ningún contador.
7. La vista funciona a 320 px, tablet y escritorio sin solapar tarjetas ni ocultar la siguiente acción.
8. El contraste y el foco cumplen AA; los gráficos tienen alternativa tabular o resumen textual.
9. El panel continúa cerrado para usuarios sin sesión staff y permanece `noindex`.

## Fuera de alcance

- Conectar o autorizar Google Search Console, GA4 o redes sociales.
- Crear campañas, publicar contenido, enviar emails o automatizar mensajes.
- Scraping de paneles de terceros.
- Predicciones de ingresos o atribución que no tengan fuente y denominador aprobados.

