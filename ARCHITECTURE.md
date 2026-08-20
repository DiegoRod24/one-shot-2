# ONE SHOT · Arquitectura y reglas de evolución

## Regla principal

Un comportamiento operativo debe tener **un solo propietario activo**. Los archivos históricos pueden permanecer para trazabilidad, pero no vuelven a `DYNAMIC` si fueron reemplazados.

## Propietarios activos desde v6.5.2

| Responsabilidad | Propietario |
| --- | --- |
| Versión / actualización | `version.json` + `one-bootstrap-v643.js` |
| Assets políticos y Fer | `one-v651-assets.js` + `assets/parties/` + `assets/fer/` |
| Imagen visible de evidencia | `EvidenceMedia` en `one-v651-domain.js` |
| Estado de revisión y filtros | `ReviewState` en `one-v651-domain.js` |
| Alcance de Reportes / Excel | `ReportScope` en `one-v651-domain.js` |
| Editar con Fer + voz | `one-v651-edit-core.js` (implementación v6.5.2) |
| UI asistida de Reportes | `one-v651-reports-ui.js` |
| Identidad visual global de Fer / Historial | `one-v651-fer-shell.js` |
| Fuente municipal | `data/source/DIRECTORIO.xlsx`; `municipal-data-v630-*` transporta filas temporalmente |
| Resolver / confirmar municipalidad | `one-v651-municipal.js` (implementación v6.5.2) |
| Excel canónico | `one-v646-reports.js` |
| Persistencia durable de fotos | `one-v6416-evidence-recovery.js` |
| Compatibilidad de fotos históricas | `one-v6416-media-legacy-bridge.js` |
| Base de evidencias | `oneshotEvidenceDB_v2` |
| Territorio | `one-v6415-territory-ops.js` |
| Tramos | `one-v6413-corridor.js` + `one-v6413-corridor-reports.js` |

## Reglas de interacción v6.5.2

- Editar mantiene **una sola sesión STT/TTS**. Cada apertura genera un `sessionId`; callbacks de una sesión anterior quedan inválidos.
- Cerrar Editar, ocultar la página o cambiar la evidencia cancela TTS, aborta STT y limpia timers.
- Clic y voz entran al mismo dispatcher. `commandInFlight`/`Session.busy` evita dobles ejecuciones.
- El flujo es determinístico: `party → type → provider (solo PANEL) → summary`.
- Una respuesta válida se persiste antes de avanzar.
- `Guardar y siguiente` calcula la siguiente evidencia antes de finalizar la actual; no usa la cola legacy del antiguo `GuidedEditor.saveNext()`.
- En `summary` no aparecen simultáneamente `Guardar/Guardar y siguiente/Corregir` y `Atrás/Saltar/Siguiente`.

## Reglas municipales v6.5.2

- Prioridad 1: UBIGEO exacto.
- Prioridad 2: Departamento + Provincia + Distrito exactos.
- Si falta Distrito: `MISSING_DISTRICT`; no se muestra ninguna municipalidad sugerida.
- Si hay ambigüedad: máximo 3 candidatos dentro de Departamento + Provincia, con **coincidencia estimada**. No se presenta como probabilidad oficial.
- Match exacto es una propuesta hasta que el usuario pulsa `Confirmar destino`.
- El modo manual es dependiente: Departamento → Provincia → Distrito. Nunca lista todo el directorio nacional.
- `captureAddress` y `municipalAddress` son conceptos distintos y nunca se reemplazan entre sí.

## Fuentes canónicas

- **75 organizaciones:** `ONE_PARTY_CATALOG_V6410` + rutas de `one-v651-assets.js`.
- **Logos:** archivos individuales en `assets/parties/`; no sprites/base64.
- **Fer:** seis poses WebP de `assets/fer/`; no personaje reconstruido por CSS.
- **Municipalidades:** `data/source/DIRECTORIO.xlsx` es fuente de verdad.
- **Fotos:** nunca borrar ni reescribir el original. `EvidenceMedia` decide qué derivada mostrar.

## Módulos retirados del runtime

Además de retiros anteriores, v6.5.2 elimina de `DYNAMIC`:

- `one-ux-v611.js`: segundo motor global de TTS y ayuda de historial con robot antiguo.
- `one-v63-core.js`: antiguo propietario de GuidedEditor, filtros y combobox municipal nacional.
- `one-v645-core.js`: pintor de logos por sprite + observadores de UI históricos.

Los filtros útiles, la tarjeta municipal y la ayuda de Historial fueron absorbidos por sus propietarios actuales. CI falla si estos módulos vuelven a `DYNAMIC`.

## Compatibilidad temporal conocida

- `one-v646-core.js` permanece por reglas históricas de saneamiento/ruta; **no es propietario** de Editar ni Municipalidad. Los dueños 6.5.2 exponen la decisión final.
- `one-v647-core.js` permanece por saneamiento semántico; debe extraerse gradualmente a funciones puras.
- `municipal-data-v630-*` permanece como transporte de las 1,892 filas hasta generar un artefacto compacto desde `DIRECTORIO.xlsx`.
- `app.js` aún declara versión/identidad/updater históricos. Corresponde a **Phase 2 · Fuente canónica**.
- El Service Worker todavía ensambla el runtime. Phase 3 lo dejará solo como caché/offline/update.

## Regla de datos

No cambiar nombre/esquema de `oneshotEvidenceDB_v2` sin migración explícita, pruebas de recuperación y compatibilidad con `Fotos anteriores`.
