# Catálogo de recursos CocheCierto

Catálogo operativo para conectar el informe de decisión con la fase concreta de compra. La fuente utilizada por el valorador es `valorador/resource-catalog.js`; este documento sirve como inventario humano y control de alcance.

## Recursos disponibles

| Identificador | Fase | Recurso | Formato | Destino |
|---|---|---|---|---|
| `budget-guide` | Presupuesto | Cuánto gastar en un coche | Web + PDF | `/guias/cuanto-gastar-en-un-coche/` |
| `hidden-costs` | Presupuesto | Gastos ocultos al comprar un coche usado | Web | `/guias/gastos-ocultos-comprar-coche-segunda-mano/` |
| `powertrain-guide` | Búsqueda | Gasolina o diésel según tus kilómetros | Web | `/guias/gasolina-o-diesel-segun-kilometros/` |
| `suspicious-ad` | Búsqueda | Detectar un anuncio sospechoso | Web + PDF | `/guias/detectar-anuncio-coche-sospechoso/` |
| `seller-documents` | Antes de visitar | Documentación que pedir al vendedor | Web + PDF | `/guias/documentacion-pedir-al-vendedor/` |
| `dgt-report` | Antes de visitar | Informe oficial de la DGT | Fuente oficial | `https://sede.dgt.gob.es/` |
| `cold-inspection` | Visita | Checklist de inspección en frío | Interactiva + PDF | `/recursos/checklist-inspeccion.html` |
| `used-car-review` | Visita | Qué revisar en un coche usado | Web + PDF | `/que-revisar-coche-segunda-mano/` |
| `guarantee-guide` | Decisión | Garantía de un coche de segunda mano | Web | `/guias/garantia-coche-segunda-mano/` |

## Recursos pendientes

Estos recursos están definidos en la Spec 012, pero no se enlazan como si ya existieran:

- Preguntas para el vendedor.
- Checklist de prueba de conducción.
- Guía para decidir entre negociar, continuar o descartar.
- Guía después de comprar.
- Checklist contractual antes de entregar una señal.
- Recurso de inspección profesional.

## Reglas de integración

- El resultado muestra primero la acción y después el recurso que la facilita.
- Se recomiendan como máximo cuatro recursos por informe.
- Los recursos básicos no requieren email.
- Los enlaces oficiales aparecen solo junto a la comprobación relacionada.
- Todo recurso debe conservar fecha de actualización, límites y enlace de retorno a `/recursos/`.
- Las rutas del informe y de la demo deben utilizar los mismos identificadores.
