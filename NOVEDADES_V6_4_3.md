# ONE SHOT v6.4.3 · DATA + EDIT FLOW FIX

## Correcciones principales
- Sanea valores contaminantes `31`, `undefined`, `null`, `N/A` únicamente en campos textuales de clasificación/revisión; no borra altitud, número de vía ni otros valores numéricos que pueden ser válidos.
- Editar mantiene el flujo esencial de 3 pasos: Partido → Tipo → Confirmación.
- Los tipos válidos siguen siendo únicamente PANEL, MURAL y BANNER.
- El selector de partido usa el catálogo completo y logos de `LOGOS_2.xlsx`, con búsqueda visual.
- Textos del flujo cambian de ONE a Fer.
- Fer principal queda en el panel conversacional; se evita duplicarlo sobre la foto durante la edición normal.
- Fer usa un sprite humanizado por estados: idle, saludo, habla, escucha, pensamiento, proceso, revisión, éxito, alerta, error y ayuda.
- Cámara permanece tranquila y sin Fer durante captura normal.

## Reporte / Excel
- EVIDENCIAS se reconstruye operacionalmente con Partido, Tipo, Estado de revisión, Municipalidad y Alcalde/encargado.
- Se eliminan Candidato/Cargo de la vista principal del reporte; permanecen solo en datos técnicos si contienen información válida.
- CLASIFICACION_COMPATIBLE corrige `Provinca` → `Provincia` y `Alcalde` ya no usa Candidato.
- METADATOS refleja v6.4.3.
- Valores contaminantes no se exportan como contenido válido.
- Municipalidad/Alcalde solo se exportan cuando existe match territorial real; si no, quedan pendientes en vez de inventarse.

## Persistencia
Los registros existentes se sanejan conservando auditoría de los valores retirados. La base IndexedDB no cambia de nombre ni se reinicia.
