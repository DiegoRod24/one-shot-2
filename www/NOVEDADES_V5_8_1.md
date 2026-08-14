# ONE SHOT 5.8.1 · HOTFIX CAMERA SAFE MERGE

## Objetivo
Recuperar la estabilidad de captura sin perder ONE Assistant, OCR ni clasificación asistida.

## Corrección principal
- La cámara frontal deja de usar `ImageCapture.takePhoto()` y toma el frame desde el mismo `<video>` que ve el usuario.
- Evita el caso Android donde el JPEG frontal llega con píxeles girados aunque sus dimensiones/EXIF parezcan correctos.
- La cámara trasera mantiene su pipeline estable con ImageCapture/fallback.
- Ya no se aplica una corrección 180° indiscriminada al selfie cuando se usa el pipeline preview-safe.

## Datos
- No cambia la base IndexedDB: `oneshotEvidenceDB_v2`.
- No borra evidencias, lugares, historial ni configuración.
- ONE Assistant, OCR, importación del Excel de referencia y exportación compatible siguen disponibles.

## Prioridad
Evidencia correcta > automatización. Las sugerencias del asistente nunca deben modificar el bitmap capturado.
