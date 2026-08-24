# ONE SHOT · Estado funcional y próximos pasos

Actualizado: 2026-08-24

## Objetivo del producto

ONE SHOT Campo debe permitir recolectar evidencia política en calle con la menor fricción posible. ONE SHOT Operaciones/Dashboard debe recibir, revisar, mapear, asignar trabajo, consolidar y exportar esa información.

## ONE SHOT Campo · móvil

| Módulo | Estado | Qué hace hoy | Falta validar / mejorar |
|---|---|---|---|
| Cámara trasera rápida | 🧪 En prueba | Prioriza cámara trasera y muestra progreso visible de cámara/GPS/ubicación | Medir tiempos reales Android/iPhone y seguir reduciendo bloqueos |
| Hora / GPS / dirección | 🧪 En prueba | Hora inmediata; GPS/dirección en paralelo; muestra estado si demora | Validar completar dirección/ubigeo cuando geocodificación tarda |
| Evidencias | 🧪 En prueba | Lista, filtros, ver, editar, mapa, seleccionar; convierte la misma foto en Local partidario o inicio de Tramo | Pulido visual y acciones de selección |
| Clasificación individual | ✅ Funcional | Partido + PANEL/BANNER/PINTA; empresa solo PANEL | Validación final en varios teléfonos |
| Clasificación por lote | ✅ Funcional | Seleccionar varias → clasificar → guardar y siguiente | Pulir repetir anterior y salida final |
| Editor / marco | 🧪 En prueba | Foto visible, zoom inspección, giro/marco no destructivo | Validar controles Android/iPhone |
| Local partidario | 🧪 Implementado | Convierte una evidencia existente en POLITICAL_LOCATION reutilizando foto/GPS; organización obligatoria | Probar historial y deduplicación |
| Tramo carteles/pancartas | 🧪 v6.6.22 | Flujo exclusivo para propaganda repetitiva en postes: foto inicial=A, organización, distribución en vía, trazo A→B sobre mapa, distancia/GeoJSON, postes/carteles, fotos muestra y video opcional | Prueba real en avenida/pasaje y validar Dropbox/Excel |
| Recorrido / cobertura | 🧪 Base disponible | Registra por dónde pasó el verificador aunque no haya hallazgos | Simplificar continuidad, pausa y cierre |
| Zona asignada | 🟡 Parcial | Existe planificación/sector avanzado | Conectar con Dashboard: publicar zona, aceptar/continuar, progreso |
| Actividad política foto/video | 🧪 Implementado | Foto/video, partido, actividad y GPS; guarda local antes de sincronizar | Validar varios Android/iPhone |
| Historial cercano | ✅ Configurable | Puede alertar evidencia previa o quedar OFF | Validación final persistente |
| Sincronización | 🧪 En prueba | Dropbox central; Persona/alias opcional; pruebas de escritura y última evidencia | Validar segundo dispositivo, lotes grandes y red inestable |
| Migración ONE SHOP → ONE SHOT 2 | 🧪 En prueba | ONE SHOP respalda recuperables antes de habilitar salto a ONE SHOT 2; no borra origen | Probar trabajador real |
| Excel de campo | ✅ + v6.6.22 | Mantiene reportes actuales; Tramos agregan postes, carteles, calidad, distribución, videos muestra y GeoJSON | Validar archivo real con todos los tipos |
| Fer / voz / OCR | ⏸ OFF | Oculto para no interferir | Retomar solo si aporta y está estable |
| Actualizador PWA | 🧪 En prueba | Busca/instala versión y conserva evidencias | Validar transiciones |
| Android | 🧪 En prueba real | PWA instalada y flujo activo | Rendimiento en equipos distintos |
| iPhone / iOS | ⏳ Pendiente | Diseño contemplado | Pruebas reales de cámara, PWA, GPS y video |

## Entidades de campo

1. **EVIDENCE** · Foto individual: PANEL / BANNER / PINTA.
2. **POLITICAL_LOCATION** · Local partidario con historial de visitas.
3. **PROPAGANDA_CORRIDOR** · Tramo de carteles/pancartas repetitivas A→B, geometría, conteo y muestras.
4. **POLITICAL_ACTIVITY** · Actividad política con foto/video.
5. **FIELD_ROUTE** · Recorrido de inspección, incluso sin hallazgos.
6. **WORK_ZONE / FIELD_SECTOR** · Zona que coordinación desea revisar.

## Flujo Tramo v6.6.22

1. Tomar una foto representativa con GPS donde comienza la propaganda repetitiva.
2. Tocar `🪧 Tramo`; esa evidencia queda vinculada y fija el **Punto A**.
3. Elegir organización política. PANEL/BANNER/PINTA no aparecen en este flujo.
4. Indicar distribución: ambos lados, un lado, separador/berma o no precisado.
5. Iniciar el tramo.
6. En el mapa tocar puntos siguiendo la avenida, jirón o pasaje; se puede deshacer o usar GPS actual como B.
7. Guardar trazo: genera distancia, A, B y `LineString` GeoJSON.
8. Registrar postes y carteles por separado; conteo exacto/aproximado/no contabilizado.
9. Usar fotos muestra. Opcionalmente grabar video muestra de hasta 90 s / 80 MB para demostrar continuidad.
10. Finalizar. Se guarda una entidad lineal, no una fotografía ficticia por cada poste.
11. Con clave/red, metadatos del tramo y videos muestra se respaldan en Dropbox. Si no hay red, permanecen locales para reintento.

## Excel operativo

Mientras el Dashboard no sustituya el flujo actual, Excel sigue siendo una salida principal. Debe consolidar y separar al menos:

- Evidencias generales
- Paneles
- Banners
- Pintas
- Locales partidarios
- Tramos de propaganda con Punto A, Punto B, distancia, distribución y GeoJSON
- Evidencias/fotos asociadas a cada tramo
- Número de videos muestra del tramo
- Actividades políticas
- Recorridos / cobertura
- Ubicación territorial y enlaces de mapa

## ONE SHOT Operaciones · Dashboard Admin

| Módulo | Estado | Próximo paso |
|---|---|---|
| Dropbox media backend | ✅ Base lista | Mantener originales/versiones, actividad y muestras de tramo |
| Índice geográfico D1 | 🟡 Preparado en PR #13 | Actualizar contra main, crear/bindear GEO_DB y probar schema |
| Dashboard web | ⏳ Pendiente | Crear shell Admin y navegación |
| Login / roles | ⏳ Pendiente | Admin, Coordinador, Revisor; móvil sin login pesado |
| Bandeja de revisión | ⏳ Pendiente | PENDIENTE → VALIDADA / OBSERVADA / DESCARTADA |
| Mapa nacional Perú | ⏳ Pendiente | Capas por evidencia/local/tramo/actividad/recorrido/zona |
| Importar Excel histórico + fotos | ⏳ Pendiente | Levantar mapa con trabajo existente |
| Municipalidad probable | 🟡 Base territorial | Sugerir municipio para punto/tramo y permitir confirmación |
| Cartas a municipalidades | ⏳ Pendiente | Agrupar puntos/tramos, mapa, fotos/video y generar sustento de retiro |
| Respuestas / subsanación | ⏳ Pendiente | Permanece / modificada / retirada / subsanada |
| Sectores / asignaciones | ⏳ Pendiente | Dibujar zona, asignar o dejar abierta |
| Continuar recorrido | ⏳ Pendiente | Ver cobertura anterior y continuar sin repetir calles |
| Usuarios de apoyo | ⏳ Pendiente | Revisor secundario con permisos limitados |
| Exportes Admin | ⏳ Pendiente | Excel filtrado por fecha, partido, tipo, territorio, municipio y estado |
| Métricas / tablero | ⏳ Pendiente | Cobertura, hallazgos, partidos, municipios, pendientes y subsanación |

## Orden de trabajo recomendado

1. Validar **Tramo v6.6.22** con una avenida real: foto A → partido → mapa → B → conteo → video opcional → finalizar.
2. Verificar hoja `TRAMOS_PROPAGANDA` del Excel y respaldo Dropbox del video/metadatos.
3. Validar Actividad + Local + Sync y migración ONE SHOP → ONE SHOT 2.
4. Simplificar Recorrido/Cobertura.
5. Congelar alcance de ONE SHOT Campo 1.0.
6. Actualizar base D1 de Fase 3 contra `main`.
7. Construir Dashboard Admin: login/roles → bandeja → mapa nacional.
8. Importar históricos, sectores/asignaciones y continuidad.
9. Municipalidades → cartas → respuestas → subsanación.

## Regla de arquitectura

- El móvil **captura y registra**.
- El Dashboard **administra y revisa**.
- Dropbox conserva medios.
- D1/índice central conserva metadatos y relaciones.
- Excel continúa disponible durante toda la transición.
- Nunca sobrescribir destructivamente el original de una evidencia.
