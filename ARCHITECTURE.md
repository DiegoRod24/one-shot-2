# ONE SHOT · Arquitectura activa

Un comportamiento operativo debe tener **un solo propietario activo**. Los archivos históricos pueden permanecer para trazabilidad, pero no vuelven al runtime si fueron reemplazados.

## Propietarios activos desde v6.5.3

| Responsabilidad | Propietario |
| --- | --- |
| Imagen visible de evidencia | `EvidenceMedia` en `one-v651-domain.js` |
| Estado de revisión y filtros | `ReviewState` en `one-v651-domain.js` |
| Alcance de Reportes / Excel | `ReportScope` en `one-v651-domain.js` |
| Editar con Fer + voz half-duplex | `one-v651-edit-core.js` |
| Visor y composición móvil de Editar | `one-v653-mobile-ux.js` |
| UI asistida de Reportes | `one-v651-reports-ui.js` |
| Identidad visual global de Fer / Historial | `one-v651-fer-shell.js` |
| Resolver / confirmar municipalidad | `one-v651-municipal.js` |
| Excel canónico de propaganda | `one-v646-reports.js` |
| Hallazgos separados / GeoJSON Operaciones | `one-v653-field-findings.js` |
| Persistencia durable de fotos | `one-v6416-evidence-recovery.js` |
| Compatibilidad de fotos históricas | `one-v6416-media-legacy-bridge.js` |
| Base local de evidencias | `oneshotEvidenceDB_v2` |
| Sincronización de originales Dropbox | `one-dropbox-sync.js` + `functions/api/dropbox/*` |
| Versionado editorial no destructivo | `one-phase2-edit-center.js` + `functions/api/dropbox/version.js` |
| Territorio / asignaciones | `one-v6415-territory-ops.js` |
| Recorrido de tramo GPS | `one-v6413-corridor.js` |
| Reportes de tramo existentes | `one-v6413-corridor-reports.js` |

## Contrato de medios Fase 2

Cada evidencia puede conservar varias representaciones sin destruir la fuente:

- `ORIGINAL`: captura o mejor fuente histórica disponible; nunca se sobrescribe por una edición.
- `STAMPED`: versión con marca/sello de evidencia.
- `CORRECTED`: versión derivada por edición en ONE SHOT 2.

`mediaVersions[]` registra la secuencia y `currentImagePath` señala la versión vigente en nube. Dropbox conserva los binarios y `metadata.json` conserva trazabilidad. La corrección se guarda en `/correcciones/<timestamp>.<ext>`.

Una evidencia importada desde Dropbox debe decodificar como imagen antes de entrar a IndexedDB. Si original no es utilizable pero existe una marcada válida, se conserva como `ONLY_MARKED` y se declara `originalMediaUnavailable=true`.

## Reglas de interacción v6.5.3

- Editar mantiene una sola sesión STT/TTS por evidencia.
- TTS y STT son half-duplex.
- Cerrar Editar, ocultar página o cambiar evidencia cancela voz y timers.
- Una respuesta válida persiste antes de avanzar.
- Guardar y siguiente calcula la siguiente evidencia antes de finalizar la actual.
- Los proveedores de panel se almacenan con nombres canónicos.

## UX móvil

- Viewer usa `100dvh`/`visualViewport` y `object-fit: contain`.
- Editar mantiene fotografía compacta y puede expandirse.
- Fer no flota encima de la fotografía.
- Mapa / GPS / Dirección / Guardar conservan posición estable.

## Reglas municipales

- Prioridad 1: UBIGEO exacto.
- Prioridad 2: Departamento + Provincia + Distrito exactos.
- `captureAddress` y `municipalAddress` son conceptos distintos.

## Hallazgos y futuro Operaciones

Tipos canónicos de propaganda:

- `PANEL`
- `BANNER`
- `PINTA`

Subtipos / hallazgos:

- `PANCARTA_EN_POSTE`
- `PROPAGANDA_REPETITIVA`
- `LOCAL_PARTIDARIO`

Entidades GeoJSON preparadas:

- `evidence`
- `political_location`
- `propaganda_corridor`
- `route_coverage`
- `field_sector`
- `team_assignment`

La interfaz nacional `/operaciones/` será una fase separada y consumirá un índice geográfico central; Dropbox queda como almacén de medios, no como motor de consulta geográfica.
