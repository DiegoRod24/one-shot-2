# ONE SHOT 2 · Field Intelligence

Versión: **2.0.0-alpha.2**

## Flujo operativo
1. Salir a campo y opcionalmente iniciar recorrido.
2. Capturar propaganda electoral (PANEL, BANNER o PINTA).
3. Guardar foto + GPS inmediatamente.
4. Resolver Departamento / Provincia / Distrito.
5. Hacer match con DIRECTORIO para determinar la municipalidad y alcalde destinatarios.
6. Clasificar organización política.
7. Preparar dos destinos de la misma evidencia:
   - Municipalidad: verificación/permisos.
   - Organización política: sustento de gasto.
8. Revisar cobertura, evidencias y destinos.
9. Generar Excel de entrega.

## Reglas
- La ubicación de captura nunca se reemplaza por la dirección municipal.
- `municipalAddress` es exclusivamente la sede del destinatario municipal.
- Tipos principales: PANEL, BANNER y PINTA.
- Los registros legacy con otros tipos se conservan como `legacyType` y quedan pendientes de revisión.
- Cobertura territorial y hallazgos se guardan por separado.
- La app utiliza `oneshotEvidenceDB_v2`; no reinicia la base existente.
