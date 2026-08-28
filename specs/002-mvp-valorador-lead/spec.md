# Spec 002 — MVP Valorador y Orientador de Compra

## Contexto y objetivo

El usuario puede necesitar un coche sin saber todavía qué tipo de vehículo comprar. El MVP debe guiarlo desde su situación y necesidades hasta una recomendación de categoría y motorización, y captar un lead con intención de compra sin obligarlo a elegir una unidad concreta.

## Hipótesis de negocio

Un diagnóstico independiente y útil genera más confianza e intención que comenzar mostrando un catálogo. El marketplace se desarrollará después, cuando existan datos de demanda, perfiles y preferencias reales.

## Segmentación inicial

El producto se estructura desde el inicio en dos recorridos: `ocasión` (MVP activo) y `nuevo` (fase preparada, no activa). Dentro de cada recorrido se distingue `uso privado` y `uso profesional/comercial`.

El MVP comienza por ocasión porque concentra incertidumbre, necesidad de orientación y oportunidades de captación. El recorrido de nuevo compartirá componentes, pero tendrá reglas propias de configuración, garantía, financiación y coste de propiedad.

## Usuarios

Personas y profesionales en España que están considerando comprar, cambiar o financiar un vehículo, aunque todavía no tengan marca o modelo decidido.

## Flujo principal

`Entrada → Diagnóstico de uso → Economía y restricciones → Preferencias → Recomendación → Captación consentida → Seguimiento`

## Historias de usuario

- H1: Como persona que necesita movilidad, quiero responder preguntas sencillas sobre mi vida para descubrir qué tipo de coche encaja conmigo.
- H2: Como comprador indeciso, quiero comparar alternativas de compra sin tener que elegir una marca o anuncio al principio.
- H3: Como usuario interesado, quiero recibir una recomendación explicada y saber qué información falta para decidir.
- H4: Como negocio, quiero captar un contacto con consentimiento y conocer su intención, plazo y necesidades para ofrecer seguimiento relevante.

## Requisitos funcionales

- RF-1: CUANDO el usuario inicie el diagnóstico, EL SISTEMA preguntará si busca vehículo de ocasión o nuevo y si el uso será privado o profesional; el recorrido de ocasión estará activo en el MVP y el de nuevo se marcará como próximo.
- RF-1a: CUANDO el usuario elija uso profesional, EL SISTEMA preguntará por actividad, kilómetros laborales, carga, pasajeros, disponibilidad y necesidad de imagen o carrocería de trabajo.
- RF-2: CUANDO el usuario complete economía y restricciones, EL SISTEMA recogerá presupuesto orientativo, ahorro o entrada, cuota tolerable, horizonte, ZBE y disponibilidad de carga cuando sean relevantes.
- RF-3: CUANDO el usuario indique preferencias y tolerancias, EL SISTEMA recogerá tamaño, cambio, combustible, seguridad, confort, fiabilidad y tolerancia a averías sin imponer estereotipos.
- RF-4: CUANDO existan respuestas suficientes, EL SISTEMA recomendará una opción principal de categoría y hasta dos alternativas, explicando los factores determinantes.
- RF-5: SI los datos económicos indican riesgo de endeudamiento o falta de colchón, ENTONCES EL SISTEMA mostrará una recomendación prudente, incluyendo mantener el coche, aplazar o alternativas de menor coste.
- RF-6: SI faltan respuestas críticas, ENTONCES EL SISTEMA pedirá solo la información necesaria o mostrará la recomendación como provisional.
- RF-7: CUANDO el usuario solicite guardar o recibir el resultado, EL SISTEMA pedirá datos de contacto y consentimiento separado para comunicaciones comerciales.
- RF-8: EL SISTEMA registrará como mínimo etapa, plazo estimado de compra, intención (comprar/cambiar/informarse), categoría recomendada y consentimiento otorgado.
- RF-9: EL SISTEMA mostrará que la recomendación es orientativa, basada en respuestas y no constituye asesoramiento financiero, peritaje ni aprobación de crédito.
- RF-10: EL SISTEMA permitirá empezar de nuevo, revisar respuestas y corregirlas antes de enviar el lead.

## Criterios de calidad

- El diagnóstico debe poder completarse en menos de cinco minutos.
- Cada recomendación debe incluir al menos tres razones comprensibles.
- No se deben mostrar marcas, anuncios ni marketplace como requisito del MVP.
- Los campos de contacto no se solicitan antes de entregar valor suficiente.
- El consentimiento comercial debe ser opcional, explícito y distinguible del consentimiento necesario para responder.

## Fuera de alcance — Fase 1

Marketplace, inventario propio, búsqueda de anuncios, tasación de una unidad concreta, valoración DGT/VIN, aprobación de financiación, recomendaciones patrocinadas, app nativa, scraping no autorizado y automatización comercial agresiva.

## Fase 2 reservada

Marketplace de vehículos y ofertas compatibles con el perfil, comparación de unidades, TCO detallado, análisis de financiación, historial e inspección, partners y seguimiento avanzado.

## Métricas de validación

- inicio del diagnóstico;
- finalización;
- abandono por pregunta;
- recomendación vista;
- resultado guardado;
- lead con consentimiento;
- intención de compra a 0–3, 3–6 o más de 6 meses;
- porcentaje de leads contactables y cualificados;
- disposición a solicitar una oferta o servicio posterior.

## Dudas abiertas

- Definir fuente y precisión de rangos de presupuesto sin prometer solvencia.
- Elegir CRM o almacenamiento del lead y revisar RGPD antes de integrar.
- Validar las preguntas con entrevistas antes de fijar pesos definitivos.
