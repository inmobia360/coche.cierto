# Wireflow MVP — Diagnóstico de cinco minutos

## Principio

Una sola decisión por pantalla, lenguaje no técnico, progreso visible y resultado útil antes de pedir contacto.

## Flujo principal

```text
[Landing]
   |
   v
[Inicio: "Descubre qué coche encaja contigo"]
   |  CTA: Empezar diagnóstico (sin registro)
   v
[Bloque 1: intención]
   |  qué quiere hacer + cuándo
   v
[Bloque 2: uso]
   |  ciudad/mixto/carretera + km + pasajeros + carga
   v
[Bloque 3: contexto]
   |  aparcamiento/carga + ZBE + tamaño
   v
[Bloque 4: economía]
   |  presupuesto + contado/financiación + prudencia
   v
[Bloque 5: preferencias]
   |  prioridades + combustible/cambio + tolerancia a averías
   v
[Resumen editable]
   |  corregir respuestas / ver recomendación
   v
[Resultado orientativo]
   |  opción principal + 2 alternativas + razones + advertencias
   v
[CTA de valor]
   |  guardar/recibir resultado o continuar sin contacto
   v
[Lead opcional]
   |  email/teléfono + intención + plazo + consentimientos separados
   v
[Confirmación]
      resultado guardado + siguiente paso no agresivo
```

## Pantallas y comportamiento

### Landing

Promesa: “Descubre qué tipo de coche encaja con tu vida antes de mirar anuncios”. Mostrar duración aproximada, ausencia de registro inicial y aviso de orientación.

### Preguntas

Mostrar una pregunta principal, respuestas grandes y botón atrás. Mantener respuestas en sesión local mientras dura el flujo. Permitir “No lo sé” sin bloquear salvo en intención y plazo.

### Resumen

Presentar las respuestas agrupadas por intención, uso, economía y preferencias. Cada bloque debe tener acción “Cambiar”. No calcular un resultado final irreversible hasta que el usuario continúe.

### Resultado

Mostrar:

- recomendación principal de categoría y orientación de motorización;
- tres razones personalizadas;
- dos alternativas con su trade-off;
- alerta de prudencia, si aplica;
- datos que conviene validar;
- aviso de que no es peritaje ni aprobación financiera.

No mostrar anuncios, precios patrocinados ni marketplace.

### Captación

El usuario puede continuar sin dejar datos. Si desea guardar o recibir el resultado, solicitar email; teléfono es opcional inicialmente. Separar:

- consentimiento necesario para gestionar la petición;
- consentimiento opcional para comunicaciones comerciales.

Registrar fuente, fecha, versión del cuestionario y versión de reglas, sin guardar respuestas innecesarias.

## Estados y errores

- Abandono: conservar el progreso solo durante la sesión; no enviar lead incompleto sin consentimiento.
- Presupuesto desconocido: mostrar recomendación provisional y pedir validación posterior.
- Respuestas incompatibles: explicar la tensión y ofrecer dos escenarios, no elegir silenciosamente.
- Servicio de captación no disponible: entregar igualmente el resultado y mostrar una opción de reintento.
- Usuario cambia respuestas: recalcular y mostrar que la recomendación ha cambiado.

## Eventos analíticos mínimos

`diagnostic_started`, `question_answered` (sin texto libre), `diagnostic_completed`, `recommendation_viewed`, `result_saved`, `lead_submitted`, `lead_consent_commercial`.

No enviar email, teléfono ni respuestas completas a herramientas analíticas generales.
