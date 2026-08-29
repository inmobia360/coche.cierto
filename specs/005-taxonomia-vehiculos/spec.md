# Spec 005 — Taxonomía neutral de vehículos

## Objetivo

Definir una clasificación multidimensional de vehículos para que CocheCierto pueda orientar por tipo de vehículo sin depender inicialmente de marcas, modelos ni anuncios concretos.

## Alcance

- Separar carrocería, segmento, uso, motorización, etiqueta medioambiental y tipo de vendedor.
- Mostrar doce categorías principales y abrir subcategorías cuando sea necesario.
- Mantener identificadores internos estables y etiquetas visibles en español.
- Usar `Car-pic` como referencia visual de categorías, no como catálogo ni fuente de diseños copiables.
- Aplicar anonimización obligatoria a hero, tarjetas, ilustraciones y demás creatividades.

## Modelo mínimo

```text
bodyType          → Carrocería
vehicleSegment    → Tamaño
intendedUse       → Uso recomendado
fuelType          → Combustible o motorización
environmentalLabel → Etiqueta ambiental, si está verificada
sellerType        → Tipo de vendedor, si procede
```

## Criterios de aceptación

- Una unidad puede tener varias etiquetas compatibles sin perder su categoría principal.
- `SUV` se trata como carrocería; no implica tracción total ni capacidad todoterreno.
- Las categorías visibles no muestran marcas ni modelos como requisito del MVP.
- Los modelos reales aparecen solo como referencias internas documentadas.
- Ninguna imagen final contiene logotipos, matrículas reales o rasgos deliberadamente identificables de una marca.
- Cada ambigüedad queda documentada y no se resuelve inventando datos.

## Fuera de alcance

Marketplace, inventario, comparables de mercado, recomendación de marcas, scraping, identificación automática de modelos y creación de un catálogo comercial.

## Validación

Revisión de la tabla de categorías, casos límite, consistencia de identificadores, auditoría visual de anonimización y revisión de claims por `LEGAL-CONFIANZA`.
