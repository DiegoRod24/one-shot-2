# ONE SHOT · Arquitectura y reglas de evolución

## Regla principal

Un comportamiento operativo debe tener **un solo propietario activo**. Los archivos históricos pueden permanecer para trazabilidad, pero no vuelven a `DYNAMIC` si fueron reemplazados.

## Propietarios activos desde v6.5.1

| Responsabilidad | Propietario |
| --- | --- |
| Versión / actualización | `version.json` + `one-bootstrap-v643.js` |
| Assets políticos y Fer | `one-v651-assets.js` + archivos `assets/parties/` y `assets/fer/` |
| Imagen visible de evidencia | `EvidenceMedia` en `one-v651-domain.js` |
| Estado de revisión | `ReviewState` en `one-v651-domain.js` |
| Alcance de reportes / Excel | `ReportScope` en `one-v651-domain.js` |
| Editar con Fer | `one-v651-edit-core.js` |
| UI asistida de Reportes | `one-v651-reports-ui.js` |
| Identidad visual global de Fer | `one-v651-fer-shell.js` |
| Fuente municipal | `data/source/DIRECTORIO.xlsx`; los `municipal-data-v630-*` quedan temporalmente como transporte de filas, sin lógica de decisión |
| Resolver / confirmar municipalidad | `one-v651-municipal.js` |
| Excel canónico | `one-v646-reports.js` |
| Persistencia durable de fotos | `one-v6416-evidence-recovery.js` |
| Compatibilidad de fotos históricas | `one-v6416-media-legacy-bridge.js` |
| Base de evidencias | `oneshotEvidenceDB_v2` |
| Territorio | `one-v6415-territory-ops.js` |
| Tramos | `one-v6413-corridor.js` + `one-v6413-corridor-reports.js` |

## Fuentes canónicas

- **75 organizaciones:** catálogo `ONE_PARTY_CATALOG_V6410` + ruta real declarada por `one-v651-assets.js`.
- **Fer:** seis poses WebP de `assets/fer/`. No sprites ni personaje reconstruido por CSS.
- **Municipalidades:** `data/source/DIRECTORIO.xlsx` es la fuente de verdad. Los fragmentos `municipal-data-v630-*` solo transportan filas en el navegador; `one-v651-municipal.js` es el único resolver.
- **Fotos:** nunca borrar ni reescribir el original. `EvidenceMedia` decide qué derivada se muestra.

## Módulos retirados del runtime en v6.5.1

Además de los retirados en 6.5.0, ya no deben estar activos:

- `fer-v640.js` (Fer CSS + MutationObserver global)
- `one-reports-v61.js`
- `party-catalog-v631.js`
- `one-v6411-municipal.js`
- `one-v6418-edit-core.js`
- todos los `one_party_sprite-asset-v6412-*`
- todos los `one_fer_sprite-asset-v6412-*`
- `one-v6412-party-assets.js`
- `one-v6412-fer-assets.js`

CI falla si regresan a `DYNAMIC`.

## Deuda temporal conocida

- `one-v63-core.js` se mantiene **solo como shell UI heredado** para filtros/tarjeta municipal; la resolución municipal ya no le pertenece.
- `municipal-data-v630-*` se mantiene temporalmente como transporte de filas. No decide matches y se retirará cuando el build genere un artefacto compacto desde `DIRECTORIO.xlsx`.
- `one-v646-core.js` y `one-v647-core.js` conservan reglas históricas que deben extraerse gradualmente a funciones puras.
- `app.js` aún declara versión/identidad/updater históricos. Corresponde a **Phase 2 · Fuente canónica**, sin mezclarlo con este sprint.
- El Service Worker todavía ensambla el runtime; Phase 3 lo dejará solo como caché/offline/update.

## Regla de datos

`captureAddress` es la dirección donde se fotografió la propaganda. `municipalAddress` es la sede municipal. Nunca se sustituyen entre sí.

No cambiar el nombre/esquema de `oneshotEvidenceDB_v2` sin migración explícita, pruebas de recuperación y compatibilidad con `Fotos anteriores`.
