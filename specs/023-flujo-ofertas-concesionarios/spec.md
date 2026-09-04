# Spec 023 — Solicitud de compra y ofertas colaborativas

## Estado

Propuesta para aprobación. No activa envíos automáticos, distribución de leads ni contacto con concesionarios.

## Objetivo

Permitir que una persona transforme su diagnóstico de CocheCierto en una petición de compra clara y controlada, que pueda compartir por iniciativa propia con un concesionario y, en una fase posterior aprobada, recibir ofertas estructuradas y comparables.

El flujo debe mejorar la calidad de la respuesta comercial sin convertir a CocheCierto en concesionario, marketplace ni recomendador patrocinado.

## Principios no negociables

- La persona conserva el control de la petición, los destinatarios y la revocación.
- No se comparte información personal, financiera detallada ni ubicación exacta por defecto.
- El concesionario recibe necesidades y criterios, no una puntuación manipulable ni una promesa de cierre.
- Toda oferta debe separar precio al contado, financiación, extras, disponibilidad, garantía y pendientes.
- Una oferta incompleta no se presenta como comparable ni como recomendación.
- El patrocinio, la afiliación o el pago por oportunidad nunca alteran el encaje técnico.
- Los datos declarados, calculados, estimados y pendientes se muestran con etiquetas distintas.
- No se afirma el estado mecánico de una unidad sin evidencia e inspección apropiada.

## Alcance de la primera entrega

### A. Petición creada por el usuario

Desde el informe, el usuario podrá:

1. Revisar un resumen de sus necesidades antes de compartirlo.
2. Editar respuestas incompletas o corregirlas sin repetir el diagnóstico.
3. Elegir entre descargar una ficha, copiar un enlace de solo lectura o compartirlo usando el dispositivo.
4. Ver exactamente qué datos se incluirán y cuáles permanecerán ocultos.
5. Generar un identificador aleatorio no predecible, con caducidad y revocación.

La primera entrega no contactará automáticamente con ninguna empresa.

### B. Formato de la ficha

La ficha incluirá, cuando estén disponibles:

- objetivo de compra y plazo;
- uso, kilómetros, ocupantes y necesidades funcionales;
- presupuesto declarado y límites relevantes, sin inferir solvencia;
- preferencias e imprescindibles;
- restricciones de etiqueta o zona declaradas;
- información pendiente que el vendedor debe confirmar;
- campos que debe contener una oferta útil;
- fecha de creación, versión y caducidad.

No incluirá por defecto nombre, email, teléfono, DNI, dirección, coordenadas exactas, matrícula, bastidor, ingresos, ahorro ni datos bancarios.

### C. Oferta estructurada — fase posterior

Cuando exista una decisión legal y operativa aprobada, un concesionario identificado podrá responder con:

- identidad comercial y estado de verificación;
- vehículo, versión, motor, año, kilometraje, estado y disponibilidad;
- precio final desglosado y precio al contado;
- financiación: entrada, plazo, TIN, TAE, cuotas, comisiones, productos vinculados, pago final y coste total;
- garantía, historial, mantenimiento y pendientes de una unidad usada;
- extras y servicios separados de lo necesario;
- entrega, reserva, devolución, prueba e inspección independiente;
- vigencia de la oferta y declaración de exactitud.

## Estados

`draft` → `review` → `active` → `shared` → `offer_received` → `comparison` → `contact_authorized` → `visit_requested` → `test_requested` → `completed`

Estados terminales o de control: `expired`, `withdrawn`, `blocked`, `incomplete`.

Cada cambio conservará fecha, actor, versión y motivo mínimo necesario para auditoría.

## Consentimientos separados

Nunca se agruparán en una sola casilla:

- guardar la petición;
- compartir una petición anonimizada;
- recibir ofertas;
- compartir datos de contacto con un concesionario concreto;
- solicitar contacto, visita o prueba;
- recibir comunicaciones comerciales.

La autorización para compartir contacto se pedirá justo antes de la acción y mostrará con quién se compartirá y para qué.

## Comparación y encaje

La comparación mostrará como máximo tres ofertas y distinguirá:

- datos confirmados;
- datos aportados por el vendedor;
- cálculos de CocheCierto;
- estimaciones;
- pendientes o contradicciones.

El encaje se expresará como “encaja con tus prioridades declaradas” y explicará razones a favor, límites y pendientes. No se usará “mejor coche” ni se ordenará por cuota mensual o patrocinio.

Antes de recomendar una acción, deben estar controlados los imprescindibles y el límite máximo declarado. Si falta información crítica, la salida será solicitar confirmación, inspección o seguir buscando.

## Protección del concesionario

La ficha debe ser breve, legible y accionable para un vendedor: resumen de necesidad, presupuesto o rango autorizado, prioridad, disponibilidad temporal y checklist de respuesta. No debe obligar a interpretar una puntuación opaca ni revelar datos que no necesita para preparar una propuesta.

## Seguridad, privacidad y abuso

- La petición tendrá un token de propietario separado del token compartido de solo lectura.
- Los enlaces no contendrán datos descriptivos ni identificadores secuenciales.
- La revocación solo podrá realizarse con el token de propietario e invalidará el enlace sin revelar el contenido.
- Habrá caducidad configurable y limitación de intentos.
- No se accederá a contactos del dispositivo ni se enviarán mensajes automáticamente.
- Los eventos no guardarán respuestas completas, email, teléfono ni coordenadas exactas salvo consentimiento y necesidad documentada.
- La plataforma permitirá descargar, corregir, retirar y eliminar la petición.
- Se revisarán RGPD, base jurídica, encargado de tratamiento, conservación, cookies, analítica y condiciones antes de activar recepción o distribución de ofertas.

## Fuera de alcance

- marketplace de inventario;
- scraping o copia masiva de portales;
- envío automático a concesionarios;
- compra o venta de leads sin acuerdo específico;
- ranking de concesionarios por pago;
- aprobación de financiación;
- diagnóstico mecánico por IA;
- publicación social automática;
- integración de mapas o proveedores de datos sin revisar licencia, costes, atribución y privacidad.

## Criterios de aceptación de la primera entrega

- El usuario ve y confirma el resumen antes de generar una ficha.
- Puede editar o retirar la petición.
- El enlace no revela datos personales en su URL.
- La ficha se puede descargar y compartir manualmente.
- Los datos ocultos no aparecen en PDF, enlace ni eventos.
- La interfaz funciona en móvil, teclado y lector de pantalla básico.
- No se envía ninguna solicitud externa ni se crea ningún lead de concesionario.
- El texto distingue claramente demo, dato declarado, estimación y pendiente.

## Criterios de activación de ofertas

La fase de recepción no se considerará aprobada hasta disponer de:

- revisión legal y de privacidad;
- modelo de datos y control de acceso;
- concesionarios piloto identificados y condiciones de participación;
- definición de verificación, moderación, reclamaciones y retirada;
- política de patrocinio y separación del encaje técnico;
- pruebas con compradores y concesionarios;
- métricas de utilidad, completitud, satisfacción y abandono.

## Handoff

`PRODUCTO-SDD → UX-CONTENIDO → SEGURIDAD-DATOS → LEGAL-CONFIANZA → INFORME-ACCIONABLE → CONVERSION-CRM → INGENIERIA → QA-VALIDACION`
