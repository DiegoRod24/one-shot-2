# ONE SHOT · Estado funcional y próximos pasos

Actualizado: 2026-08-23

## Objetivo del producto

ONE SHOT Campo debe permitir recolectar evidencia política en calle con la menor fricción posible. ONE SHOT Operaciones/Dashboard debe recibir, revisar, mapear, asignar trabajo, consolidar y exportar esa información.

## ONE SHOT Campo · móvil

| Módulo | Estado | Qué hace hoy | Falta validar / mejorar |
|---|---|---|---|
| Cámara trasera rápida | 🧪 En prueba | Prioriza cámara trasera, arranque camera-first | Medir tiempos Android/iPhone y seguir reduciendo bloqueos |
| Hora / GPS / dirección | 🧪 En prueba | Hora local inmediata; GPS y dirección en segundo plano | Mejorar precisión inicial y mensajes cuando GPS demora |
| Evidencias | 🧪 En prueba | Lista, filtros, ver, editar, mapa, seleccionar | Terminar pulido visual y acciones de selección |
| Clasificación individual | ✅ Funcional | Partido + PANEL/BANNER/PINTA; empresa solo PANEL | Validación final en varios teléfonos |
| Clasificación por lote | ✅ Funcional | Seleccionar varias → clasificar → guardar y siguiente | Pulir repetir anterior y salida final |
| Editor / marco | 🧪 En prueba | Foto visible, zoom inspección, giro/marco no destructivo | Validar estabilidad de todos los controles en Android/iPhone |
| Local partidario | 🧪 En prueba | Registra la evidencia como POLITICAL_LOCATION con GPS | Probar historial y deduplicación de un mismo local |
| Tramo carteles/postes | 🧪 v6.6.17 | A→B, recorrido GPS, postes y carteles separados, fotos muestra | Prueba real en avenida y ajuste de UX |
| Recorrido / cobertura | 🧪 Base disponible | Registra por dónde pasó el verificador aunque no haya hallazgos | Simplificar continuidad, pausa y cierre para campo |
| Zona asignada | 🟡 Parcial | Existe planificación/sector avanzado | Conectar con Dashboard: publicar zona, aceptar/continuar, progreso |
| Actividad política foto/video | 🟡 Parcial | Entidad y backend de actividad política ya existen | Crear/terminar UI móvil simple y validar video real |
| Historial cercano | ✅ Configurable | Puede alertar evidencia previa o quedar OFF | Validación final de preferencia persistente |
| Sincronización | ✅ Funcional | Dropbox central; Persona/alias opcional; acepta PENDIENTE | Validar lotes grandes y reintentos/red inestable |
| Excel de campo | ✅ Funcional | Reporte XLSX con fotos, GPS y hojas especializadas | Mantener compatibilidad mientras nace Dashboard |
| Fer / voz / OCR | ⏸ OFF | Oculto para no interferir | Retomar solo cuando esté estable y realmente aporte |
| Actualizador PWA | 🧪 En prueba | Busca/instala versión y conserva evidencias | Seguir validando transición y confirmación de última versión |
| Android | 🧪 En prueba real | PWA instalada y flujo activo | Estabilidad/rendimiento en equipos distintos |
| iPhone / iOS | ⏳ Pendiente | Diseño contemplado | Pruebas reales de cámara, PWA, GPS y video |

## Entidades de campo

1. **EVIDENCE** · Foto individual: PANEL / BANNER / PINTA.
2. **POLITICAL_LOCATION** · Local partidario con historial de visitas.
3. **PROPAGANDA_CORRIDOR** · Tramo repetitivo A→B con recorrido, conteo y fotos muestra.
4. **POLITICAL_ACTIVITY** · Actividad política con foto/video.
5. **FIELD_ROUTE** · Recorrido de inspección, incluso sin hallazgos.
6. **WORK_ZONE / FIELD_SECTOR** · Zona que coordinación desea revisar.

## Excel operativo

Mientras el Dashboard no sustituya el flujo actual, Excel sigue siendo una salida principal. Debe poder consolidar y separar al menos:

- Evidencias generales
- Paneles
- Banners
- Pintas
- Locales partidarios
- Tramos de propaganda
- Evidencias asociadas a cada tramo
- Actividades políticas
- Recorridos / cobertura
- Ubicación territorial y enlaces de mapa

## ONE SHOT Operaciones · Dashboard Admin

| Módulo | Estado | Próximo paso |
|---|---|---|
| Dropbox media backend | ✅ Base lista | Mantener originales/versiones y enlazar a metadatos |
| Índice geográfico D1 | 🟡 Preparado en PR #13 | Actualizar rama contra main, crear/bindear GEO_DB y probar schema |
| Dashboard web | ⏳ Pendiente | Crear shell Admin y navegación principal |
| Login / roles | ⏳ Pendiente | Admin, Coordinador, Revisor; no complicar login del móvil |
| Bandeja de revisión | ⏳ Pendiente | PENDIENTE → VALIDADA / OBSERVADA / DESCARTADA |
| Mapa nacional Perú | ⏳ Pendiente | Capas por evidencia/local/tramo/actividad/recorrido/zona |
| Importar Excel histórico + fotos | ⏳ Pendiente | Levantar el mapa con todo lo ya trabajado |
| Municipalidad probable | 🟡 Base territorial disponible | Resolver/sugerir y permitir confirmación del Admin |
| Cartas a municipalidades | ⏳ Pendiente | Asociar evidencias, fecha, número de carta y destino |
| Respuestas / subsanación | ⏳ Pendiente | Permanece / modificada / retirada / subsanada |
| Sectores / asignaciones | ⏳ Pendiente | Dibujar zona, asignar o dejar abierta al equipo |
| Continuar recorrido | ⏳ Pendiente | Ver cobertura anterior y continuar sin repetir calles |
| Usuarios de apoyo | ⏳ Pendiente | Revisor secundario con permisos limitados |
| Exportes Admin | ⏳ Pendiente | Excel filtrado por fecha, partido, tipo, territorio, municipio, estado |
| Métricas / tablero | ⏳ Pendiente | Cobertura, hallazgos, partidos, municipios, pendientes y subsanación |

## Orden de trabajo recomendado

1. Terminar y validar **Tramo carteles/postes**.
2. Simplificar **Recorrido/Cobertura** para uso real de campo.
3. Cerrar **Actividad política foto/video**.
4. Validar **Excel completo** de todas las entidades.
5. Congelar el alcance de **ONE SHOT Campo 1.0**.
6. Rebasar/actualizar la base D1 de Fase 3 contra `main`.
7. Construir **Dashboard Admin**: login/roles → bandeja de revisión → mapa nacional.
8. Importar históricos.
9. Sectores/asignaciones/continuidad de recorridos.
10. Municipalidades → cartas → respuestas → subsanación.

## Regla de arquitectura

- El móvil **captura y registra**.
- El Dashboard **administra y revisa**.
- Dropbox conserva medios.
- D1/índice central conserva metadatos y relaciones.
- Excel continúa disponible durante toda la transición.
- Nunca sobrescribir destructivamente el original de una evidencia.
