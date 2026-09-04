# Registro operativo de Secretaria

Este registro convierte las conversaciones del proyecto en decisiones y tareas trazables. No es una transcripción y no debe
contener credenciales, datos personales innecesarios ni secretos.

## Cómo usarlo

1. Añadir una entrada después de cada conversación que contenga una aprobación, cambio, idea accionable, bloqueo o petición.
2. Separar hecho, decisión, hipótesis y pendiente.
3. Asignar responsable, prioridad y criterio observable de aceptación.
4. En cada revisión, cruzar las entradas abiertas con `AUTO-VALORADOR.md`, la spec activa, los planes y las evidencias.
5. Marcar `cerrado` solo cuando exista una prueba o referencia enlazable.

## 2026-09-02 — Prioridad inmediata SEO y P0

- **Acción autorizada:** implementar superficie pública, metadatos, presupuesto, segundo activo P0 y validación local.
- **Implementado:** `/que-revisar-coche-segunda-mano/`, spec `review-checklist.md`, schema/canonical/robots/OG/Twitter, sitemap, enlaces internos y QA SEO estático.
- **Conservado como pendiente:** coste total, análisis de unidad, workbook de keywords, medición con receptor externo, pruebas desplegadas, campañas y páginas P1.
- **Siguiente handoff:** SECRETARIA + QA-VALIDACION, con revisión de MIKE/PRODUCTO-SDD sobre el encaje de los P0.

## Estados

| Estado | Significado |
|---|---|
| `capturado` | Petición o decisión pendiente de ordenar. |
| `en curso` | Tiene responsable y se está ejecutando. |
| `bloqueado` | Falta decisión, dato, autorización o dependencia externa. |
| `validación` | La implementación existe, pero falta comprobarla. |
| `cerrado` | Criterio de aceptación cumplido con evidencia. |

## Plantilla de entrada

```md
### [AAAA-MM-DD] Título breve
- Origen: conversación / auditoría / spec / revisión pública
- Tipo: decisión | cambio | idea | bloqueo | hallazgo
- Estado: capturado | en curso | bloqueado | validación | cerrado
- Decisión o hecho: qué se dijo o confirmó.
- Alcance: qué incluye y qué queda fuera.
- Responsable: persona o subagente asignado.
- Prioridad: crítica | alta | media | baja
- Dependencias: datos, aprobación, spec, integración o revisión necesaria.
- Criterio de aceptación: resultado observable que permite cerrarlo.
- Evidencia: archivo, prueba, URL, commit o informe.
- Próxima acción: acción concreta y siguiente responsable.
```

## Entradas recientes

### [2026-09-04] Línea base beta protegida para mejora continua
- Origen: petición expresa del director y despliegue controlado verificado en producción
- Tipo: decisión
- Estado: cerrado
- Decisión o hecho: la versión beta estática publicada en `https://cochecierto.com/` queda marcada como buena para futuras mejoras.
- Alcance: conservar como referencia funcional el código desplegado en `798a1cc`; `c3b79da` deja actualizado el registro documental y sincronizados GitHub y la carpeta local. La API no se despliega ni modifica en esta operación.
- Responsable: SECRETARIA para el registro; QA-VALIDACION e INGENIERIA para futuras comprobaciones y cambios.
- Prioridad: alta
- Dependencias: autorización expresa del director para alterar el flujo protegido; pruebas reproducibles de producción para cerrar cada pendiente.
- Criterio de aceptación: cada futura mejora parte de esta línea base, identifica archivos y responsable, mantiene beta y límites del producto, aporta evidencia y actualiza el estado operativo.
- Evidencia: `AUTO-VALORADOR.md`, `.agents/subagents/secretaria.md`, `docs/operations/secretaria-status.md`, `798a1cc`, `c3b79da`, comprobación directa de `https://cochecierto.com/`.
- Próxima acción: revisar pendientes conservados por prioridad y abrir tareas separadas sin mezclar cambios de API, CRM, email, analítica o scraping.

### [2026-09-04] Versión buena comunicada a todos los agentes
- Origen: petición expresa del director y verificación de sincronización
- Tipo: decisión
- Estado: cerrado
- Decisión o hecho: `main@c994903` queda designado como versión canónica de referencia; `8d00881` es la base funcional validada para Secretaría y todos los agentes.
- Alcance: CTA principal unificado, nomenclatura pública de casos prácticos, copy de entrada del valorador y medición condicionada al consentimiento.
- Responsable: SECRETARIA; todos los agentes deben partir de esta referencia.
- Prioridad: alta
- Dependencias: mantener la sincronización local/remota y revisar la API publicada por separado.
- Criterio de aceptación: `git rev-parse HEAD` y `origin/main` coinciden en `c994903`; el despliegue estático de Hostinger fue aceptado desde la base funcional `8d00881`.
- Evidencia: `AUTO-VALORADOR.md`, `secretaria-status.md`, commits `8d00881` y `c994903`.
- Próxima acción: QA-VALIDACION conserva los pendientes técnicos y prueba producción sin cambiar la base de referencia.

### [2026-09-02] Secretaria de seguimiento por subagente
- Origen: petición del director
- Tipo: cambio
- Estado: cerrado
- Decisión o hecho: Secretaria debe controlar pendientes y cumplimiento de cada subagente mediante una matriz con encargo, estado, evidencia, criterio faltante y próxima acción.
- Alcance: seguimiento documental y de evidencias del proyecto y de `AUTO-VALORADOR.md`; no ejecución autónoma de código, despliegues, envíos ni decisiones del director.
- Responsable: SECRETARIA
- Prioridad: alta
- Dependencias: acceso al repositorio, specs, registros operativos y evidencias de QA/producción.
- Criterio de aceptación: el perfil contiene reglas para no cerrar tareas sin evidencia y un formato de matriz por subagente; este registro conserva la decisión.
- Evidencia: `.agents/subagents/secretaria.md` y esta entrada.
- Próxima acción: incluir la matriz en cada revisión de `AUTO-VALORADOR.md` y actualizar `secretaria-status.md` cuando cambie una evidencia.

### [2026-09-02] Valorador de baja fricción
- Origen: conversación con el director y revisión UX/conversión
- Tipo: cambio
- Estado: validación
- Decisión o hecho: se elimina `valuator-seo-extended` porque distrae del formulario y duplica contenido; el valorador queda centrado en completar la orientación.
- Alcance: nueve preguntas base, radios accesibles, presupuesto por rangos, resultado directo y preguntas profesionales condicionales.
- Responsable: INGENIERIA + UX-CONTENIDO + COPY-MENSAJE + CONVERSION-CRM
- Prioridad: alta
- Dependencias: QA local, revisión del contrato de leads y validación desplegada.
- Criterio de aceptación: flujo privado y profesional completables sin resumen intermedio, con teclado y móvil, sin regresiones en resultado ni consentimiento.
- Evidencia: `specs/021-valuador-baja-friccion/spec.md` y `docs/operations/secretaria-baja-friccion.md`.
- Próxima acción: QA local; después proponer commit, push y despliegue en Hostinger.

### [2026-09-02] Integración de PDF en Guías y Recursos
- Origen: conversación con el director
- Tipo: cambio
- Estado: validación
- Decisión o hecho: los PDF aprobados deben estar disponibles en las guías individuales, el índice `/guias/` y Recursos según su contenido.
- Alcance: cuatro PDF P0: presupuesto, revisión, documentación y anuncio sospechoso. Descarga directa durante la beta, sin email obligatorio.
- Responsable: INGENIERIA + SEO-AEO-GEO
- Prioridad: media
- Dependencias: publicación y verificación pública.
- Criterio de aceptación: cada PDF aparece en su guía, en `/guias/` y en `/recursos/`; descarga el archivo correcto y conserva el CTA al valorador.
- Evidencia: `output/pdf/`, `guias/index.html`, `recursos/index.html` y auditoría estática.
- Próxima acción: comprobar HTTP 200, descarga y navegación en producción tras autorización.

### [2026-09-02] Memoria operativa de Secretaria
- Origen: conversación con el director
- Tipo: cambio
- Estado: cerrado
- Decisión o hecho: Secretaria debe tomar nota de acuerdos y solicitudes accionables para impedir tareas abandonadas.
- Alcance: registro resumido, revisión cruzada antes de cerrar tareas y conservación de evidencias; sin transcripciones ni datos personales innecesarios.
- Responsable: SECRETARIA
- Prioridad: alta
- Dependencias: revisar el registro en cada cierre.
- Criterio de aceptación: existe una plantilla y cada revisión identifica entradas sin responsable, criterio o evidencia.
- Evidencia: `.agents/subagents/secretaria.md` y este documento.
- Próxima acción: incluir el registro en la checklist previa a cada release.
