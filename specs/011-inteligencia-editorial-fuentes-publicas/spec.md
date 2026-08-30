# Spec 011 — Inteligencia editorial de fuentes públicas

## Objetivo

Convertir señales de interés, dudas y tendencias observadas en fuentes públicas autorizadas en propuestas editoriales útiles para CocheCierto, sin copiar contenido, perfilar personas ni presentar opiniones como hechos.

## Alcance MVP

- Trabajar con una sola fuente autorizada por ciclo.
- Registrar fuente, URL, fecha de consulta, reglas de acceso y alcance permitido.
- Extraer únicamente resúmenes y patrones agregados.
- Clasificar cada hallazgo por perfil de comprador, tema y nivel de evidencia.
- Contrastar afirmaciones sensibles con una fuente oficial o técnica cuando sea posible.
- Pasar el resultado por revisión legal/editorial antes de incorporarlo a la web.
- Entregar una propuesta de cambio, nunca una publicación automática.

## Regla editorial de interpretación propia

Las fuentes externas solo se utilizan para detectar preocupaciones, lenguaje frecuente y tendencias compartidas. Todo contenido publicado por CocheCierto debe redactarse desde cero como interpretación editorial propia, apoyada en varias señales comunes cuando sea posible. No será un resumen, transcripción, recopilación de opiniones ni contenido certificado por la fuente consultada.

El texto final debe aportar contexto general y preguntas útiles. No podrá crear afirmaciones universales, diagnósticos, acusaciones, garantías ni recomendaciones técnicas concluyentes. Los aspectos legales, de seguridad, normativa, precios o fiabilidad requieren contraste con fuentes oficiales o técnicas independientes.

## Flujo obligatorio

```text
Consulta pública → extracción resumida → clasificación → verificación → revisión legal/editorial → base de conocimiento → propuesta de cambio
```

## Reglas de privacidad y propiedad intelectual

- No acceder a zonas privadas, cuentas, grupos cerrados ni contenido detrás de autenticación.
- No recolectar nombres, alias, fotos, teléfonos, correos, matrículas, VIN, ubicaciones precisas ni identificadores persistentes.
- No copiar publicaciones, comentarios, vídeos, imágenes o textos extensos.
- No usar una opinión individual como prueba técnica.
- Respetar robots, términos de uso, APIs, límites de frecuencia y licencias de cada fuente.
- Conservar solo el resumen mínimo necesario, con fecha y trazabilidad.
- Eliminar o revisar hallazgos caducados, contradictorios o no verificables.

## Niveles de evidencia

- **Fuente oficial:** organismo, fabricante, documentación técnica o normativa aplicable.
- **Patrón contrastado:** señal repetida y apoyada por más de una fuente fiable.
- **Tendencia conversacional:** tema frecuente observado, no prueba de avería ni de comportamiento universal.
- **Orientación preventiva:** recomendación para comprobar algo.
- **Pendiente de comprobar:** requiere revisión documental o profesional.

## Criterios de aceptación

- Cada hallazgo contiene fuente, fecha, resumen propio, categoría, perfil, nivel de evidencia y limitaciones.
- Ningún texto final identifica a una persona ni acusa a una marca, vendedor o concesionario.
- Legal/editorial puede bloquear un hallazgo y dejar constancia del motivo.
- El contenido propuesto diferencia hechos, estimaciones, experiencias y pendientes.
- El contenido derivado de fuentes externas es una interpretación propia, no un resumen ni una certificación, y contiene un límite comprensible para el usuario.
- QA puede reproducir el flujo con un caso límite sin acceder a fuentes privadas.

## Fuera de alcance

Scraping masivo, publicación automática, campañas sociales automáticas, monitorización de usuarios, ranking de marcas, diagnóstico mecánico basado en opiniones, recopilación de datos personales y conexión con una fuente sin revisión de licencia.

## Preguntas abiertas

- Fuente inicial autorizada y método de acceso.
- Responsable de validar licencias y términos de cada plataforma.
- Plazo de conservación del repositorio interno.
- Criterios para considerar un patrón suficientemente contrastado.
