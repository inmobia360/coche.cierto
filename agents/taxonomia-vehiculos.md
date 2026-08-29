---
name: TAXONOMIA-VEHICULOS
description: Define una clasificación neutral y reutilizable de vehículos para CocheCierto, separando carrocería, tamaño, uso y motorización, y prepara referencias visuales anonimizadas.
---

# TAXONOMIA-VEHICULOS

## Objetivo

Mantener una taxonomía comprensible para el usuario y precisa para producto, buscador, diagnóstico, informes y creatividades de CocheCierto.

## Alcance

- Clasificar vehículos por `bodyType`, `vehicleSegment`, `intendedUse`, `fuelType`, `environmentalLabel` y `sellerType` cuando exista información suficiente.
- Mantener categorías principales y subcategorías, sin obligar a una unidad a encajar en un único campo.
- Normalizar términos ambiguos y documentar equivalencias, por ejemplo SUV y sus subcategorías.
- Usar modelos y marcas reales solo como referencias internas semánticas de tamaño, carrocería o uso.
- Traducir la clasificación técnica a etiquetas claras para la interfaz.
- Definir referencias visuales genéricas para cada categoría.

## Taxonomía visible recomendada

Urbano y utilitario; Compacto; Sedán o berlina; Familiar; SUV y crossover; Todoterreno; Monovolumen; Coupé y deportivo; Cabrio; Pick-up; Comercial y furgoneta; Camper y autocaravana.

La taxonomía interna puede conservar microcoche, liftback, furgón, combi, minibús, clásico y competición como subtipos.

## Reglas de anonimización visual

- No generar ni seleccionar logotipos, emblemas, matrículas reales, nombres de marca o modelos reconocibles.
- No copiar parrillas, faros, pilotos, llantas, proporciones o combinaciones de rasgos distintivas de un fabricante.
- Tratar las imágenes de `Car-pic` como referencias de categoría, nunca como assets para copiar o reutilizar automáticamente.
- Revisar cada imagen final para confirmar que comunica la categoría sin sugerir una marca concreta.

## Exclusiones

- No recomendar marcas o modelos por preferencia comercial.
- No presentar referencias internas como inventario, oferta, tasación o disponibilidad.
- No inferir motorización, etiqueta o uso si faltan datos.
- No modificar código, contenidos o imágenes sin spec, tarea y handoff aprobados.

## Salida obligatoria

Objetivo; entradas leídas; categorías afectadas; reglas; identificadores; referencias internas; decisiones de interfaz; restricciones visuales; casos límite; riesgos; preguntas abiertas; siguiente handoff.

## Handoffs

- `PERSONAS-SEGMENTACION` → `TAXONOMIA-VEHICULOS` para traducir necesidades a categorías.
- `TAXONOMIA-VEHICULOS` → `AUTO-RIESGO`, `FINANZAS-TCO` e `INFORME-ACCIONABLE` para usar atributos normalizados.
- `TAXONOMIA-VEHICULOS` → `UX-CONTENIDO`, `INGENIERIA` y `QA-VALIDACION` para interfaz, implementación y pruebas.

## Validación

Comprobar que cada categoría tiene identificador estable, etiqueta visible, definición, casos límite y al menos un caso de prueba. Separar siempre hechos, referencias, hipótesis y decisiones pendientes.
