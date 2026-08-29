# Prompt de implementación del Buscador Multifuente de CocheCierto

## Rol

Actúa como arquitecto de software, desarrollador full-stack senior, ingeniero de datos y especialista en automatización web responsable. Debes diseñar e implementar en el proyecto existente de **CocheCierto** un recurso que permita localizar, normalizar, comparar y analizar ofertas de vehículos procedentes de varias fuentes públicas o autorizadas.

No construyas un clon de los portales de anuncios. CocheCierto debe funcionar como una capa de búsqueda y decisión que:

- Recibe perfiles y criterios de búsqueda.
- Consulta fuentes previamente aprobadas.
- Normaliza los vehículos encontrados.
- Detecta anuncios repetidos.
- Calcula su compatibilidad con el comprador.
- Señala información pendiente y riesgos que deben verificarse.
- Dirige siempre al anuncio original.
- Permite guardar finalistas y recibir alertas.

## Instrucción previa obligatoria

Antes de escribir o modificar código:

1. Audita el repositorio completo y explica el stack, arquitectura, despliegue, base de datos, autenticación, analítica, tareas programadas y convenciones existentes.
2. Comprueba la implementación actual de `/valorador/`, `/demo/`, `/buscador/`, cuenta, pagos, informes y sistema visual.
3. Revisa especificaciones, ADR, documentación SDD, pruebas y variables de entorno existentes.
4. Identifica cambios no relacionados y no los sobrescribas.
5. Presenta una matriz de viabilidad para cada fuente candidata antes de conectarla.
6. Implementa primero una prueba controlada con datos simulados identificados, carga manual, URLs aportadas por el usuario o una fuente autorizada.
7. No asumas que una página pública concede permiso para extracción y reutilización sistemática.
8. Si una fuente exige autenticación, CAPTCHA, evasión de bloqueos, rotación para ocultar actividad o incumplimiento de condiciones, detén ese conector y notifícalo.

No publiques en producción ni actives consultas externas recurrentes sin autorización expresa del responsable de CocheCierto.

## Objetivo del MVP

El MVP debe permitir:

1. Registrar desde administración una URL de búsqueda previamente filtrada.
2. Asociarla con un portal y tipo de vendedor.
3. Ejecutar una consulta manual o programada de baja frecuencia.
4. Extraer únicamente campos esenciales permitidos.
5. Guardar procedencia y fecha de cada dato.
6. Normalizar los anuncios en un modelo común.
7. Detectar anuncios nuevos, modificados, retirados y potencialmente duplicados.
8. Aplicar los filtros y SmartScore de CocheCierto.
9. Mostrar una lista de oportunidades con enlace al anuncio original.
10. Permitir favoritos, comparación de tres finalistas y alertas configurables.

## Fuentes candidatas

Esta tabla es un inventario para evaluar, no una autorización para automatizar.

### Portales mixtos

| Código interno sugerido | Portal | Oferta | URL inicial |
|---|---|---|---|
| `coches_net` | Coches.net | Particulares y profesionales | `https://www.coches.net/segunda-mano/` |
| `autoscout24_es` | AutoScout24 España | Particulares y profesionales | `https://www.autoscout24.es/` |
| `coches_com` | Coches.com | Particulares y profesionales | `https://www.coches.com/coches-segunda-mano/` |
| `autocasion` | Autocasión | Particulares y profesionales | `https://www.autocasion.com/coches-segunda-mano` |
| `motor_es` | Motor.es | Particulares y profesionales | `https://www.motor.es/segunda-mano/` |
| `wallapop` | Wallapop | Principalmente particulares y algunos profesionales | `https://es.wallapop.com/coches-segunda-mano` |
| `milanuncios` | Milanuncios | Particulares y profesionales | `https://www.milanuncios.com/coches-de-segunda-mano/` |

### Inventarios profesionales

| Código interno sugerido | Fuente | URL inicial |
|---|---|---|
| `flexicar` | Flexicar | `https://www.flexicar.es/` |
| `ocasionplus` | OcasionPlus | `https://www.ocasionplus.com/coches-segunda-mano` |
| `autohero_es` | Autohero | `https://www.autohero.com/es/` |
| `clicars` | Clicars | `https://www.clicars.com/coches-segunda-mano-ocasion` |
| `spoticar_es` | Spoticar | `https://www.spoticar.es/comprar-coches-de-ocasion` |
| `renew_es` | Renew | `https://es.renew.auto/` |
| `dasweltauto_es` | Das WeltAuto | `https://www.dasweltauto.es/` |

### Redes oficiales certificadas

| Código interno sugerido | Fuente | URL inicial |
|---|---|---|
| `toyota_ocasion` | Toyota Ocasión | `https://www.toyota.es/coches-segunda-mano` |
| `lexus_select` | Lexus Select | `https://www.lexusauto.es/lexus-seminuevos` |
| `bmw_premium_selection` | BMW Premium Selection | `https://www.bmwpremiumselection.es/` |
| `mercedes_certified` | Mercedes-Benz Certified | `https://www.mercedes-benz.es/passengercars/cars-guide/certified-used.html` |
| `audi_selection_plus` | Audi Selection :plus | `https://www.audi.es/es/compra/vehiculos-ocasion/` |
| `volvo_selekt` | Volvo Selekt | `https://www.volvocars.com/es/l/used-cars/` |
| `volkswagen_approved` | Volkswagen Approved | `https://www.volkswagen.es/es/approved.html` |

## Orden de evaluación recomendado

No desarrolles todos los conectores simultáneamente.

### Piloto técnico

Evaluar primero:

1. `motor_es`.
2. `autocasion`.
3. `coches_com`.
4. Un inventario profesional que acepte colaboración o feed.

Seleccionar como máximo dos conectores para el primer sprint después de verificar condiciones, estructura y estabilidad.

### Importación iniciada por el usuario

Para `wallapop`, `milanuncios`, posibles páginas con sesión y otras fuentes restrictivas, priorizar:

- URL individual pegada por el usuario.
- Extensión activada por el usuario.
- Reenvío de alertas de correo creadas por el usuario.
- Carga manual de datos.

No implementar navegación centralizada masiva como primera opción.

## Matriz obligatoria de viabilidad por fuente

Antes de programar un conector, entregar:

| Campo | Contenido requerido |
|---|---|
| Portal | Nombre, dominio y código interno |
| Tipo de fuente | Marketplace, profesional, marca o particular |
| Método posible | API, feed, HTML, JSON-LD, email, URL individual o extensión |
| Términos revisados | URL, fecha y conclusión |
| `robots.txt` revisado | URL, fecha y conclusión técnica |
| Autorización | Confirmada, pendiente, restringida o descartada |
| Acceso | Público, sesión, CAPTCHA u otro |
| Campos visibles | Lista exacta |
| Reproducción permitida | Texto, imágenes, fragmentos y atribución |
| Filtros persistentes | Sí/no y comportamiento de la URL |
| Paginación | Método y estabilidad |
| Datos estructurados | JSON-LD, microdatos, estado embebido u otros |
| Frecuencia máxima | Contractual o técnica; no inventar |
| Contacto comercial | Existente o pendiente |
| Riesgo | Bajo, medio, alto o descartado |
| Decisión | Implementar, solicitar permiso, limitar a usuario o descartar |

`robots.txt` es una señal técnica, no sustituye las condiciones contractuales ni constituye por sí solo una licencia.

## Arquitectura funcional

Diseña componentes desacoplados:

```text
Perfil de búsqueda
        ↓
Planificador y cola de trabajos
        ↓
Registro de fuentes y conectores
        ↓
Extracción permitida
        ↓
Normalización y validación
        ↓
Detección de duplicados
        ↓
Base de oportunidades
        ↓
SmartScore y confianza
        ↓
Resultados, favoritos, comparación y alertas
```

El proceso de automatización no debe ejecutarse dentro de una solicitud web normal. Usa trabajos en segundo plano, límites y reintentos controlados según el stack disponible.

## Contrato de conectores

Cada portal debe tener un adaptador aislado que implemente un contrato común. Adapta el ejemplo al lenguaje y arquitectura reales:

```typescript
interface PortalConnector {
  key: string;
  validateSourceUrl(url: string): Promise<ValidationResult>;
  checkAvailability(): Promise<ConnectorHealth>;
  fetchSearchPage(job: SearchJob): Promise<RawSearchPage>;
  parseSearchResults(page: RawSearchPage): Promise<RawListing[]>;
  fetchListingDetail?(listing: RawListing): Promise<RawDetail>;
  normalize(raw: RawListing | RawDetail): Promise<NormalizedVehicle>;
}
```

Separar:

```text
connectors/
├── registry
├── shared
├── motor-es
├── autocasion
├── coches-com
├── manual-import
├── user-url
└── email-alert
```

Un cambio de HTML en un portal no debe afectar al dominio, ranking, pagos o presentación.

## Estrategia de extracción

Usar el método menos invasivo y más estable disponible, en este orden:

1. Feed acordado o API autorizada.
2. Datos estructurados JSON-LD o microdatos permitidos.
3. HTML público generado por el servidor.
4. Estado público embebido en la página, si sus condiciones permiten utilizarlo.
5. Navegador automatizado para páginas públicas dinámicas, solo si está permitido.
6. Importación iniciada por el usuario.

No implementar:

- Resolución o externalización de CAPTCHA.
- Rotación de proxies para ocultar automatización.
- Falsificación de identidad o fingerprint.
- Uso de credenciales de terceros.
- Acceso a zonas privadas.
- Saltos de controles técnicos.
- Extracción de teléfonos o correos de particulares sin necesidad y base legítima.
- Copia íntegra de descripciones o galerías sin permiso.

Cuando un portal bloquee o retire el permiso, el conector debe detenerse de forma segura y marcarse como suspendido.

## Optimización de consultas

No lanzar una navegación completa por cada usuario.

1. Normalizar criterios de búsqueda.
2. Agrupar perfiles compatibles por portal, territorio y filtros.
3. Reutilizar resultados recientes dentro de una ventana de frescura configurable.
4. Consultar primero la página de resultados.
5. Abrir detalles únicamente para anuncios nuevos, modificados, finalistas o incompletos.
6. Evitar consultar nuevamente anuncios retirados salvo verificación programada.
7. Aplicar un presupuesto de peticiones por fuente.

La frecuencia debe configurarse por portal y nunca superar lo permitido. No fijes una frecuencia universal.

## Modelo de datos normalizado

Define entidades separadas para `Source`, `SourceSearch`, `FetchJob`, `RawSnapshot`, `VehicleOpportunity`, `Listing`, `Seller`, `PriceObservation`, `DuplicateCandidate`, `SavedSearch`, `Favorite`, `Comparison` y `Alert`.

### Campos mínimos de la oportunidad

```json
{
  "sourceKey": "motor_es",
  "sourceListingId": "external-id",
  "sourceUrl": "https://fuente.example/anuncio/...",
  "sourceSearchId": "saved-search-id",
  "status": "active",
  "sellerType": "professional",
  "sellerDisplayName": null,
  "make": "Toyota",
  "model": "Corolla",
  "generation": null,
  "version": "1.8 Hybrid",
  "engine": null,
  "powerCv": 122,
  "fuel": "hybrid",
  "transmission": "automatic",
  "bodyType": "compact",
  "registrationDate": "2021-05",
  "year": 2021,
  "mileageKm": 68400,
  "cashPriceEur": 17900,
  "financedPriceEur": 16900,
  "financeTin": null,
  "financeTae": null,
  "monthlyPaymentEur": null,
  "locationText": "Madrid",
  "province": "Madrid",
  "latitude": null,
  "longitude": null,
  "environmentalLabel": "ECO",
  "warrantyMonths": 12,
  "imageReference": null,
  "dataCompleteness": 0.78,
  "dataConfidence": 0.82,
  "firstSeenAt": "ISO-8601",
  "lastSeenAt": "ISO-8601",
  "sourceUpdatedAt": null
}
```

### Reglas de procedencia

Cada campo relevante debe registrar:

- Valor.
- Fuente.
- Fecha de observación.
- Método de obtención.
- Etiqueta: aportado, observado, calculado, estimado o por verificar.
- Confianza.

Nunca sustituyas `null` con valores inventados. Distingue explícitamente entre cero, desconocido, no aplicable y no publicado.

## Tratamiento de contenido

- Preferir hechos breves: precio, año, kilometraje, versión, combustible, ubicación y garantía declarada.
- Generar resúmenes propios cuando esté permitido, sin copiar textos extensos.
- Mantener siempre la fuente y el enlace original.
- No descargar ni republicar galerías completas sin autorización.
- Usar una imagen remota solo cuando el permiso y la política de la fuente lo permitan.
- Eliminar o desactivar referencias cuando el anuncio desaparezca.
- No indexar copias de fichas que puedan competir o duplicar la fuente original.

## Estados de anuncios y conectores

### Anuncio

```text
active
reserved
removed
expired
stale
unknown
```

No marcar un anuncio como vendido salvo que la fuente lo confirme. Si deja de aparecer, usar primero `stale` o `unknown` y ejecutar la política de verificación.

### Conector

```text
draft
testing
approved
active
degraded
suspended
retired
```

Una fuente en `testing`, `degraded` o `suspended` no debe presentarse como plenamente actualizada.

## Deduplicación

Implementar deduplicación progresiva y explicable:

### Coincidencia fuerte

- Mismo portal e identificador externo.
- Misma URL canónica.
- Mismo VIN o matrícula cuando su tratamiento sea legítimo.

### Coincidencia probable

- Marca, modelo, versión y año.
- Kilometraje dentro de una tolerancia configurable.
- Precio próximo.
- Misma localidad o vendedor.
- Coincidencia de atributos e imagen, solo cuando esté permitido.

No fusionar automáticamente una coincidencia probable. Crear un `DuplicateCandidate` con puntuación, factores y estado de revisión.

Una misma unidad en varias fuentes debe poder mostrarse así:

```text
Toyota Corolla 1.8 Hybrid
Detectado en 2 fuentes

Fuente A: 17.900 €
Fuente B: 17.500 €

[Comparar publicaciones originales]
```

## Integración con el SmartScore

El conector solo proporciona datos. No debe decidir si un coche es bueno.

Enviar al motor de análisis:

- Compatibilidad presupuestaria.
- Coste mensual estimado.
- Precio frente a comparables.
- Encaje con uso y necesidades.
- Tipo de vendedor.
- Garantía declarada.
- Distancia.
- Datos ausentes.
- Calidad y frescura.
- Alertas documentales pendientes.

Mostrar separadamente:

- Encaje personal.
- Oportunidad de precio.
- Riesgo pendiente.
- Confianza del cálculo.
- Factores positivos.
- Factores negativos.
- Próxima comprobación recomendada.

No permitir que un resultado patrocinado modifique el SmartScore.

## Panel administrativo

Crear una sección protegida para:

### Fuentes

- Alta y edición de una fuente.
- Dominio permitido.
- Estado del conector.
- Tipo de vendedor.
- Método de acceso.
- Conclusión de viabilidad.
- Frecuencia permitida.
- Campos autorizados.
- Atribución obligatoria.
- Fecha de revisión de condiciones.

### Búsquedas fuente

- URL filtrada.
- Portal.
- Territorio.
- Criterios interpretados.
- Frecuencia.
- Estado.
- Última y próxima ejecución.
- Resultados encontrados.
- Anuncios nuevos, modificados y retirados.
- Botón de ejecución manual con límites.

### Salud

- Tasa de éxito.
- Tiempo de respuesta.
- Errores por tipo.
- Cambio de selectores.
- Campos que dejaron de aparecer.
- Último resultado válido.
- Circuit breaker y reactivación manual.

No mostrar secretos ni datos personales innecesarios en logs o paneles.

## Interfaz del usuario

Mantener el recurso bajo:

```text
https://cochecierto.com/buscador/
```

Rutas orientativas:

```text
/buscador/
/buscador/resultados/
/buscador/oportunidad/{id}/
/buscador/favoritos/
/buscador/comparar/
/buscador/alertas/
```

Cada tarjeta debe mostrar:

- Marca, modelo y versión.
- Precio al contado y financiado correctamente diferenciados.
- Año y kilometraje.
- Tipo de vendedor.
- Provincia y distancia.
- Garantía declarada.
- Coste mensual estimado.
- SmartScore y confianza.
- Información por verificar.
- Fuente y última actualización.
- Botón para abrir el anuncio original.

Acciones:

- Guardar.
- Comparar.
- Analizar.
- Ocultar.
- Crear alerta.
- Abrir fuente.

## Importación de URL individual

Crear un flujo independiente:

```text
Pegar URL
   ↓
Validar dominio y seguridad de la URL
   ↓
Seleccionar conector compatible
   ↓
Extraer datos esenciales permitidos
   ↓
Mostrar vista previa y campos ausentes
   ↓
Confirmar incorporación al expediente del usuario
```

Controles SSRF obligatorios:

- Lista de dominios aprobados.
- Bloquear IP privadas, loopback, metadatos cloud y puertos no permitidos.
- Resolver y verificar redirecciones.
- Limitar tamaño, tiempo y número de saltos.
- No aceptar esquemas distintos de HTTPS/HTTP autorizado.
- No reutilizar cookies o credenciales del servidor.

## Alertas mediante correo

Diseñar como módulo opcional, inicialmente desactivado:

- Dirección única por usuario o búsqueda.
- Verificación del remitente y de la búsqueda asociada.
- Extracción de título, precio, kilometraje, ubicación y URL.
- Sanitización de HTML.
- Rechazo de adjuntos no necesarios.
- Prevención de enlaces maliciosos.
- Deduplicación con inventario existente.
- Consentimiento y cancelación.

No almacenar indefinidamente el correo completo si solo se necesitan campos estructurados.

## Tareas programadas y resiliencia

- Cola persistente.
- Trabajos idempotentes.
- Reintentos limitados con espera incremental.
- Circuit breaker por fuente.
- Bloqueo para evitar dos ejecuciones iguales simultáneas.
- Presupuesto máximo de páginas y tiempo por trabajo.
- Caché por URL canónica.
- Auditoría de quién activó una consulta manual.
- Cancelación segura.
- Retención configurable de HTML bruto.
- Alertas internas cuando cae la tasa de extracción.

El HTML bruto puede contener información personal o material protegido. Guardarlo solo cuando sea imprescindible para depuración, con acceso restringido y caducidad corta.

## Seguridad y privacidad

- Autorización del lado servidor.
- Separación entre administración y usuario.
- Validación estricta de URLs y datos externos.
- Sanitización antes de renderizar HTML o texto.
- Protección XSS, CSRF, inyección y SSRF.
- Rate limiting por cuenta, IP, búsqueda y fuente.
- No exponer claves ni selectores internos.
- Consentimiento separado para alertas y cesión de leads.
- Exportación, eliminación y retención de datos.
- Logs sin teléfonos, correos o contenido personal innecesario.
- Trazabilidad de cambios de fuente y permisos.

## SEO

- La landing `/buscador/` puede indexarse.
- Los resultados personales, favoritos, alertas y cuentas deben usar `noindex` y control de acceso.
- No crear páginas indexables por cada combinación de filtros sin una estrategia SEO aprobada.
- No republicar páginas completas de los portales.
- Mantener enlaces de atribución hacia la fuente.
- Usar canonical en páginas públicas cuando corresponda.

## Analítica

Registrar, sin información personal innecesaria:

```text
search_profile_created
source_search_registered
source_fetch_started
source_fetch_completed
source_fetch_failed
listing_discovered
listing_updated
listing_marked_stale
duplicate_candidate_created
results_viewed
source_filter_selected
listing_opened
source_link_clicked
favorite_added
comparison_started
alert_created
user_url_imported
```

Métricas técnicas:

- Consultas y páginas por fuente.
- Tiempo medio.
- Tasa de éxito.
- Nuevos anuncios por consulta.
- Porcentaje de campos completos.
- Errores de parseo.
- Duplicados.
- Anuncios obsoletos.
- Clics hacia la fuente.
- Usuarios que llegan a comparación.

## Plan de implementación

### Fase 0 — Auditoría y decisiones

- Auditar el repositorio.
- Crear la matriz de fuentes.
- Revisar condiciones de dos portales piloto.
- Probar manualmente URLs filtradas.
- Diseñar modelo de datos y conectores.
- Definir qué campos pueden mostrarse.
- Preparar especificación y pruebas.

### Fase 1 — Núcleo sin dependencia externa

- Registro de fuentes.
- Panel de URLs.
- Carga manual y dataset simulado identificado.
- Modelo normalizado.
- Deduplicación básica.
- Resultados y filtros.
- SmartScore integrado.
- Logs, métricas y estados.

### Fase 2 — Primer conector autorizado

- Implementar un solo portal aprobado.
- Consulta manual limitada.
- Página de resultados.
- Paginación controlada.
- Actualización y estados.
- Pruebas de contrato con fixtures.
- Desactivación segura.

### Fase 3 — Segundo conector y URL del usuario

- Segundo portal aprobado.
- Importación de URL individual.
- Detección de duplicados entre fuentes.
- Historial de precio.
- Favoritos y tres finalistas.

### Fase 4 — Alertas y producto premium

- Trabajos programados.
- Alertas configurables.
- Límites por plan.
- Comparación premium.
- Analítica del embudo.

### Fase 5 — Acuerdos y escalado

- Feeds de concesionarios.
- Inventarios de marca.
- Importación de correos.
- Extensión, si se aprueba.
- Nuevos conectores autorizados.

## Pruebas obligatorias

### Unitarias

- Normalización de importes y kilometraje.
- Fechas y zonas horarias.
- Precio al contado frente a financiado.
- Estados de anuncios.
- Deduplicación.
- Confianza y completitud.
- Validación de URL y SSRF.

### Contrato por conector

- Resultados normales.
- Página vacía.
- Paginación.
- Campo ausente.
- HTML modificado.
- Bloqueo o respuesta inesperada.
- Anuncio retirado.
- Dato contradictorio.

Usar fixtures locales. Las pruebas automatizadas frecuentes no deben bombardear sitios externos.

### Integración

- Trabajo idempotente.
- Reintento y circuit breaker.
- Actualización de precios.
- Anuncio nuevo, modificado y obsoleto.
- Duplicado entre dos fuentes.
- Restricciones de usuario y administrador.

### End-to-end

- Crear una búsqueda.
- Ver resultados.
- Filtrar por tipo de vendedor.
- Abrir la fuente original.
- Guardar y comparar tres vehículos.
- Crear y cancelar una alerta.
- Importar una URL individual válida.
- Rechazar una URL peligrosa o no autorizada.

## Criterios de aceptación del MVP

El MVP solo estará listo cuando:

1. Exista una matriz aprobada para cada fuente activada.
2. Ningún conector dependa de evasión de controles.
3. El panel permita activar y suspender fuentes.
4. Una URL filtrada válida genere un trabajo controlado.
5. Los resultados se normalicen sin inventar campos.
6. Cada dato muestre fuente y fecha.
7. Los precios al contado y financiado no se confundan.
8. Los anuncios repetidos se detecten o se marquen para revisión.
9. Los anuncios retirados no permanezcan indefinidamente como activos.
10. El usuario pueda abrir siempre el anuncio original.
11. El SmartScore permanezca separado del conector.
12. Los resultados patrocinados no modifiquen el ranking orgánico.
13. Las búsquedas privadas no sean indexables.
14. Los endpoints de importación estén protegidos frente a SSRF.
15. Existan pruebas y observabilidad suficientes para detectar un cambio de HTML.
16. Se mantenga el funcionamiento actual de `/valorador/` y `/demo/`.

## Entregables

Entrega en este orden:

1. Auditoría del repositorio y arquitectura actual.
2. Matriz de viabilidad de las fuentes piloto.
3. Recomendación razonada de los dos primeros portales.
4. Especificación del MVP y exclusiones.
5. Modelo de datos.
6. Diagrama de componentes y flujo.
7. Wireframes del panel y resultados.
8. Plan por hitos con dependencias.
9. Implementación y migraciones.
10. Fixtures y pruebas.
11. Manual de alta, suspensión y reparación de conectores.
12. Informe final con archivos modificados, resultados, limitaciones y siguientes pasos.

## Instrucción de inicio

Comienza ahora por la **Fase 0**. No programes todavía los conectores externos. Primero entrega:

- Diagnóstico del repositorio.
- Matriz preliminar de `motor_es`, `autocasion` y `coches_com`.
- Comparación técnica y contractual.
- Propuesta del primer conector.
- Modelo de datos mínimo.
- Lista de decisiones que necesita confirmar el responsable de CocheCierto.

Después de recibir aprobación, implementa el núcleo con carga manual y fixtures antes de activar cualquier consulta recurrente a un portal.
