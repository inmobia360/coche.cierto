# Spec 006 — Buscador multifuente de CocheCierto

## Estado

Pendiente de implementación. Esta spec convierte el prompt `PROMPT_IMPLEMENTACION_BUSCADOR_MULTIFUENTE_COCHECIERTO.md` en alcance aprobado para una iniciativa futura. No autoriza por sí sola conexiones externas, scraping, consultas programadas, publicación ni despliegue.

## Objetivo

Crear una capa de búsqueda y decisión que reciba un perfil, consulte únicamente fuentes públicas o autorizadas, normalice oportunidades de vehículos, detecte duplicados y cambios, calcule compatibilidad explicable y dirija al anuncio original.

CocheCierto no será un clon de un portal de anuncios ni presentará los resultados como tasación, inspección mecánica, garantía, aprobación financiera o disponibilidad confirmada.

## Relación con otras iniciativas

- La `spec 002` mantiene el diagnóstico y la captación como MVP activo.
- Esta iniciativa se reserva para Fase 2 y no activa marketplace ni búsqueda de anuncios en Fase 1.
- `TAXONOMIA-VEHICULOS` proporciona `bodyType`, `vehicleSegment`, `intendedUse`, `fuelType` y etiquetas relacionadas.
- `AUTO-RIESGO` y `FINANZAS-TCO` solo se activan para los cálculos que tengan fuente, fórmula, fecha y criterios aprobados.

## Usuarios y casos de uso

- Persona con un perfil de compra que quiere descubrir oportunidades compatibles.
- Usuario que pega una URL individual para analizarla o importarla.
- Administrador que registra y revisa fuentes, búsquedas y salud de conectores.
- Usuario que guarda finalistas y configura alertas, cuando estas fases sean aprobadas.

## Alcance del MVP futuro

- Registrar desde administración una URL de búsqueda previamente filtrada.
- Asociarla con una fuente y tipo de vendedor.
- Ejecutar una consulta manual o programada de baja frecuencia, solo con autorización.
- Extraer campos esenciales permitidos y guardar procedencia y fecha.
- Normalizar anuncios en un modelo común.
- Detectar oportunidades nuevas, modificadas, retiradas y potencialmente duplicadas.
- Aplicar filtros y SmartScore explicable.
- Mostrar oportunidades con enlace al anuncio original.
- Permitir favoritos y comparación de hasta tres finalistas si el almacenamiento de usuario está aprobado.

## Fuera de alcance

- Activar todos los portales a la vez.
- Navegación masiva en fuentes con sesión, CAPTCHA o restricciones.
- Evasión de bloqueos, rotación de identidades o técnicas para ocultar actividad.
- Scraping no autorizado, copia de imágenes o republicación de contenido protegido.
- Inventario propio, compra, reserva, contacto automático o negociación.
- Recomendaciones patrocinadas o ranking comercial de marcas.
- Cuenta de usuario, pagos o CRM hasta contar con specs y revisión de seguridad específicas.

## Fuentes candidatas y orden de evaluación

El inventario siguiente no es una autorización. Primero se evaluarán `motor_es`, `autocasion`, `coches_com` y un inventario profesional que acepte colaboración o feed. Como máximo se seleccionarán dos fuentes para el primer piloto técnico.

Como alternativas de evaluación quedan portales mixtos como Coches.net, AutoScout24, Wallapop y Milanuncios; inventarios profesionales como Flexicar, Autohero, Clicars y Das WeltAuto; y redes certificadas como Toyota Ocasión, Lexus Select, BMW Premium Selection, Mercedes-Benz Certified, Audi Selection :plus, Volvo Selekt y Volkswagen Approved.

Para fuentes restrictivas se priorizarán URL individual aportada por el usuario, extensión activada por el usuario, reenvío de alertas creado por el usuario o carga manual.

## Matriz obligatoria de viabilidad

Antes de programar cada conector se documentará:

| Campo | Requisito |
|---|---|
| Portal | Nombre, dominio y código interno |
| Tipo | Marketplace, profesional, marca o particular |
| Método | API, feed, HTML, JSON-LD, email, URL individual o extensión |
| Términos | URL, fecha y conclusión |
| `robots.txt` | URL, fecha y conclusión técnica |
| Autorización | Confirmada, pendiente, restringida o descartada |
| Acceso | Público, sesión, CAPTCHA u otro |
| Campos | Lista exacta que se puede leer |
| Reproducción | Texto, imágenes, fragmentos y atribución permitidos |
| Paginación | Método y estabilidad |
| Frecuencia | Contractual o técnica; nunca inventada |
| Contacto | Existente o pendiente |
| Riesgo | Bajo, medio, alto o descartado |
| Decisión | Implementar, solicitar permiso, limitar a usuario o descartar |

`robots.txt` es una señal técnica y no sustituye términos, licencia ni autorización contractual.

## Arquitectura funcional

```text
Perfil de búsqueda → Planificador y cola → Registro de fuentes y conectores
→ Extracción permitida → Normalización y validación → Deduplicación
→ Base de oportunidades → SmartScore y confianza
→ Resultados, favoritos, comparación y alertas
```

La extracción se ejecutará en trabajos controlados en segundo plano, nunca dentro de una solicitud web normal. El backend actual Express/MySQL deberá evolucionar mediante una decisión técnica documentada; no se asumirá una cola, scheduler o autenticación que todavía no existen.

## Contrato de conectores

Cada fuente tendrá un adaptador aislado con responsabilidades comunes:

```text
validateSourceUrl(url)
checkAvailability()
fetchSearchPage(job)
parseSearchResults(page)
fetchListingDetail(listing)        [opcional]
normalize(raw)
```

Un fallo, cambio de HTML o indisponibilidad de un portal no debe detener los demás conectores. Cada adaptador tendrá límites, timeout, reintentos controlados, registro de errores y estado de salud.

## Modelo normalizado mínimo

```text
source
sourceListingId
originalUrl
firstSeenAt
lastSeenAt
status
sellerType
brand
model
version
bodyType
vehicleSegment
intendedUse
fuelType
environmentalLabel
year
mileage
price
locationApprox
equipment
missingFields
sourceConfidence
normalizationVersion
```

Los datos de marca y modelo describen el anuncio original cuando esté permitido, pero no convierten el resultado en recomendación de marca. La ubicación se almacenará de forma aproximada y nunca como coordenadas exactas sin una spec de privacidad aprobada.

## Procedencia y calidad del dato

Cada campo externo debe conservar fuente, URL original, fecha de observación, fecha de actualización si existe, método de extracción, versión de normalización y nivel de confianza. Los datos no confirmados se mostrarán como pendientes, no como hechos.

## Estados

```text
listing: new | active | updated | withdrawn | duplicate | invalid | pending_review
connector: proposed | pending_authorization | ready | degraded | paused | rejected
```

Un anuncio no visto en una consulta no se marcará como retirado sin una política de revalidación y evidencia suficiente.

## Deduplicación

- Coincidencia fuerte: identificador del portal, URL canónica o combinación autorizada de identificadores.
- Coincidencia probable: vendedor, ubicación aproximada, características, precio y señales temporales compatibles.
- Las coincidencias probables se marcarán para revisión o se agruparán con confianza explícita; nunca se eliminarán silenciosamente.

## SmartScore

El resultado separará:

- compatibilidad con el perfil;
- carrocería, segmento y uso;
- asequibilidad orientativa;
- compatibilidad energética, si está aprobada;
- calidad y frescura de los datos;
- riesgos y campos pendientes.

Cada puntuación mostrará factores, supuestos, fuente, fecha y al menos tres razones comprensibles cuando sea aplicable. `Compatibilidad`, `estado mecánico`, `calidad del anuncio` y `tasación` son conceptos distintos.

## Interfaz

La experiencia futura incluirá lista de oportunidades, filtros, detalle resumido, fecha de comprobación, datos pendientes, enlace al anuncio original, favoritos, comparación de tres finalistas y alertas. No se solicitarán datos de contacto antes de entregar valor y el consentimiento comercial seguirá siendo separado y opcional.

## Seguridad, privacidad y legalidad

- No se usarán secretos en el repositorio ni en prompts.
- Se aplicará mínimo privilegio para administración y fuentes.
- Se limitarán frecuencia, volumen, campos, retención y reintentos.
- No se almacenarán datos personales del vendedor salvo justificación, base legal y spec aprobada.
- Se respetarán términos, licencias, atribución, derechos de imagen y solicitudes de retirada.
- CAPTCHA, autenticación, bloqueo o prohibición contractual detienen el conector.
- `LEGAL-CONFIANZA` revisará claims, términos y reproducción antes de publicar.

## Fases de implementación pendientes

### Fase 0 — Auditoría y decisiones

Inventariar stack, despliegue, base de datos, autenticación, analítica y variables de entorno. Completar la matriz de viabilidad y aprobar el máximo de dos fuentes piloto.

### Fase 1 — Núcleo sin dependencia externa

Implementar con datos simulados identificados, carga manual o URL individual: modelo normalizado, filtros, deduplicación, procedencia, estados y SmartScore.

### Fase 2 — Primer conector autorizado

Integrar un único adaptador aprobado, con pruebas de contrato, límites, observabilidad y enlace original.

### Fase 3 — Segundo conector y URL del usuario

Añadir el segundo conector solo si el primero es estable y la fuente tiene autorización suficiente. Validar importación iniciada por el usuario.

### Fase 4 — Alertas y producto avanzado

Añadir favoritos, comparación, alertas y tareas programadas únicamente con specs de cuentas, comunicaciones, privacidad y seguridad aprobadas.

### Fase 5 — Acuerdos y escalado

Incorporar feeds o acuerdos comerciales, aumentar cobertura y revisar capacidad operativa solo con evidencia de demanda y licencia.

## Pruebas obligatorias

- Unitarias: normalización, rangos, etiquetas, estados y deduplicación.
- Contrato: cada conector cumple el contrato común y maneja errores, cambios y límites.
- Integración: fuente → normalización → almacenamiento → puntuación → enlace original.
- Seguridad: autorización, límites, validación de URL, datos personales y retención.
- End-to-end: búsqueda, filtros, detalle, comparación y alertas cuando estén activados.
- Regresión: `manifest.json`, JavaScript con `node --check` y pruebas del backend disponibles.

## Criterios de aceptación

- Ninguna fuente se conecta sin matriz de viabilidad y decisión aprobada.
- El MVP futuro funciona con datos simulados o una fuente autorizada identificada.
- Los resultados conservan procedencia, fecha, estado y enlace original.
- Los duplicados y datos faltantes se muestran con confianza y no se borran silenciosamente.
- El SmartScore explica sus factores y no afirma estado mecánico.
- La indisponibilidad de un conector no rompe el resto del sistema.
- No se realizan consultas recurrentes, publicaciones ni despliegues sin autorización explícita.
- La implementación se mantiene separada del diagnóstico MVP y conserva compatibilidad con Manifest V3.

## Handoffs

```text
PRODUCTO-SDD → DATOS-MERCADO + LEGAL-CONFIANZA
DATOS-MERCADO + LEGAL-CONFIANZA → SEGURIDAD-DATOS
SEGURIDAD-DATOS → TAXONOMIA-VEHICULOS + INGENIERIA
INGENIERIA → AUTO-RIESGO + FINANZAS-TCO
AUTO-RIESGO + FINANZAS-TCO → UX-CONTENIDO + QA-VALIDACION
```

Cada entrega debe indicar objetivo, entradas, archivos afectados, decisiones, evidencia, riesgos, preguntas abiertas y siguiente responsable.

## Decisiones pendientes

- Aprobar la spec y el alcance de Fase 1.
- Elegir la primera fuente después de la matriz de viabilidad.
- Decidir cola, scheduler, autenticación administrativa y retención.
- Definir si favoritos y alertas requieren cuentas en la primera versión.
- Confirmar licencias de contenido, imágenes y reproducción.

## Fuente de diseño

`PROMPT_IMPLEMENTACION_BUSCADOR_MULTIFUENTE_COCHECIERTO.md`, convertido en requisitos verificables y limitado por la Constitución del proyecto y las specs activas.
