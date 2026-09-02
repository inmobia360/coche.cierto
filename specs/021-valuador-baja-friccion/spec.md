# Spec: valorador de baja fricción

## Estado

Implementado en local; pendiente de validación visual y funcional en entorno desplegado.

## Decisión

El valorador prioriza completar la orientación sobre añadir contenido SEO dentro del flujo. Se elimina
`valuator-seo-extended`; las guías y páginas de intención captan tráfico fuera del formulario.

## Requisitos

- Mostrar una sola pregunta por pantalla.
- Mantener nueve preguntas base: intención, uso, kilómetros, personas, aparcamiento, ZBE, presupuesto,
  prioridad y tolerancia al riesgo.
- Mostrar las tres preguntas profesionales solo cuando el uso sea trabajo o negocio.
- Usar `fieldset`, `legend`, `label` y `input[type=radio]` para las respuestas.
- Presentar el presupuesto como rangos cerrados, con una opción explícita de no declarar.
- No exigir email para iniciar ni para llegar a la orientación.
- El botón final debe llevar directamente al resultado; la revisión queda disponible desde el resultado.
- Mantener las advertencias de orientación, estimación y necesidad de verificar una unidad concreta.

## Fuera de alcance

- A/B testing o cambios en el receptor de analítica.
- Rediseño del informe completo y de la captura de leads.
- Nuevas páginas SEO, contenido masivo o `valuator-seo-extended`.
- Despliegue en Hostinger.

## Aceptación

- No existe ningún nodo ni estilo `valuator-seo-extended` en la página.
- La ruta privada completa el flujo con nueve respuestas y llega al resultado sin resumen intermedio.
- La ruta profesional añade únicamente las preguntas condicionales.
- Las respuestas se pueden operar con teclado y tienen foco visible.
- `node --check valorador/app.js` y las pruebas funcionales locales pasan.

## Pendientes para la siguiente fase

- Comparar tiempo de finalización, abandono, resultado visto y siguiente acción frente a la versión anterior.
- Validar con usuarios móviles y revisar el copy con datos de conversión reales.
- Revisar la compatibilidad del contrato de datos antes de cambiar `questionnaireVersion` en producción.
