# Cuestionario MVP — Valorador y Orientador

Objetivo de diseño: completar el diagnóstico en menos de cinco minutos. Las preguntas deben mostrarse de una en una, con lenguaje sencillo, opción “No lo sé” cuando proceda y posibilidad de revisar antes del resultado. El recorrido comienza seleccionando ocasión/nuevo y privado/profesional; nuevo queda preparado pero no operativo.

| # | Pregunta para el usuario | Tipo de respuesta | Obligatoria | Propósito | RF |
|---|---|---|---|---|---|
| 1 | ¿Qué quieres hacer ahora? | Comprar / cambiar / informarme | Sí | Medir intención inicial | RF-1, RF-8 |
| 0 | ¿Qué tipo de coche buscas? | Ocasión / nuevo (próximamente) | Sí | Separar recorridos de producto | RF-1 |
| 0b | ¿Para qué lo usarás? | Uso privado / trabajo o negocio | Sí | Separar buyer persona y reglas | RF-1, RF-1a |
| 2 | ¿Cuándo crees que tomarás una decisión? | 0–3 meses / 3–6 / +6 / no sé | Sí | Priorizar seguimiento | RF-8 |
| 3 | ¿Para qué usarás principalmente el coche? | Ciudad / mixto / carretera / trabajo / familia | Sí | Definir patrón de uso | RF-1 |
| 4 | ¿Cuántos kilómetros harás al año? | <5.000 / 5–10k / 10–20k / 20–30k / +30k / no sé | Sí | Comparar motorizaciones y coste | RF-1 |
| 5 | ¿Cuántas personas viajarán normalmente? | 1 / 2 / 3–4 / 5+ | Sí | Determinar espacio mínimo | RF-1 |
| 6 | ¿Necesitas transportar algo especial? | Niños / mascotas / equipaje / herramientas / nada especial | No | Afinar carrocería y maletero | RF-1, RF-3 |
| 7 | ¿Dónde aparcas normalmente? | Calle / garaje sin enchufe / garaje con enchufe / mixto | Sí | Evaluar carga y practicidad | RF-1, RF-2 |
| 8 | ¿Conduces habitualmente por una Zona de Bajas Emisiones? | Sí / no / a veces / no sé | Sí | Filtrar restricciones ambientales | RF-1, RF-2 |
| 9 | ¿Qué presupuesto total te resulta cómodo? | Hasta 3k / 3–5k / 5–8k / 8–15k / 15–25k / 25–40k / +40k / prefiero no decirlo | Sí | Estimar asequibilidad sin aprobación crediticia | RF-2, RF-5 |
| 10 | ¿Comprarías al contado o valorarías financiar? | Contado / financiar / ambas / no sé | Sí | Orientar escenarios de adquisición | RF-2 |
| 11 | ¿Qué te preocupa más? | Precio / consumo / averías / seguridad / espacio / etiqueta / reventa | Sí | Personalizar pesos | RF-3, RF-4 |
| 12 | ¿Qué tamaño prefieres o necesitas? | Pequeño / compacto / familiar / grande / SUV / indiferente | Sí | Proponer categoría | RF-3, RF-4 |
| 13 | ¿Tienes preferencia de combustible o cambio? | Gasolina / diésel / híbrido / eléctrico / indiferente; manual/automático | No | Ajustar recomendación sin imponerla | RF-3, RF-4 |
| 14 | ¿Qué tolerancia tienes a gastos o averías inesperadas? | Baja / media / alta / no sé | Sí | Equilibrar nuevo-usado y reserva | RF-3, RF-5 |
| 15 | ¿Quieres recibir y guardar tu resultado? | Email/teléfono + consentimiento necesario y comercial separado | No hasta solicitar resultado | Captar lead después de entregar valor | RF-7, RF-8 |

## Preguntas condicionales para uso profesional

| Pregunta | Opciones iniciales | Propósito |
|---|---|---|
| ¿A qué te dedicas? | Autónomo / reparto / transporte de personas / comercial / empresa / otro | Identificar uso profesional |
| ¿Cuántos kilómetros laborales haces? | <10k / 10–25k / 25–50k / +50k / no sé | Coste y disponibilidad |
| ¿Qué necesitas transportar? | Personas / mercancía / herramientas / nada especial | Carrocería y carga |
| ¿Cuánto tiempo puede estar parado? | Un día / varios días / casi nunca | Fiabilidad y reserva |
| ¿Comprarías como empresa o particular? | Empresa/autónomo / particular / no sé | Seguimiento y necesidades fiscales orientativas |

## Reglas de experiencia

- Mostrar una barra de progreso por bloques: intención, uso, economía y preferencias.
- No pedir nombre, email o teléfono antes de la recomendación.
- Permitir “No lo sé” en kilómetros, carga, combustible y tolerancia.
- Si el usuario no declara presupuesto, entregar orientación de categoría, pero marcar la recomendación como provisional.
- La pregunta 15 solo aparece después de mostrar el resultado o cuando el usuario elige guardarlo.
- El teléfono nunca será obligatorio para recibir un resultado digital salvo decisión posterior documentada.

## Datos derivados

- `intent`: comprar, cambiar o informarse.
- `purchase_window`: 0–3, 3–6, más de 6 meses o desconocido.
- `usage_profile`: ciudad, mixto, carretera, trabajo o familia.
- `annual_km_band`, `passenger_band`, `parking_type`, `zbe_need`.
- `budget_band`, `finance_preference`, `risk_tolerance`.
- `priority_factors`, `size_preference`, `powertrain_preference`.

## Límites

Los rangos de presupuesto y las recomendaciones son orientativos. No se debe inferir solvencia, género, origen, empleo o capacidad de pago a partir de respuestas no proporcionadas.
