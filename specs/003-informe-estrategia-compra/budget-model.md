# Modelo de presupuesto total y reserva

## Principio

El precio anunciado no es el presupuesto de compra. El informe debe diferenciar lo que el usuario puede pagar hoy de lo que puede mantener sin quedarse sin margen.

## Variables

```text
presupuesto_total = precio_coche + gastos_iniciales + reserva_emergencia
gastos_iniciales = transferencia + seguro_inicial + puesta_al_dia + inspeccion + accesorios_necesarios
coste_mensual = cuota + energia + seguro_mensual + mantenimiento_mensual + impuestos + aparcamiento + peajes
```

Los campos desconocidos se muestran como rango o “pendiente”, nunca como cero silencioso.

## Rangos iniciales de gastos

Son hipótesis configurables para el MVP, no tarifas universales:

| Concepto | Ocasión económica | Ocasión estándar | Nuevo/provisional |
|---|---:|---:|---:|
| Transferencia y trámites | 250–600 € | 300–800 € | 300–1.000 € |
| Seguro inicial | 350–1.200 € | 400–1.500 € | 450–1.800 € |
| Puesta al día | 500–1.500 € | 800–2.500 € | 0–800 € |
| Inspección/diagnosis | 100–250 € | 150–350 € | 100–300 € |

El informe debe mostrar la fuente, fecha y región cuando estos rangos se sustituyan por datos reales.

## Reserva de emergencia

- Presupuesto de ocasión hasta 5.000 €: sugerir reserva de 1.000–1.500 € además del precio.
- Presupuesto de ocasión de 5.000–15.000 €: sugerir 10–15 % del precio, con mínimo configurable.
- Presupuesto superior a 15.000 €: sugerir 8–12 % según antigüedad, garantía y tolerancia.
- Uso profesional: aumentar la reserva si una avería implica pérdida de ingresos o parada crítica.
- Si no existe reserva, marcar “compra vulnerable” y recomendar reducir precio, buscar garantía verificable o aplazar.

Estos rangos deben probarse con profesionales y no presentarse como requisito legal o garantía de gasto.

## Precio máximo recomendado

```text
precio_maximo_coche = dinero_total_disponible - gastos_iniciales - reserva_recomendada
```

Si el usuario solo declara una cuota, no derivar un precio máximo sin pedir o marcar como desconocidos seguro, energía, mantenimiento y entrada.

## Tres resultados

- **Precio ideal:** deja margen amplio para gastos y negociación.
- **Precio máximo prudente:** consume la reserva prevista, sin eliminarla.
- **Umbral de abandono:** supera el dinero disponible, deja coste mensual no sostenible o exige asumir un riesgo no aceptado.

## Ejemplo de bajo presupuesto

Con 3.000 € para toda la operación, el sistema no debe recomendar automáticamente un coche de 3.000 €:

```text
3.000 € disponibles
- 500 € trámites y seguro inicial aproximados
- 800 € reserva mínima orientativa
= 1.700 € como precio máximo provisional del coche
```

El resultado debe indicar que la cifra cambia según región, conductor, unidad, seguro y estado real.

## Uso profesional

Añadir:

- coste de parada por día;
- kilómetros laborales;
- coste de sustitución o vehículo alternativo;
- carga y equipamiento;
- horizonte de renovación;
- diferencia entre gasto personal y actividad profesional, siempre como orientación y con revisión fiscal.

## Mensajes de seguridad

- No afirmar que la reserva cubrirá cualquier avería.
- No llamar “asequible” a una operación sin conocer los gastos esenciales.
- No recomendar financiación solo porque la cuota encaje.
- Mostrar siempre que los rangos son estimaciones y qué dato falta.
