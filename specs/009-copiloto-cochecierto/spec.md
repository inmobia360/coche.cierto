# Spec 009 — Copiloto CocheCierto

## Estado

Propuesta para aprobación. Esta spec define la Fase 1 y no activa todavía una integración de IA en producción.

## Objetivo

Crear un asistente guiado que ayude a una persona a entender qué coche necesita, interpretar una orientación ya calculada y preparar sus siguientes pasos de compra. El asistente explica; las cifras y decisiones calculadas proceden de funciones controladas.

## Usuario y alcance de la Fase 1

La Fase 1 está dirigida a compradores que:

- no saben por dónde empezar;
- están haciendo su primera compra;
- van a cambiar de coche;
- necesitan entender un resultado del valorador;
- quieren preparar preguntas para una visita.

La primera versión será guiada por opciones y tarjetas. No dependerá de que el usuario sepa redactar un prompt.

## Flujos

### A. Elegir coche

Recoge uso, kilómetros aproximados, ocupantes, presupuesto y prioridades. Devuelve una categoría orientativa, rango de presupuesto, supuestos y tres comprobaciones siguientes.

### B. Entender un resultado

Explica cada indicador del informe y separa `[Aportado por el usuario]`, `[Calculado]`, `[Estimado]` y `[Pendiente de verificar]`.

### C. Preparar una visita

Genera preguntas y una checklist de visita a partir del perfil y de los elementos pendientes. No afirma que una unidad esté bien ni sustituye una inspección.

### D. Conceptos

Explica en lenguaje sencillo términos como ITV, TAE, reserva de dominio, etiqueta ambiental y coste total.

## Herramientas permitidas

En Fase 1 solo se permiten funciones locales o backend controlado:

- `calcular_presupuesto`
- `calcular_coste_mensual`
- `generar_preguntas_vendedor`
- `crear_checklist`
- `consultar_metodologia`
- `explicar_indicador`

La IA no puede inventar importes, alterar fórmulas, consultar fuentes no autorizadas ni presentar una estimación como dato observado.

## Resultado mínimo

Cada respuesta accionable debe incluir:

1. una conclusión breve;
2. los datos usados;
3. los supuestos;
4. los elementos pendientes;
5. una acción siguiente;
6. el aviso de orientación no vinculante cuando exista riesgo de interpretación.

## Privacidad y seguridad

- No se almacenan conversaciones ni documentos en Fase 1 salvo aprobación específica.
- No se solicitan DNI, dirección, matrícula ni bastidor completo.
- No se suben PDFs, fotografías o informes DGT en esta fase.
- El asistente no puede pagar, contactar, guardar expedientes ni enviar mensajes.
- Toda futura retención requerirá consentimiento, plazo y mecanismo de eliminación.

## Límites de producto y lenguaje

El asistente no debe:

- garantizar el estado de un coche;
- diagnosticar averías por fotos o texto;
- acusar a vendedores;
- inventar precios de mercado;
- dar asesoramiento legal, financiero o mecánico concluyente;
- usar conversaciones de foros como prueba de una recomendación.

## Criterios de aceptación

- El usuario puede iniciar uno de los tres caminos principales sin escribir texto.
- Las respuestas muestran etiquetas de procedencia y supuestos.
- Una pregunta no entendida ofrece opciones para reformularla.
- Cada flujo termina en una acción clara o en una comprobación pendiente.
- El asistente funciona sin pagos ni cuenta.
- No hay llamadas externas ni almacenamiento antes de consentimiento y spec aprobada.
- Se valida en móvil y escritorio sin desbordamiento.

## Handoff

`PRODUCTO-SDD → UX-CONTENIDO → INGENIERIA-WEB → SEGURIDAD-DATOS → LEGAL-CONFIANZA → QA-VALIDACION`

`FINANZAS-TCO`, `AUTO-RIESGO` e `INFORME-ACCIONABLE` deben aprobar las funciones y el formato de resultados antes de la implementación.

## Servicio de búsqueda asistida — contexto de producto

La búsqueda asistida se plantea como pases temporales de pago único, no como suscripción automática. En la web beta solo se mostrará como “Próximamente”, sin precios ni pasarela activa.

- Gratis: diagnóstico, perfil editable, categoría orientativa, simulación, criterios de búsqueda y ejemplos de puntuación.
- Análisis de unidad: revisión detallada de un anuncio, datos ausentes, preguntas y checklist personalizada.
- Búsqueda asistida: primer informe, alertas y comparación de candidatos cuando existan conectores autorizados y el servicio haya sido aprobado.

Los plazos, cobertura, fuentes, desistimiento, comunicaciones y tratamiento de datos requerirán una spec de pagos/derechos y revisión legal antes de ofrecerse comercialmente.
