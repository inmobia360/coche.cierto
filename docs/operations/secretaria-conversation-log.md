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
