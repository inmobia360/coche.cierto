# Spec: Orquestación de subagentes v1

## Objetivo

Hacer reproducible el proceso de `AUTO-VALORADOR` mediante perfiles especializados, handoffs trazables y puertas SDD antes de modificar producto o documentación.

## Alcance

- catálogo de perfiles en `.agents/subagents/`;
- flujo SDD en `.agents/workflows/`;
- contrato común de salida;
- matriz de activación mínima y condiciones de parada.

## Fuera de alcance

No crea ejecución autónoma paralela, credenciales, conectores, despliegues, pagos, scraping ni automatizaciones externas.

## Criterios de aceptación

- existe un perfil reutilizable para producto, ingeniería, QA, seguridad, UX, informe, taxonomía y TCO;
- cada perfil declara alcance, exclusiones, entradas, validación y handoff;
- el flujo exige constitución, spec, plan y validación;
- los perfiles no pueden convertir hipótesis en hechos ni superar los permisos del agente principal.
