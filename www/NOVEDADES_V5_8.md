# ONE SHOT 5.8 · ONE ASSISTANT

## Objetivo
Convertir la clasificación posterior en un flujo asistido dentro de ONE SHOT, tomando como referencia real el archivo `2. FOTOS ERM_OCTUBRE 2025.xlsx`.

## Base incluida
- 520 antecedentes históricos.
- 55 partidos del catálogo.
- 41 nombres de candidatos/alcaldes encontrados en la base.
- Tipos: BANNER, PANEL, PINTA.
- Procesos: PUBLICIDAD, EG, ERM.
- Cargos del catálogo: SENADOR, DIPUTADO, GOBERNADOR, PRESIDENTE, ALCALDE.

## Funciones
- Asistente activable/desactivable.
- Importación de Excel de clasificación compatible con hojas `Listas` y `Todo`.
- Historial cercano por GPS para sugerir continuidad.
- OCR opcional con Tesseract.js: la primera ejecución requiere conexión para cargar el motor/idioma.
- Coincidencia OCR contra partidos y candidatos del catálogo.
- Panel dentro de Editar evidencia para revisar y aplicar sugerencias.
- Comandos por texto y voz: seleccionar hoy, siguiente pendiente, pendientes, cobertura, Smart Route y preparar Excel.
- Acciones sensibles siguen requiriendo confirmación humana.

## Regla de seguridad operativa
ONE nunca convierte una sugerencia OCR/histórica en clasificación definitiva sin que el usuario guarde los cambios.
