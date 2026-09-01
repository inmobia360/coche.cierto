# Política de referencias de costes — calculadora 020

Fecha de revisión: 1 de septiembre de 2026. Estas referencias sirven para orientar escenarios, no son tarifas individuales,
promesas ni datos vinculantes.

## Referencias incorporadas o candidatas

| Concepto | Referencia | Uso permitido | Frecuencia de revisión |
|---|---|---|---|
| Combustibles y recarga | MITECO, tabla €/100 km actualizada 17/06/2026 | Presets de energía por tipo; mostrar fecha y metodología | Mensual o cuando MITECO publique actualización |
| Seguro | Kelisto: 975,60 €/póliza en 2025; otras muestras sectoriales son inferiores | Banda contextual, nunca prima individual | Trimestral y por perfil cuando haya datos |
| Mantenimiento | CONEPA/EPF: 754,87 € de gasto familiar anual en 2025 | Referencia de mantenimiento general | Anual o al publicarse nueva EPF |
| Trámites, puesta al día e inspección | Modelo interno beta de CocheCierto: 1.100–2.700 € agrupados | Hipótesis editable, no media de mercado | Revisar con muestra propia y profesional |

Fuentes consultadas: [MITECO — Euros por 100 km](https://www.miteco.gob.es/en/energia/hidrocarburos-nuevos-combustibles/euros-por-100-km.html),
[Kelisto/Europa Press — índice de seguros 2025](https://www.europapress.es/motor/sector-00644/noticia-precio-medio-seguro-coche-subio-2025-9756-euros-poliza-kelisto-20260130103129.html)
y [CONEPA — gasto familiar de mantenimiento 2025](https://www.conepa.org/el-gasto-medio-de-las-familias-espanolas-en-llevar-el-coche-a-punto-crece-un-34-en-cinco-anos/).

La diferencia entre fuentes de seguro demuestra que no existe una media universal: el precio depende de modalidad,
conductor, vehículo, territorio y cobertura. Por eso no se presenta una cifra única como “lo normal”.

## Política de reserva y margen

- Reserva mínima beta: 1.000 € o la reserva declarada por el usuario si es superior.
- Orientación de reserva: 10–15 % como banda de prudencia del modelo interno, no como regla financiera universal.
- Margen mensual de referencia: 15–25 % del margen después de gastos fijos, no del ingreso bruto y no como umbral de crédito.

La herramienta debe mostrar estas cifras como “referencia beta de CocheCierto”, permitir modificarlas cuando se conozcan
costes reales y recordar que no sustituyen presupuesto personal ni asesoramiento financiero.

## Actualización sin datos ocultos

Cada conjunto de referencias tendrá `reference_id`, fecha de publicación, `reviewed_at`, fuente, URL, ámbito, metodología,
versión, estado y fecha prevista de revisión. El proceso será:

1. Revisar fuentes oficiales/sectoriales autorizadas.
2. Registrar cambios y diferencias metodológicas.
3. Aprobar la nueva versión por Producto y Finanzas-TCO.
4. Actualizar presets y texto de fecha en una modificación trazable.
5. Ejecutar casos 020 y QA.
6. Retirar la versión anterior sin borrar su historial.

No habrá actualización automática que cambie cifras visibles sin revisión humana y evidencia.

## Ciclo operativo propuesto

El día 5 de cada mes se abrirá una revisión de los datos publicados del mes anterior. El proceso deberá:

1. Comprobar si las fuentes oficiales han publicado una actualización.
2. Comparar fecha, ámbito y metodología con la versión vigente.
3. Proponer cambios sin alterar automáticamente la web.
4. Obtener revisión humana de Producto y Finanzas-TCO.
5. Aplicar el cambio, actualizar fecha y versión, y ejecutar QA.
6. Registrar el resultado y conservar la versión anterior.

Este ciclo puede automatizarse como recordatorio y generación de una propuesta de cambio. La publicación de cifras
visibles seguirá requiriendo aprobación humana. Los enlaces a MITECO, DGT, Banco de España e INE se ofrecen como
fuentes de consulta; enlazar a una fuente no implica que CocheCierto certifique el dato individual del usuario.
