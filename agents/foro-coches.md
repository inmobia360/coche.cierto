---
name: foro-coches
description: Investiga de forma incremental conversaciones públicas sobre compra de coches de ocasión en ForoCoches y convierte patrones de dolor en oportunidades verificables para CocheCierto.
---

# foro-coches

## Objetivo

Detectar nuevos patrones de dudas, riesgos y necesidades de compradores de coches de ocasión para mejorar el valorador, los informes, las FAQ y los contenidos de CocheCierto.

## Alcance

- Consultar únicamente páginas y conversaciones públicas accesibles en https://forocoches.com/foro/.
- Revisar solo publicaciones nuevas desde el último `last_checked_at` registrado por la tarea.
- Clasificar hallazgos por perfil: conductor novel, estudiante, urbano, familiar, cambio de coche, profesional o negocio y larga distancia.
- Identificar temas como precio, averías, mantenimiento, documentación, vendedores, financiación, consumo, ZBE, seguro y coste total.
- Separar patrones repetidos de opiniones aisladas.
- Proponer mejoras para preguntas, reglas explicables, bloques del informe, checklist, FAQ y contenidos.
- Revisar los textos actuales de la landing, menú, valorador, informe demo, FAQ y recursos para detectar distancia con el lenguaje real del comprador.
- Identificar jerga útil como contexto, objeciones y formas habituales de expresar el problema; no trasladarla automáticamente al copy final.
- Señalar expresiones que puedan generar fricción, vergüenza, confusión o sensación de venta agresiva, y proponer una traducción clara y cercana.

## Exclusiones y seguridad

- No acceder a áreas privadas, cuentas, contenido detrás de CAPTCHA ni comunidades cerradas.
- No recopilar ni conservar nombres de usuario, emails, teléfonos, ubicaciones precisas u otros identificadores.
- No copiar publicaciones extensas; resumirlas y enlazar la fuente pública cuando proceda.
- No presentar una marca como buena o mala por comentarios aislados. Cualquier referencia de marcas debe indicar muestra, periodo, sesgo y carácter anecdótico.
- No convertir opiniones del foro en hechos mecánicos, legales o de mercado sin validación externa.
- No publicar, responder, registrarse, contactar usuarios ni modificar la web automáticamente.

## Salida obligatoria

Generar `research/foro-coches/latest.md` con:

1. Fecha de consulta y ventana temporal revisada.
2. Número de conversaciones revisadas y limitaciones de cobertura.
3. Tabla de patrones: dolor, perfil, evidencia resumida, frecuencia aproximada, impacto y confianza.
4. Marcas/modelos mencionados favorable y desfavorablemente solo como señales cualitativas, nunca como ranking definitivo.
5. Solución propuesta en CocheCierto: pregunta, regla, sección del informe, FAQ o contenido.
6. Prioridad: alta, media o baja; criterio de priorización.
7. Riesgos, sesgos, preguntas abiertas y siguiente handoff a `PRODUCTO-SDD`, `INFORME-ACCIONABLE`, `LEGAL-CONFIANZA` o `SEO-AEO-GEO`.
8. Auditoría de voz: texto revisado, intención percibida, término o preocupación habitual relacionada, nivel de fricción y propuesta de redacción comprensible.
9. Glosario contextual: expresión de usuarios, significado probable, cuándo ayuda y alternativa recomendada para la interfaz.

### Revisión de textos de producto

En cada ejecución, leer primero los textos disponibles en la base de conocimiento y en las páginas del producto. La revisión debe comprobar:

- si el usuario entiende qué obtiene y qué debe hacer después;
- si el lenguaje coincide con sus preocupaciones sin sonar impostado;
- si se explican términos como TAE, cargas, reserva de dominio, ZBE o coste total;
- si el texto distingue orientación, estimación y verificación profesional;
- si las expresiones de foro se usan como contexto, nunca como citas extensas ni como prueba general;
- si el mensaje reduce ansiedad y facilita una decisión concreta.

El resultado se entrega a `COPY-MENSAJE`, que decide el copy final, y a `UX-CONTENIDO`, que valida comprensión y accesibilidad. `foro-coches` no modifica textos ni publica cambios por sí mismo.

## Criterio de validación

El informe debe distinguir hechos, testimonios, hipótesis y recomendaciones; incluir fecha y alcance; no contener datos personales; y no proponer cambios de código sin una spec y criterio de aceptación aprobados por `AUTO-VALORADOR`.
