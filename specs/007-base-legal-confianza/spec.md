# Spec 007 — Base legal y confianza

Estado: propuesta documentada, pendiente de revisión jurídica y aprobación SDD.
Fecha: 2026-08-29
Propietario: LEGAL-CONFIANZA, con apoyo de INGENIERIA-WEB, UX-CONTENIDO y PAGOS-DERECHOS.

## 1. Objetivo

Dotar a CocheCierto de una base legal clara, visible y mantenible para operar como servicio digital dirigido inicialmente a usuarios de España y potencialmente del Espacio Económico Europeo. La experiencia debe explicar qué hace la plataforma, qué datos trata, qué recibe el usuario y cuáles son los límites de los informes, sin crear una falsa apariencia de tasación, peritaje, asesoramiento profesional o garantía de compra.

La spec cubre la arquitectura de confianza y los requisitos funcionales de consentimiento, información y contratación. No sustituye la revisión de un abogado ni fija datos registrales que todavía no estén confirmados.

## 2. Alcance

### Incluido

- Aviso legal.
- Política de privacidad.
- Política de cookies y centro de preferencias.
- Condiciones de uso del valorador y de los informes.
- Condiciones de contratación para informes digitales de pago, cuando se active el producto.
- Política de reembolsos, incidencias y soporte.
- Información sobre IA, automatizaciones y revisión humana por parte del usuario.
- Condiciones de compartición de informes por email y mensajería.
- Política de accesibilidad y página de contacto/reclamaciones.
- Enlaces legales coherentes en la cabecera o pie común de todas las rutas.
- Versionado, fecha de actualización y registro de aceptación de textos y consentimientos.

### Fuera de alcance de esta iniciativa

- Activar pagos, suscripciones, cuentas o campañas comerciales.
- Enviar mensajes automáticos a particulares o concesionarios.
- Integrar proveedores de analítica, publicidad, mapas o mensajería.
- Redactar datos del titular, NIF, domicilio, proveedor de pagos o encargados sin confirmación.
- Afirmar cumplimiento jurídico definitivo sin revisión profesional.

## 3. Principios obligatorios

1. Minimización: pedir solo los datos necesarios para entregar la función solicitada.
2. Separación: el consentimiento para recibir un informe no se mezcla con el consentimiento comercial.
3. Transparencia: diferenciar datos aportados, datos observados, cálculos, estimaciones y pendientes de comprobar.
4. Independencia: ningún patrocinio, afiliación, lead o enlace externo altera silenciosamente una recomendación.
5. No confusión: los informes indicarán que son orientativos y no sustituyen inspección profesional, asesoramiento legal o financiero.
6. Control: el usuario puede rechazar cookies no esenciales y retirar permisos comerciales sin perder el acceso a funciones no condicionadas legalmente.
7. Accesibilidad: los avisos, formularios y controles serán legibles, navegables con teclado y utilizables en móvil.

## 4. Requisitos funcionales

### RF-01 — Pie legal común

Todas las páginas públicas mostrarán enlaces a Aviso legal, Privacidad, Cookies, Condiciones, Accesibilidad y Contacto. El componente será común para evitar versiones divergentes entre el dominio principal, valorador, demo y recursos.

### RF-02 — Aviso legal

La página mostrará la identidad del titular, datos registrales y fiscales confirmados, contacto, actividad, condiciones generales de acceso, propiedad intelectual, enlaces externos, responsabilidad y jurisdicción aplicable cuando proceda.

### RF-03 — Privacidad

La política describirá responsable, categorías de datos, finalidad, base jurídica, conservación, destinatarios, transferencias, derechos, reclamación ante la autoridad de control, seguridad y contacto. Cada formulario tendrá una primera capa breve enlazada a la información completa.

### RF-04 — Cookies

Antes de instalar cookies no esenciales se mostrará una primera capa con acciones equivalentes y visibles: “Aceptar”, “Rechazar” y “Configurar”. Las categorías se podrán decidir granularmente. El centro permitirá modificar la decisión posteriormente y conservará la versión y fecha del consentimiento.

### RF-05 — Valorador e informes

Antes y después del resultado se mostrará un aviso visible: el resultado es orientativo, no es una tasación, peritaje, diagnóstico mecánico, aprobación de financiación ni garantía de estado o compra. Las demos identificarán todos los datos como simulados.

### RF-06 — Email y comunicaciones

El envío del resultado solicitado tendrá un consentimiento separado del marketing. El marketing será opcional, específico, revocable y con mecanismo de baja. Los datos no se usarán para una finalidad distinta sin información y base jurídica adecuadas.

### RF-07 — Contenido digital de pago

Antes de pagar se mostrarán precio total, impuestos aplicables, contenido, formato, disponibilidad, requisitos técnicos, soporte, limitaciones y condiciones de cancelación. Si el acceso o descarga comienza durante el periodo de desistimiento, se recabará la aceptación expresa y el reconocimiento legal que corresponda, sujeto a validación jurídica.

### RF-08 — IA y automatizaciones

La plataforma informará de cuándo una recomendación, resumen o borrador está asistido por IA. Ningún mensaje a terceros se enviará sin revisión y acción expresa del usuario. Se explicará que el resultado puede contener errores y debe verificarse.

### RF-09 — Compartición

Los informes compartidos indicarán el alcance del enlace, la posibilidad de reenvío y, si se implementan, caducidad, revocación y controles de acceso. No se incluirán datos personales innecesarios en URLs ni metadatos públicos.

### RF-10 — Cambios y evidencias

Cada documento legal tendrá versión, fecha de entrada en vigor y fecha de revisión. Los consentimientos deberán poder auditarse sin almacenar más datos de los necesarios. Los cambios materiales requerirán nueva aceptación cuando corresponda.

## 5. Contenido editorial mínimo

El tono será directo y comprensible para una persona joven o sin experiencia en compra de coches. Cada página incluirá un resumen inicial “En pocas palabras”, secciones desplegables cuando ayuden a reducir fricción y enlaces a recursos oficiales. No se copiarán textos de terceros.

El aviso de informes deberá incluir, como mínimo:

> CocheCierto ofrece una guía orientativa basada en la información disponible y en las respuestas del usuario. No es una tasación, un peritaje, una inspección profesional, asesoramiento legal o financiero, ni garantiza el estado de un vehículo. La decisión final corresponde al usuario y debe apoyarse en documentación verificable y, cuando proceda, revisión profesional.

## 6. Criterios de aceptación

- CA-01: existe una única navegación legal común y funciona en escritorio, tablet y móvil.
- CA-02: ninguna página pública carece de aviso legal, privacidad y cookies enlazados.
- CA-03: no se ejecutan cookies no esenciales antes del consentimiento válido.
- CA-04: aceptar y rechazar cookies tienen una visibilidad y fricción equivalentes.
- CA-05: los formularios separan consentimiento de servicio y consentimiento comercial.
- CA-06: el valorador y la demo muestran claramente sus límites antes de que el usuario interprete el resultado.
- CA-07: las condiciones de pago no aparecen activas hasta disponer de proveedor, precios y política de reembolso aprobados.
- CA-08: se puede navegar y leer todo el contenido sin desbordamiento en los breakpoints soportados.
- CA-09: los documentos legales muestran versión y fecha y pasan revisión de contenido por LEGAL-CONFIANZA.
- CA-10: QA documenta pruebas de enlaces, formularios, cookies, accesibilidad básica y persistencia de preferencias.

## 7. Plan de implementación posterior

1. Confirmar titularidad, jurisdicción, proveedores, herramientas de medición, retención y productos reales.
2. Crear la matriz de tratamientos y el inventario de cookies/servicios.
3. Redactar las páginas legales y sus primeras capas en formularios.
4. Implementar el componente común de pie legal y el centro de preferencias.
5. Añadir controles de consentimiento y registro técnico mínimo.
6. Revisar accesibilidad, responsive, enlaces, flujos de email y descarga.
7. Someter textos y flujo de contratación a revisión jurídica.
8. Aprobar tareas y desplegar solo después de la validación.

## 8. Referencias normativas y de buenas prácticas

- Reglamento General de Protección de Datos: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- Marco europeo de protección de datos: https://commission.europa.eu/law/law-topic/data-protection/legal-framework-eu-data-protection_en
- Derechos de consumidores y contratos a distancia: https://commission.europa.eu/law/law-topic/consumer-protection-law/consumer-contract-law/consumer-rights-directive_en
- Contenido y servicios digitales: https://eur-lex.europa.eu/eli/dir/2019/770/oj
- Guía de cookies de la AEPD: https://www.aepd.es/guias/guia-cookies.pdf
- Referencia de arquitectura de navegación y bloque legal consultada: https://thebigschool.com/

## 9. Riesgos y decisiones pendientes

- No se conoce en esta spec la identidad jurídica definitiva del responsable.
- El tratamiento de datos cambia si se activan cuentas, pagos, CRM, mapas, publicidad o mensajería.
- El régimen de desistimiento depende de si se entrega contenido digital, servicio digital o ambos, y de cómo se inicia la prestación.
- La política de cookies no puede cerrarse sin un inventario real de scripts y proveedores.
- La futura búsqueda asistida puede introducir obligaciones adicionales si la plataforma intermedia, ordena ofertas o contacta con terceros.

Esta spec no autoriza esas integraciones; únicamente deja preparados sus requisitos de confianza y cumplimiento.
