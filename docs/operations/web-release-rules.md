# Reglas de Secretaría para publicar la web

Estas reglas son obligatorias antes de publicar cambios que afecten a componentes compartidos, navegación, cabecera,
footer, service worker o assets comunes.

## Primera carga directa

Secretaría debe comprobar cada URL pública mediante una entrada directa en un contexto limpio, sin depender de una
recarga posterior. La comprobación debe confirmar:

- logo visible y cargado;
- navegación completa, incluida la pestaña “Guías”;
- footer común presente una sola vez;
- enlaces del header y footer resolviendo desde rutas profundas;
- ausencia de errores de consola y de recursos 404;
- service worker con versión vigente.

Una URL que solo se corrige al recargar se considera **fallo de release**, no una validación superada.

## Menú móvil y conversión

En viewport móvil, Secretaría debe comprobar que:

- la barra inferior muestra una sola vez `Inicio`, `Guías`, `Valorar` y `Menú`;
- `Valorar` es el acceso primario y no compite con otro CTA duplicado;
- los textos no se cortan ni generan desplazamiento horizontal;
- `Menú` abre el panel agrupado por intención, permite cerrar con `×`, con el fondo y con `Escape`;
- los enlaces de Guías y Valorador funcionan también desde una URL profunda cargada directamente.

Si el menú aparece incompleto, duplicado o depende de una recarga, el release queda bloqueado.

## Evidencia mínima

La revisión debe guardar las URLs probadas, viewport, resultado de primera carga, resultado de recarga, errores de
consola/red y versión del shell. El release queda bloqueado hasta corregir cualquier diferencia.
