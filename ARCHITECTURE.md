# ONE SHOT · Arquitectura y reglas de evolución

Este documento define qué archivo es dueño de cada responsabilidad activa. Su objetivo es evitar el patrón de agregar un parche que envuelve otro parche anterior.

## Regla principal

Un comportamiento operativo debe tener **un solo propietario activo**. Los archivos históricos pueden permanecer en el repositorio para trazabilidad, pero si fueron reemplazados no deben volver a `DYNAMIC` en `service-worker.js`.

Cuando una mejora necesite cambiar un flujo existente, se modifica su propietario actual o se reemplaza de forma explícita. No se crea un wrapper adicional salvo compatibilidad temporal documentada, con fecha/criterio de retiro.

## Propietarios activos

| Responsabilidad | Propietario actual | Regla |
| --- | --- | --- |
| Versión publicada / actualización | `version.json` + `one-bootstrap-v643.js` | La versión de release es autoritativa; la versión interna de un módulo reutilizado no puede rebajarla. |
| Editar con Fer: organización → tipo → proveedor PANEL → confirmación | `one-v6418-edit-core.js` | Único propietario de `GuidedEditor` para el flujo operativo, voz de edición, Fer de edición y logos dentro del editor. |
| Reporte Excel canónico | `one-v646-reports.js` | Las capas anteriores de reportes no deben volver a envolver `Reports.makeExcel`. |
| Persistencia durable y verificación de fotografías | `one-v6416-evidence-recovery.js` | Toda captura debe conservar compatibilidad y verificación de IndexedDB. |
| Compatibilidad de campos de imagen históricos | `one-v6416-media-legacy-bridge.js` | No migrar destructivamente ni eliminar bytes históricos. |
| Base principal de evidencias | `oneshotEvidenceDB_v2` en `app.js` | No cambiar nombre/esquema sin migración explícita y pruebas de recuperación. |
| Territorio operativo / equipos | `one-v6415-territory-ops.js` | Mantener progreso, asignaciones, misiones y guardias de Smart Route. |
| Tramos | `one-v6413-corridor.js` + `one-v6413-corridor-reports.js` | No mezclar Tramos con captura normal. |
| Reglas de campo y migraciones aún vigentes | `one-v646-core.js` | Deuda temporal: separar funciones puras de los wrappers UI en una fase posterior. |
| Sanitización semántica aún vigente | `one-v647-core.js` | Deuda temporal: extraer normalización a módulo de dominio y retirar wrappers. |
| Municipalidad / destino territorial | `one-v6411-municipal.js` | Deuda temporal: aún depende de estructuras heredadas de `one-v63-core.js`; debe desacoplarse antes de retirar ese core. |
| Orientación específica posterior | `one-v6411-orientation.js` | Mantener separada de la lógica de clasificación. |

## Módulos históricos que NO deben estar activos

A partir de v6.5.0 Phase 1, estos archivos son históricos/supersedidos y no deben aparecer en `DYNAMIC`:

- `one-v631-core.js`
- `one-v643-core.js`
- `one-v644-core.js`
- `one-v646-fer.js`
- `one-v647-fer.js`
- `one-v647-logos.js`
- `one-v648-guided.js`
- `one-v648-logo-source.js`
- `one-v649-fer-session.js`
- `one-v649-logos.js`
- `one-v6411-logos.js`
- `one-v6412-fer-visual.js`
- `one-v6412-fer-voice.js`
- `one-v6412-party-logos.js`
- `one-v6412-guided-ux.js`
- `one-v6416-edit-flow.js`
- `one-v6417-panel-provider.js`
- `one-v6417-provider-event-guard.js`

GitHub Actions y `APK/scripts/oneshot-health-check.js` deben fallar si alguno vuelve al runtime activo.

## Carga del runtime

`service-worker.js` mantiene dos grupos:

- `DYNAMIC`: código requerido para la aplicación operativa.
- `LAZY`: recursos pesados opcionales que se solicitan bajo demanda.

Los archivos `LAZY` **no deben** formar parte de `ASSETS` del evento `install`. Para Android sí deben copiarse a `www/`, porque deben estar disponibles localmente cuando el editor los solicite.

El Service Worker puede cachear el runtime, pero a mediano plazo no debe ser quien ensamble/inyecte la aplicación. Esa responsabilidad debe pasar a un cargador/bundle explícito y determinístico.

## Deuda técnica priorizada

### Fase 2 · Fuente canónica

- Actualizar `app.js` para que deje de declarar v6.0.3.
- Eliminar el `UPDATE_FEED_URL` al repositorio antiguo `evidencia-calle-pro`.
- Hacer que Fer sea la identidad nativa de la fuente, no una corrección posterior de `ONE`.
- Actualizar título y textos heredados de `index.html`.
- Evitar que bootstrap exista para corregir metadatos que deberían nacer bien desde la fuente.

### Fase 3 · Un solo arranque

- Eliminar la diferencia entre primera visita y página controlada por Service Worker.
- Crear un manifest/cargador de runtime explícito o un bundle de build.
- El Service Worker queda limitado a caché/offline/update, no a concatenar JavaScript para ejecutarlo.

### Fase 4 · Módulos de dominio sin monkey-patching

- Extraer reglas de campo de `one-v646-core.js` a funciones puras.
- Extraer sanitización de `one-v647-core.js` a un normalizador único.
- Desacoplar `one-v6411-municipal.js` de `one-v63-core.js` y retirar finalmente `one-v63-core.js`.
- Evitar reemplazos de métodos como `Editor.open`, `Editor.persist`, `GuidedEditor.render` y `Reports.makeExcel` desde múltiples archivos.

### Fase 5 · Build y dependencias

- Empaquetar localmente ExcelJS, Leaflet y demás dependencias críticas para trabajo de campo offline.
- Evaluar OCR como recurso opcional/lazy, sin bloquear la app.
- Dejar de versionar `www/` como fuente; generarlo en CI/Android.
- Mover `v2/` a un archivo histórico claramente separado.
- Dividir gradualmente `app.js`, `styles.css` e `index.html` por dominio, sin reescritura total ni pérdida de datos.

## Criterio para retirar un módulo

Antes de quitar un módulo de `DYNAMIC`:

1. Identificar qué métodos/DOM/data modifica.
2. Confirmar que otro propietario activo cubre esas responsabilidades.
3. Añadir una guardia de CI que impida reactivarlo accidentalmente.
4. Ejecutar `health:check` y el dry-run de `prepare-webdir`.
5. Validar que no cambia IndexedDB ni elimina/migra fotografías de forma destructiva.
6. Hacer el cambio en rama y revisar el diff antes de fusionar.

Esta política permite limpiar ONE SHOT por fases sin convertir cada corrección en otro parche permanente.
