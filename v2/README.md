# ONE SHOT 2 · Stability Core

Nueva base paralela y limpia de ONE SHOT.

## Objetivo del Sprint 1

- No modificar ni reiniciar `oneshotEvidenceDB_v2`.
- Leer las evidencias existentes de ONE SHOT.
- Eliminar la arquitectura de parches/inyección del Service Worker para OS2.
- Unificar el flujo principal en Cámara → Evidencias → Territorio → Reportes.
- Mantener Cámara limpia: Fer no aparece sobre el encuadre.
- Fer funciona como asistente contextual flotante y panel conversacional.
- Solo PANEL, MURAL y BANNER son tipos válidos; el resto queda PENDIENTE.
- Eliminar residuos (`31`, `undefined`, `null`, `N/A`) solo de campos textuales, nunca de valores técnicos numéricos.
- Excel canónico: Provincia correctamente nombrada y Alcalde/encargado nunca proviene del candidato.

## Entrada

Abrir `/v2/` dentro del mismo despliegue de ONE SHOT.

## Compatibilidad de datos

OS2 usa la misma base IndexedDB `oneshotEvidenceDB_v2`, store `records`. Las capturas nuevas conservan campos compatibles (`id`, `photoCode`, `image`, `stampedImage`, fecha/hora, GPS, clasificación y metadatos técnicos).

## Pruebas mínimas

1. Splash OS2 y entrada a Cámara.
2. Permiso Cámara/GPS y captura.
3. Ver la captura en Evidencias.
4. Editar Partido + Tipo y guardar.
5. Comprobar persistencia cerrando/reabriendo.
6. Abrir Territorio y validar que solo cuenta evidencias reales.
7. Generar Excel y revisar EVIDENCIAS, DATOS_TECNICOS y METADATOS.
8. Comprobar que las evidencias antiguas siguen visibles.
9. Abrir Fer y usar “qué sigue”, “pendientes”, “Excel” y “GPS”.
10. Instalar como PWA y repetir captura/edición.
