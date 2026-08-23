# ONE SHOT · Arquitectura y reglas de evolución

## Regla principal

Un comportamiento operativo debe tener **un solo propietario activo**. Los archivos históricos pueden permanecer para trazabilidad, pero no vuelven a `DYNAMIC` si fueron reemplazados.

## Propietarios activos desde v6.5.3

| Responsabilidad | Propietario |
| --- | --- |
| Versión / actualización | `version.json` + `one-bootstrap-v643.js` |
| Assets políticos y Fer | `one-v651-assets.js` + `assets/parties/` + `assets/fer/` |
| Imagen visible de evidencia | `EvidenceMedia` en `one-v651-domain.js` |
| Estado de revisión y filtros | `ReviewState` en `one-v651-domain.js` |
| Alcance de Reportes / Excel | `ReportScope` en `one-v651-domain.js` |
| Editar con Fer + voz half-duplex | `one-v651-edit-core.js` (implementación v6.5.3) |
| Visor y composición móvil de Editar | `one-v653-mobile-ux.js` |
| UI asistida de Reportes | `one-v651-reports-ui.js` |
| Identidad visual global de Fer / Historial | `one-v651-fer-shell.js` |
| Fuente municipal | `data/source/DIRECTORIO.xlsx`; `municipal-data-v630-*` transporta filas temporalmente |
| Resolver / confirmar municipalidad | `one-v651-municipal.js` |
| Excel canónico de propaganda | `one-v646-reports.js` |
| Hallazgos separados / GeoJSON Operaciones | `one-v653-field-findings.js` |
| Persistencia durable de fotos | `one-v6416-evidence-recovery.js` |
| Compatibilidad de fotos históricas | `one-v6416-media-legacy-bridge.js` |
| Base de evidencias | `oneshotEvidenceDB_v2` |
| Territorio / asignaciones | `one-v6415-territory-ops.js` |
| Recorrido de tramo GPS | `one-v6413-corridor.js` |
| Reportes de tramo existentes | `one-v6413-corridor-reports.js` |
| Sincronización de medios Dropbox | `one-dropbox-sync.js` + `functions/api/dropbox/*` |
| Versionado editorial no destructivo | `one-phase2-edit-center.js` + `functions/api/dropbox/version.js` |
| Actividad política foto/video | `one-v660-political-activity.js` + `functions/api/dropbox/activity-upload.js` |

## Reglas de interacción v6.5.3

- Editar mantiene una sola sesión STT/TTS por evidencia.
- Cada apertura genera `sessionId`; cada intervención hablada genera `turnId`.
- TTS y STT son **half-duplex**: nunca deben coexistir.
- Cuando Fer termina de hablar, espera aproximadamente un segundo antes de abrir STT.
- Las frases habladas por Fer se conservan durante 8 segundos para descartar eco por similitud.
- Cerrar Editar, ocultar la página o cambiar evidencia cancela TTS, aborta STT y limpia timers.
- Clic y voz entran al mismo dispatcher. `Session.busy` evita dobles ejecuciones.
- El flujo es determinístico: `party → type → provider (solo PANEL) → summary`.
- Una respuesta válida sigue: modificar record → `Store.save(record)` → confirmar éxito → cambiar de paso.
- Si `Store.save()` falla, el paso no cambia y se restaura el estado previo en memoria.
- `Guardar y siguiente` calcula la siguiente evidencia antes de finalizar la actual.
- En `summary` no coexisten acciones finales con navegación legacy.
- Los 42 proveedores viven en un único catálogo dentro del dueño de Editar; se almacenan nombres canónicos y se aceptan alias de voz.

## UX móvil v6.5.3

- Viewer se mantiene dentro de `100dvh`/`visualViewport` y bloquea scroll documental mientras está abierto.
- La foto del Viewer usa `object-fit: contain`; no se corta ni se deforma.
- La foto de Editar se muestra compacta por defecto y puede expandirse explícitamente.
- Fer no flota encima de la fotografía dentro de Editar; existe una sola tarjeta de conversación.
- Mapa / GPS / Dirección / Guardar permanecen en el lugar aprendido, con espacio reservado para no cubrir respuestas.
- El teclado móvil actualiza la variable de altura desde `visualViewport` sin modificar Cámara.

## Reglas municipales

- Prioridad 1: UBIGEO exacto.
- Prioridad 2: Departamento + Provincia + Distrito exactos.
- Si falta Distrito: `MISSING_DISTRICT`; no se muestra ninguna municipalidad sugerida.
- Si hay ambigüedad: máximo 3 candidatos dentro de Departamento + Provincia, con **coincidencia estimada**. No se presenta como probabilidad oficial.
- Match exacto es una propuesta hasta que el usuario pulsa `Confirmar destino`.
- El modo manual es dependiente: Departamento → Provincia → Distrito. Nunca lista todo el directorio nacional.
- `captureAddress` y `municipalAddress` son conceptos distintos y nunca se reemplazan entre sí.

## Hallazgos especiales y futuro Operaciones

Los tres tipos canónicos de propaganda continúan siendo:

- `PANEL`
- `BANNER`
- `PINTA`

Los casos nuevos se modelan con `findingSubtype`, sin romper Excel histórico:

- `PANCARTA_EN_POSTE`
- `PROPAGANDA_REPETITIVA`
- `LOCAL_PARTIDARIO`

`one-v653-field-findings.js` añade:

- Excel separado **Solo locales partidarios**; no modifica el Excel canónico de propaganda.
- Tramo `TRACKED`: reutiliza el recorrido GPS existente de `PropagandaCorridor` y lo marca como hallazgo lineal.
- Tramo `DRAWN`: usuario marca inicio/fin sobre mapa; se guarda distancia, cantidad aproximada, observación y foto muestra.
- GeoJSON interoperable para preparar ONE SHOT Operaciones.

Entidades GeoJSON preparadas:

- `evidence`
- `political_location`
- `propaganda_corridor`
- `route_coverage`
- `field_sector`
- `team_assignment`

**No existe todavía `/operaciones/` en v6.5.3.** Esa interfaz será una fase independiente y consumirá este contrato de datos.

## Fase 2 · Contrato de medios y edición

Cada evidencia puede conservar varias representaciones sin destruir la fuente:

- `ORIGINAL`: captura o mejor fuente histórica disponible; nunca se sobrescribe por una edición.
- `STAMPED`: versión con marca/sello de evidencia.
- `CORRECTED`: versión derivada por edición en ONE SHOT 2.

`mediaVersions[]` registra la secuencia y `currentImagePath` señala la versión vigente en nube. Dropbox conserva los binarios y `metadata.json` conserva trazabilidad. Las correcciones se guardan en `/correcciones/<timestamp>.<ext>`.

Una evidencia importada desde Dropbox debe decodificar como imagen antes de entrar a IndexedDB. Si la original no es utilizable pero existe una marcada válida, se conserva como `ONLY_MARKED` y se declara `originalMediaUnavailable=true`.

## ONE SHOT v6.6 · Field Foundation

### Camera-first

- La cámara está disponible siempre. Una misión, zona, sector o recorrido **nunca bloquea una captura libre**.
- `captureMode` distingue `LIBRE`, `MISION` y `RECORRIDO` sin cambiar la validez de la evidencia.
- Una captura libre aporta evidencia, pero **no demuestra cobertura territorial**.
- La cobertura solo nace de un recorrido/sector explícitamente iniciado.
- Si existe una zona asignada, Operaciones podrá advertir por proximidad y ofrecer `Iniciar recorrido`; la aceptación del usuario inicia el tracking.
- Voz automática y STT quedan temporalmente en pausa para priorizar captura táctil estable. La edición manual de giro/marco y clasificación permanece activa.

### Evidencia física vs actividad política

`evidence` continúa reservado para propaganda física y hallazgos territoriales. `political_activity` es una entidad distinta para hechos observados con componente temporal/móvil.

Tipos iniciales de `PoliticalActivityV1`:

- `ACTIVACION_ORQUESTA`
- `MITIN_REUNION`
- `MARCHA`
- `CARAVANA`
- `ENTREGA_REGALOS`
- `VENTA_ENTREGA_MATERIAL`
- `VOLANTEO`
- `PUERTA_A_PUERTA`
- `BANDERAZO`
- `OTRA_ACTIVIDAD`

Cada actividad conserva: organización, fecha/hora, GPS y precisión, dirección, departamento/provincia/distrito, proceso, foto o video original, observación, identidad de equipo/dispositivo, misión/recorrido opcional y estado de revisión.

El teléfono **solo registra lo observado**. No declara por sí mismo infracciones ni conclusiones normativas; esas decisiones pertenecen al segundo filtro de ONE SHOT Operaciones.

Las actividades usan `oneshotPoliticalActivityDB_v1` para persistencia local separada y Dropbox `/actividades/YYYY/MM/<codigo>/` para su media y `metadata.json`. Video operativo inicial: máximo 90 s y 80 MB.

### Contrato rumbo a Operaciones

ONE SHOT Operaciones manejará como mínimo entidades separadas:

- `evidence`: PANEL/BANNER/PINTA y evidencia puntual.
- `political_location`: local partidario u otro lugar persistente.
- `propaganda_corridor`: tramo repetitivo/postes.
- `political_activity`: activación, marcha, mitin, caravana, entrega observada, etc.
- `route_coverage`: por dónde sí inspeccionó el equipo.
- `field_sector`: zona solicitada/asignada.
- `municipal_case`: agrupación para carta, respuesta y seguimiento.

Dropbox conserva binarios; D1 será el índice consultable. Dashboard y Excel deberán leer el mismo contrato de datos en vez de mantener estructuras paralelas.

## Fuentes canónicas

- **75 organizaciones:** `ONE_PARTY_CATALOG_V6410` + rutas de `one-v651-assets.js`.
- **Logos:** archivos individuales en `assets/parties/`; no sprites/base64.
- **Fer:** seis poses WebP de `assets/fer/`; no personaje reconstruido por CSS.
- **Municipalidades:** `data/source/DIRECTORIO.xlsx` es fuente de verdad.
- **Fotos:** nunca borrar ni reescribir el original. `EvidenceMedia` decide qué derivada mostrar.

## Módulos retirados del runtime

Se mantienen fuera de `DYNAMIC`:

- `one-ux-v611.js`: segundo motor global de TTS y ayuda de historial con robot antiguo.
- `one-v63-core.js`: antiguo propietario de GuidedEditor, filtros y combobox municipal nacional.
- `one-v645-core.js`: pintor de logos por sprite + observadores de UI históricos.
- `fer-v640.js` y `one-reports-v61.js`: propietarios visuales/reportes históricos ya reemplazados.

CI falla si vuelven al runtime.

## Compatibilidad temporal conocida

- `one-v646-core.js` permanece por reglas históricas de saneamiento/ruta; no es propietario de Editar ni Municipalidad.
- `one-v647-core.js` permanece por saneamiento semántico; debe extraerse gradualmente a funciones puras.
- `municipal-data-v630-*` permanece como transporte de las 1,892 filas hasta generar un artefacto compacto desde `DIRECTORIO.xlsx`.
- `app.js` aún declara versión/identidad/updater históricos. Corresponde a **Phase 2 · Fuente canónica**.
- El Service Worker todavía ensambla el runtime. Phase 3 lo dejará solo como caché/offline/update.

## Regla de datos

No cambiar nombre/esquema de `oneshotEvidenceDB_v2` sin migración explícita, pruebas de recuperación y compatibilidad con `Fotos anteriores`.
