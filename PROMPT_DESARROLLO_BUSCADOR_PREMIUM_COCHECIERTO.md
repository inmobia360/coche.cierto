# Prompt para desarrollar el Buscador Premium de CocheCierto

## Instrucción principal

Actúa como arquitecto de software, diseñador de producto, especialista UX/UI y desarrollador full-stack senior. Debes analizar el proyecto existente de **CocheCierto** e implementar de forma progresiva un nuevo módulo llamado provisionalmente **Buscador Inteligente CocheCierto**.

La finalidad no es crear otro portal generalista de anuncios. El producto debe ayudar a una persona a encontrar vehículos que encajen con su presupuesto y necesidades, comparar el coste real, detectar información pendiente y decidir qué oportunidades merece la pena investigar.

Antes de modificar código:

1. Inspecciona el repositorio, su arquitectura, stack, base de datos, autenticación, pasarela de pago, analítica, componentes y convenciones.
2. Identifica cambios existentes y no sobrescribas trabajo ajeno o no relacionado.
3. Revisa la implementación actual de `/valorador/`, `/demo/`, perfiles, informes y sistema de diseño.
4. Comprueba si existe documentación de requisitos, ADR, especificaciones o metodología SDD y respétala.
5. Presenta un diagnóstico breve del estado actual, dependencias, riesgos y archivos que será necesario modificar.
6. Si falta una decisión que afecte sustancialmente a la arquitectura, detente y pregunta. No inventes APIs, acuerdos comerciales ni permisos de extracción de datos.

## Objetivo de negocio

Construir un recurso premium que permita buscar oportunidades publicadas por:

- Concesionarios y compraventas.
- Vendedores particulares.
- Ambos tipos de vendedor.

El servicio debe monetizarse principalmente mediante acceso temporal y packs de análisis:

| Producto | Alcance | Precio inicial configurable |
|---|---|---:|
| Búsqueda gratuita | Vista limitada de hasta 5 resultados | 0 € |
| Acceso 7 días | Resultados completos, favoritos y alertas | 7,90 € |
| Búsqueda Premium | Acceso durante 30 días | 14,90 € |
| Premium Plus | 30 días y análisis de 3 finalistas | 29,90 € |
| Búsqueda asistida | Selección personalizada | 69–99 € |

Los precios, impuestos, duración, límites y prestaciones deben almacenarse como configuración; no deben quedar repetidos ni fijados de forma rígida en la interfaz.

## Propuesta de valor

El mensaje principal del producto es:

> CocheCierto encuentra oportunidades que encajan contigo, calcula su coste real, señala lo que falta por comprobar y te avisa cuando aparece una alternativa mejor.

La búsqueda debe responder a estas preguntas:

1. ¿Este vehículo encaja con el perfil del comprador?
2. ¿Está dentro de su presupuesto total y mensual?
3. ¿Su precio parece competitivo frente a comparables?
4. ¿Qué datos se han verificado y cuáles faltan?
5. ¿Qué riesgos debe comprobar antes de desplazarse o entregar una señal?
6. ¿Cuál es el siguiente paso recomendado?

## Principios obligatorios

- No presentar estimaciones como hechos.
- No afirmar que un vehículo está libre de defectos o “garantizado por CocheCierto”.
- No diagnosticar mecánicamente un coche solo a partir de fotografías.
- No acusar de fraude o manipulación; usar expresiones como “incoherencia que requiere comprobación documental”.
- No alterar puntuaciones orgánicas a cambio de pagos.
- Identificar siempre los resultados patrocinados.
- Separar recomendación, publicidad y relación comercial.
- Explicar los factores que forman cada puntuación.
- Mostrar fuente y fecha de actualización cuando sea posible.
- Minimizar la recogida de datos personales y cumplir RGPD y normativa aplicable.
- Mantener la identidad visual, accesibilidad y experiencia móvil de CocheCierto.

## Alcance funcional del MVP

### 1. Perfil de búsqueda

Permitir al usuario crear una búsqueda mediante un formulario progresivo que solicite solo información necesaria:

- Presupuesto máximo para el vehículo.
- Presupuesto total, incluyendo transferencia, seguro, puesta a punto y reserva.
- Coste mensual máximo.
- Compra al contado o financiada.
- Entrada disponible, plazo y cuota máxima, cuando corresponda.
- Código postal o localidad.
- Radio de búsqueda.
- Tipo de vendedor: profesional, particular o ambos.
- Categoría o carrocería.
- Marcas y modelos preferidos o excluidos.
- Combustible.
- Cambio manual o automático.
- Antigüedad máxima.
- Kilometraje máximo.
- Kilómetros anuales previstos.
- Uso urbano, carretera, mixto o profesional.
- Número habitual de ocupantes.
- Necesidad de maletero, accesibilidad, remolque u otras condiciones funcionales.
- Distintivo ambiental mínimo o municipios habituales.
- Nivel de riesgo aceptado.

Debe poder iniciarse desde un diagnóstico existente para reutilizar datos ya aportados y evitar que el usuario repita información.

### 2. Modos de búsqueda

Incluir tres modos claramente visibles:

- **Concesionarios:** prioriza garantía declarada, servicios incluidos y condiciones de financiación.
- **Particulares:** prioriza trazabilidad, documentación, margen de negociación y comprobaciones pendientes.
- **Ambos:** compara el coste inicial real y las diferencias de protección y servicio.

El modo recomendado por defecto será “Ambos”, sin impedir que el usuario lo modifique.

### 3. Ingesta de oportunidades

La arquitectura debe aceptar varias fuentes mediante conectores independientes y normalizados:

- Feeds autorizados de concesionarios.
- APIs oficiales o comerciales.
- Acuerdos de afiliación.
- Inventario propio de colaboradores.
- URLs de anuncios aportadas por el usuario.
- Carga manual administrativa durante el MVP.

No implementes scraping indiscriminado. Antes de conectar una fuente externa, documenta:

| Campo | Evaluación requerida |
|---|---|
| Fuente | Nombre y dominio |
| Método | API, feed, afiliación, URL del usuario o carga manual |
| Autorización | Base contractual o condiciones aplicables |
| Datos permitidos | Campos, imágenes y descripciones reutilizables |
| Frecuencia | Límites de consulta y actualización |
| Atribución | Enlace y crédito exigidos |
| Eliminación | Procedimiento cuando desaparece el anuncio |
| Riesgo | Bajo, medio o alto |

Si una fuente no está autorizada, déjala desacoplada y marcada como pendiente. El MVP debe seguir funcionando con URLs introducidas por usuarios, feeds autorizados o inventario de prueba.

### 4. Modelo normalizado del vehículo

Diseña una entidad común que permita comparar fuentes diferentes. Debe contemplar, como mínimo:

- Identificador interno y externo.
- Fuente, URL original y fecha de consulta.
- Estado del anuncio: activo, reservado, retirado o desconocido.
- Tipo de vendedor.
- Identidad comercial del profesional, cuando proceda.
- Marca, modelo, generación, versión y acabado.
- Motorización, potencia, combustible y transmisión.
- Año y fecha de matriculación, si están disponibles.
- Kilometraje.
- Precio al contado.
- Precio financiado.
- Entrada, cuotas, TIN, TAE, comisión, cuota final y productos vinculados.
- Provincia, localidad y distancia respecto al comprador.
- Garantía declarada.
- Equipamiento relevante.
- Distintivo ambiental.
- Número y procedencia de fotografías.
- Descripción original o resumen autorizado.
- Datos ausentes.
- Historial de cambios de precio.
- Nivel de calidad y frescura de los datos.
- Estado de verificación de cada campo.

Evita guardar datos personales de particulares que no sean imprescindibles. No reproduzcas teléfonos, correos o información sensible sin base legal y necesidad funcional.

### 5. Resultado de búsqueda

Cada tarjeta debe mostrar de forma escaneable:

```text
Marca, modelo y versión
Precio anunciado
Coste mensual estimado
Diferencia respecto al intervalo observado
Encaje con el comprador
Nivel de riesgo pendiente
Kilometraje y año
Distancia
Tipo de vendedor
Garantía declarada
Fuente y fecha de actualización
```

Acciones:

- Ver oportunidad.
- Analizar coche.
- Guardar en favoritos.
- Añadir a comparación.
- Ocultar resultado.
- Abrir anuncio original.
- Activar una alerta relacionada.

### 6. Ordenación y filtros

Incluir:

- Mejor oportunidad para el usuario.
- Precio menor.
- Coste mensual menor.
- Mayor encaje.
- Menor riesgo pendiente.
- Menor kilometraje.
- Más reciente.
- Menor distancia.

Filtros editables:

- Precio.
- Coste mensual.
- Marca y modelo.
- Año.
- Kilometraje.
- Combustible.
- Cambio.
- Distintivo.
- Distancia.
- Tipo de vendedor.
- Garantía.
- Nivel de riesgo.
- Solo anuncios con información financiera suficiente.

### 7. SmartScore explicable

No uses una puntuación opaca. Implementa componentes separados y una explicación visible. La primera versión puede usar pesos configurables, documentados y versionados:

| Componente | Peso orientativo inicial |
|---|---:|
| Encaje con uso y necesidades | 25 % |
| Compatibilidad presupuestaria | 25 % |
| Precio frente al mercado | 20 % |
| Coste total estimado | 15 % |
| Calidad y completitud de datos | 10 % |
| Distancia y conveniencia | 5 % |

Los riesgos graves no deben quedar compensados por un precio bajo. Aplica reglas de exclusión o advertencia independientes para:

- Cargas o reserva de dominio confirmadas.
- Kilometraje incoherente.
- Identidad del vendedor dudosa.
- Documentación contradictoria.
- Negativa declarada a revisión independiente.
- Coste superior al límite del usuario.

Cuando falten datos, reduce la confianza del resultado en vez de inventarlos. Mostrar:

- Puntuación de encaje.
- Confianza del cálculo.
- Factores positivos.
- Factores negativos.
- Datos pendientes.
- Acción para elevar la confianza.

### 8. Comparación entre particular y concesionario

Comparar el coste inicial real, no solo el precio anunciado:

```text
Precio anunciado
Transferencia
Financiación total
Seguro estimado
Puesta a punto
Mantenimiento pendiente
Garantía declarada
Reserva para imprevistos
Coste inicial real
Coste estimado a 3 y 5 años
```

Debe quedar claro qué importes son aportados, observados, calculados, estimados o pendientes de verificar.

### 9. Favoritos, finalistas y alertas

Permitir:

- Guardar oportunidades.
- Seleccionar hasta 3 coches finalistas en el MVP.
- Compararlos en una tabla común.
- Registrar notas privadas.
- Recibir alertas por nueva oportunidad, bajada de precio, anuncio retirado o aparición de una alternativa mejor.
- Configurar frecuencia: inmediata, resumen diario o resumen semanal.
- Desactivar alertas de forma sencilla.

No prometas alertas en tiempo real si la frecuencia de actualización de la fuente no lo permite.

### 10. Paywall y derechos de acceso

Implementar un sistema de permisos desacoplado de la interfaz:

#### Usuario gratuito

- Crear una búsqueda.
- Ver hasta 5 resultados limitados.
- Ver una explicación general de encaje.
- No acceder al desglose completo, comparación ni alertas avanzadas.

#### Acceso de 7 días

- Resultados completos.
- Favoritos.
- Alertas básicas.

#### Premium 30 días

- Búsquedas y resultados completos.
- Favoritos y alertas.
- Historial básico de precios.

#### Premium Plus

- Todo lo anterior.
- Tres análisis completos.
- Comparación de finalistas.
- Informe descargable.

Considerar:

- Inicio y caducidad del acceso.
- Zona horaria.
- Pago confirmado, fallido, pendiente, reembolsado o disputado.
- Webhooks idempotentes.
- Renovación solo si se comunica claramente y el usuario la acepta.
- Recuperación del acceso.
- Factura y tratamiento fiscal según la configuración de la empresa.
- Códigos promocionales y planes de prueba configurables.

No simules pagos. Usa el proveedor ya existente; si no existe, propón la integración adecuada y espera aprobación antes de incorporar una nueva dependencia comercial.

## Monetización profesional

Prepara la arquitectura, sin activar necesariamente todo en el MVP, para:

- Pago por lead cualificado.
- Comisión por venta confirmada.
- Inventario de concesionarios mediante feed.
- Resultado patrocinado identificado.
- Suscripción profesional.
- Acuerdos de afiliación para historial, inspección, seguro o financiación.

Reglas obligatorias:

1. Un pago nunca modifica el SmartScore orgánico.
2. Un resultado patrocinado debe mostrar la etiqueta “Patrocinado”.
3. Debe registrarse por qué se mostró una recomendación.
4. La cesión de datos a un profesional requiere consentimiento específico.
5. No enviar automáticamente los datos del comprador por aceptar términos generales.
6. Mantener un registro auditable de consentimientos y revocaciones.

## Experiencia de usuario

### Ruta propuesta

```text
/buscador/
/buscador/resultados/
/buscador/oportunidad/{id}/
/buscador/favoritos/
/buscador/comparar/
/buscador/alertas/
/planes/
/cuenta/acceso-premium/
```

Ajusta las rutas a la arquitectura real del proyecto y evita duplicar páginas existentes.

### Flujo principal

1. El usuario llega desde el valorador, la demo, contenido SEO o el menú.
2. Crea su perfil de búsqueda.
3. Obtiene una muestra gratuita de resultados.
4. Ve qué análisis se desbloquean.
5. Elige un pase o pack.
6. Paga.
7. Recupera el mismo estado de búsqueda, sin repetir el formulario.
8. Guarda, compara y analiza oportunidades.
9. Recibe alertas durante la vigencia del plan.

### Mensajes recomendados

Título:

> Encuentra coches que encajan contigo, no solo con tus filtros.

Descripción:

> Comparamos presupuesto, coste mensual, uso, precio, vendedor e información pendiente para ayudarte a elegir qué oportunidades merece la pena revisar.

CTA principal:

> Crear mi búsqueda

CTA de pago:

> Desbloquear resultados completos

Microtexto:

> CocheCierto ofrece orientación basada en los datos disponibles. Verifica la documentación y realiza una inspección independiente antes de comprar.

## Etiquetado de información

Aplicar consistentemente:

| Etiqueta | Significado |
|---|---|
| Aportado | Introducido por el usuario |
| Observado | Obtenido de una fuente identificada |
| Calculado | Resultado reproducible de una fórmula |
| Estimado | Aproximación basada en referencias |
| Por verificar | Dato todavía no confirmado |
| Patrocinado | Visibilidad pagada sin alterar la puntuación |

## Arquitectura y calidad

- Separar dominio, conectores de fuentes, ranking, monetización y presentación.
- Evitar lógica de negocio crítica exclusivamente en el cliente.
- Versionar fórmulas, pesos y reglas.
- Diseñar trabajos de actualización repetibles e idempotentes.
- Detectar duplicados del mismo coche publicado en varias fuentes.
- Registrar procedencia y frescura de cada campo.
- Expirar o marcar anuncios que no puedan verificarse.
- Implementar caché y límites de consulta respetando los acuerdos de cada fuente.
- Evitar dependencias nuevas innecesarias.
- Mantener compatibilidad con el despliegue actual.
- Usar migraciones reversibles y documentadas.
- No incluir secretos en el repositorio ni en el frontend.
- Validar todas las entradas y salidas de conectores.
- Añadir control de errores y estados vacíos comprensibles.

## Privacidad y seguridad

- Consentimiento granular para alertas y cesión de leads.
- Política de conservación y borrado de búsquedas, favoritos y perfil.
- Exportación o eliminación de datos del usuario.
- Protección CSRF, XSS, inyección y acceso indebido según el stack.
- Autorización del lado servidor para recursos premium.
- Rate limiting para búsquedas, importaciones y endpoints costosos.
- Webhooks firmados e idempotentes.
- Registros sin datos sensibles innecesarios.
- No exponer tokens, claves, datos de pago ni identificadores privados.

## SEO y accesibilidad

- No indexar páginas privadas, resultados personales ni URLs con datos sensibles.
- Crear una landing pública indexable para el Buscador Inteligente.
- Definir canonical, metadatos sociales y datos estructurados apropiados.
- Evitar generar miles de páginas pobres o duplicadas por combinaciones de filtros.
- Cumplir WCAG 2.2 AA en contraste, teclado, foco, formularios, mensajes de error y lectores de pantalla.
- Usar controles semánticos y nombres accesibles.
- Probar experiencia móvil desde 320 px y escritorio.

## Analítica mínima

Registrar eventos sin datos personales innecesarios:

```text
search_started
search_completed
search_results_viewed
seller_type_selected
filters_changed
opportunity_opened
external_listing_opened
favorite_added
comparison_started
alert_created
paywall_viewed
plan_selected
checkout_started
purchase_completed
purchase_failed
premium_analysis_used
professional_lead_consent_given
```

Crear un embudo que permita medir:

1. Visita a la landing.
2. Inicio del formulario.
3. Búsqueda completada.
4. Visualización de resultados.
5. Visualización del paywall.
6. Inicio del pago.
7. Compra confirmada.
8. Uso real de funciones premium.
9. Selección de finalistas.
10. Apertura del anuncio externo o solicitud de servicio.

## Fases de implementación

### Fase 0 — Descubrimiento y especificación

- Auditoría del repositorio.
- Mapa de arquitectura actual.
- Inventario de componentes reutilizables.
- Matriz de fuentes y autorizaciones.
- Modelo de datos.
- Especificación funcional.
- Wireframes responsivos.
- Riesgos y decisiones pendientes.
- Criterios de aceptación y plan de pruebas.

No conectes fuentes no autorizadas en esta fase.

### Fase 1 — MVP controlado

- Perfil de búsqueda.
- Inventario de demostración claramente etiquetado o fuentes autorizadas.
- Resultados y filtros.
- SmartScore explicable.
- Vista gratuita limitada.
- Favoritos.
- Paywall preparado.
- Analítica.
- Panel mínimo de configuración.

### Fase 2 — Monetización

- Pagos reales.
- Pases de 7 y 30 días.
- Premium Plus.
- Comparación de tres finalistas.
- Alertas.
- PDF o informe exportable.
- Gestión de incidencias de pago.

### Fase 3 — Fuentes y colaboradores

- Primer feed autorizado de concesionario.
- Conector de URL aportada por el usuario.
- Historial de precio.
- Detección de duplicados.
- Leads consentidos.
- Resultados patrocinados claramente separados.

### Fase 4 — Escalado

- Nuevas fuentes autorizadas.
- Personalización del ranking basada en evidencia.
- Suscripción profesional.
- Servicios de inspección, seguro, financiación e historial.
- Automatización operativa y observabilidad.

No adelantes una fase si las métricas y pruebas de la anterior no demuestran utilidad y estabilidad.

## Criterios de aceptación del MVP

El MVP se considerará aceptable cuando:

1. Un usuario pueda crear una búsqueda en móvil y escritorio.
2. Pueda elegir concesionarios, particulares o ambos.
3. Los resultados respeten filtros y límites económicos.
4. Cada oportunidad muestre fuente, fecha y tipo de vendedor.
5. Las estimaciones estén correctamente etiquetadas.
6. El SmartScore pueda explicarse mediante factores visibles.
7. Un precio bajo no oculte una alerta grave.
8. El usuario gratuito vea una muestra limitada coherente.
9. Los permisos premium se verifiquen en el servidor.
10. El estado de búsqueda se conserve después del pago.
11. Los resultados patrocinados no alteren el ranking orgánico y estén identificados.
12. Las alertas puedan activarse y cancelarse.
13. No se indexen búsquedas privadas.
14. La navegación por teclado y los mensajes de error sean accesibles.
15. Existan pruebas automáticas para cálculos, permisos, pagos y conectores.
16. No haya secretos, errores críticos de consola ni regresiones sobre `/valorador/` o `/demo/`.

## Pruebas obligatorias

- Unitarias para coste, ranking, confianza y reglas de riesgo.
- Integración para fuentes, autenticación, permisos y pagos.
- Contrato para cada conector externo.
- End-to-end de usuario gratuito, compra, caducidad y Premium Plus.
- Accesibilidad automatizada y revisión manual con teclado.
- Estados sin resultados, fuente caída, anuncio retirado, precio ausente y financiación incompleta.
- Webhook duplicado o fuera de orden.
- Usuario intentando acceder a recursos premium de otra cuenta.
- Comparación entre particular y profesional.
- Rendimiento en móvil y conexiones lentas.

## Entregables

Entrega el trabajo en este orden:

1. Diagnóstico del proyecto actual.
2. Especificación funcional y exclusiones del MVP.
3. Matriz de fuentes de datos y permisos.
4. Modelo de datos y diagrama de componentes.
5. Wireframes y estados de interfaz.
6. Plan de implementación por hitos.
7. Código y migraciones.
8. Pruebas automatizadas y resultados.
9. Documentación de configuración y operación.
10. Registro de decisiones técnicas.
11. Informe final con archivos modificados, limitaciones y próximos pasos.

## Restricciones finales

- No cambies la marca, navegación global o modelo comercial sin aprobación.
- No publiques en producción sin revisión y autorización expresa.
- No uses datos simulados sin identificarlos visiblemente.
- No declares cobertura nacional o multifuente sin fuentes operativas verificadas.
- No recopiles datos de vendedores particulares de forma masiva sin autorización.
- No mezcles publicidad con resultados orgánicos.
- No sustituyas fuentes oficiales, inspección profesional o asesoramiento especializado.
- No implementes una solución monolítica difícil de conectar con futuras fuentes.

Comienza entregando el diagnóstico de la base de código y una propuesta de **Fase 0 + Fase 1**. No programes integraciones externas ni pagos hasta haber confirmado las fuentes, la arquitectura y las decisiones pendientes con el responsable de CocheCierto.
