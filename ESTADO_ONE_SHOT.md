# ONE SHOT · Estado funcional y próximos pasos

Actualizado: 2026-08-24

## Objetivo del producto

ONE SHOT Campo debe permitir recolectar evidencia política en calle con la menor fricción posible. ONE SHOT Operaciones/Dashboard debe recibir, revisar, mapear, asignar trabajo, consolidar y exportar esa información.

## ONE SHOT Campo · móvil

| Módulo | Estado | Qué hace hoy | Falta validar / mejorar |
|---|---|---|---|
| Cámara trasera rápida | 🧪 v6.6.19 | Prioriza cámara trasera y muestra progreso visible de cámara/GPS/ubicación | Medir tiempos reales Android/iPhone y seguir reduciendo bloqueos |
| Hora / GPS / dirección | 🧪 v6.6.19 | Hora inmediata; GPS/dirección en paralelo; si demora indica segundos y estado sin aparentar congelamiento | Validar completar dirección/ubigeo tras captura cuando geocodificación tarda |
| Evidencias | 🧪 En prueba | Lista, filtros, ver, editar, mapa, seleccionar; acceso directo para convertir la misma foto en Local partidario | Terminar pulido visual y acciones de selección |
| Clasificación individual | ✅ Funcional | Partido + PANEL/BANNER/PINTA; empresa solo PANEL | Validación final en varios teléfonos |
| Clasificación por lote | ✅ Funcional | Seleccionar varias → clasificar → guardar y siguiente | Pulir repetir anterior y salida final |
| Editor / marco | 🧪 En prueba | Foto visible, zoom inspección, giro/marco no destructivo | Validar estabilidad de todos los controles en Android/iPhone |
| Local partidario | 🧪 v6.6.18 | Convierte una evidencia existente en POLITICAL_LOCATION reutilizando foto/GPS; organización política obligatoria | Probar historial y deduplicación de un mismo local |
| Tramo pancartas/carteles | 🧪 v6.6.19 | Exclusivo para propaganda repetitiva en postes. Evidencia inicial = A; usuario dibuja recorrido en mapa; calcula distancia, B, coordenadas y GeoJSON; conserva fotos muestra y conteo | Prueba real en avenida/pasaje y conectar geometría a carta municipal/Dashboard |
| Recorrido / cobertura | 🧪 Base disponible | Registra por dónde pasó el verificador aunque no haya hallazgos | Simplificar continuidad, pausa y cierre para campo |
| Zona asignada | 🟡 Parcial | Existe planificación/sector avanzado | Conectar con Dashboard: publicar zona, aceptar/continuar, progreso |
| Actividad política foto/video | 🧪 v6.6.18 | Foto/video, partido, actividad y GPS; guarda/verifica primero en IndexedDB y sincroniza después en segundo plano | Validar guardado real y video en varios Android/iPhone |
| Historial cercano | ✅ Configurable | Puede alertar evidencia previa o quedar OFF | Validación final de preferencia persistente |
| Sincronización | 🧪 v6.6.18 | Dropbox central; Persona/alias opcional; prueba real de escritura y prueba de una sola evidencia | Validar con segundo dispositivo y luego lotes grandes/red inestable |
| Migración ONE SHOP → ONE SHOT 2 | 🧪 v5.6.4/v6.6.18 | ONE SHOP revisa y respalda recuperables antes de habilitar el salto a ONE SHOT 2; no borra el origen | Probar con el trabajador que aún usa one-shop.pages.dev |
| Excel de campo | ✅ Funcional | Reporte XLSX con fotos, GPS y hojas especializadas | Añadir/validar geometría A-B del tramo manteniendo compatibilidad |
| Fer / voz / OCR | ⏸ OFF | Oculto para no interferir | Retomar solo cuando esté estable y realmente aporte |
| Actualizador PWA | 🧪 En prueba | Busca/instala versión y conserva evidencias | Seguir validando transición y confirmación de última versión |
| Android | 🧪 En prueba real | PWA instalada y flujo activo | Estabilidad/rendimiento en equipos distintos |
| iPhone / iOS | ⏳ Pendiente | Diseño contemplado | Pruebas reales de cámara, PWA, GPS y video |

## Entidades de campo

1. **EVIDENCE** · Foto individual: PANEL / BANNER / PINTA.
2. **POLITICAL_LOCATION** · Local partidario con historial de visitas.
3. **PROPAGANDA_CORRIDOR** · Tramo de pancartas/carteles repetitivos A→B con geometría y fotos muestra.
4. **POLITICAL_ACTIVITY** · Actividad política con foto/video.
5. **FIELD_ROUTE** · Recorrido de inspección, incluso sin hallazgos.
6. **WORK_ZONE / FIELD_SECTOR** · Zona que coordinación desea revisar.

## Flujo Tramo v6.6.19

1. Tomar una foto representativa con GPS.
2. Tocar `🪧 Tramo` desde la captura.
3. La evidencia fija el **Punto A** y queda vinculada como foto muestra.
4. Elegir **organización política**. El tipo ya no ofrece PANEL/BANNER/PINTA: queda fijo en **Pancartas / carteles repetitivos en postes**.
5. Iniciar el tramo.
6. En el mapa, tocar puntos siguiendo la avenida, jirón o pasaje. Se puede deshacer puntos o usar el GPS actual como B.
7. `Guardar trazo y coordenadas` genera distancia, A, B y `LineString` GeoJSON.
8. Registrar conteo exacto/aproximado/no contabilizado y fotos muestra adicionales si son necesarias.
9. Finalizar. Una fila representa el hallazgo lineal completo, no fotografías ficticias por cada poste.

## Prueba corta v6.6.19

1. **Arranque:** abrir la PWA. Debe mostrar `Preparando cámara…`, luego GPS y finalmente ubicación/listo, sin pantalla muda.
2. **Actividad:** registrar foto/video → partido → tipo → Guardar actividad. Debe confirmar guardado local antes de nube.
3. **Local partidario:** desde Evidencias tocar `🏢 Local`, seleccionar organización y guardar reutilizando foto/GPS.
4. **Tramo:** tomar una foto → `🪧 Tramo` → verificar A → partido → iniciar → dibujar recorrido → guardar trazo → finalizar.
5. **Sync:** `🧪 Probar escritura` → `☁ Probar última evidencia` → luego sincronizar pendientes.
6. **Migración:** ONE SHOP → respaldar recuperables → abrir ONE SHOT 2 solo si termina sin errores.

## Excel operativo

Mientras el Dashboard no sustituya el flujo actual, Excel sigue siendo una salida principal. Debe poder consolidar y separar al menos:

- Evidencias generales
- Paneles
- Banners
- Pintas
- Locales partidarios
- Tramos de propaganda con Punto A, Punto B y distancia
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
| Cartas a municipalidades | ⏳ Pendiente | Usar puntos/tramos del mapa para agrupar evidencias y generar requerimientos de retiro |
| Respuestas / subsanación | ⏳ Pendiente | Permanece / modificada / retirada / subsanada |
| Sectores / asignaciones | ⏳ Pendiente | Dibujar zona, asignar o dejar abierta al equipo |
| Continuar recorrido | ⏳ Pendiente | Ver cobertura anterior y continuar sin repetir calles |
| Usuarios de apoyo | ⏳ Pendiente | Revisor secundario con permisos limitados |
| Exportes Admin | ⏳ Pendiente | Excel filtrado por fecha, partido, tipo, territorio, municipio, estado |
| Métricas / tablero | ⏳ Pendiente | Cobertura, hallazgos, partidos, municipios, pendientes y subsanación |

## Orden de trabajo recomendado

1. Validar en móvil **Arranque + Tramo en mapa v6.6.19**.
2. Validar **Actividad + Local + Sync** de v6.6.18/v6.6.19.
3. Validar migración de un trabajador **ONE SHOP → ONE SHOT 2** sin pérdida.
4. Ajustar Excel para consumir geometría A-B del tramo y mantener reportes actuales.
5. Simplificar **Recorrido/Cobertura** para uso real de campo.
6. Congelar alcance de **ONE SHOT Campo 1.0**.
7. Rebasar/actualizar base D1 de Fase 3 contra `main`.
8. Construir **Dashboard Admin**: login/roles → bandeja → mapa nacional.
9. Importar históricos y habilitar sectores/asignaciones/continuidad.
10. Municipalidades → cartas → respuestas → subsanación.

## Regla de arquitectura

- El móvil **captura y registra**.
- El Dashboard **administra y revisa**.
- Dropbox conserva medios.
- D1/índice central conserva metadatos y relaciones.
- Excel continúa disponible durante toda la transición.
- Nunca sobrescribir destructivamente el original de una evidencia.
