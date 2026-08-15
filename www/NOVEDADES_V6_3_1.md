# ONE SHOT v6.3.1 · PARTY LOGOS + CLEAN REPORT

## Selector visual de partidos
- Catálogo construido desde LOGOS_2.xlsx.
- 74 organizaciones únicas con logo.
- Búsqueda rápida por nombre.
- Cuadrícula visual dentro de Editar.
- Voz y toque siguen usando el mismo valor de partido.

## Reporte corregido
- Se eliminan valores basura de prueba como `31` en campos de clasificación/exportación.
- `Alcalde` deja de usar el campo candidato y utiliza el alcalde/encargado municipal del match territorial.
- `Provinca` se corrige a `Provincia`.
- Se agrega Estado de revisión, Municipalidad, Alcalde/encargado, UBIGEO y fuente de match.
- Nueva hoja `DESTINO_MUNICIPAL` para agrupar evidencias por municipalidad.
- Tipos históricos distintos de PANEL/MURAL/BANNER se conservan en datos técnicos, pero en la vista operativa quedan como PENDIENTE para revisión.
- METADATOS identifica correctamente la versión 6.3.1.

## Regla de integridad territorial
La app no inventa municipalidad. Si no existe UBIGEO o territorio estructurado suficiente, el destino queda pendiente/revisar ubicación.
