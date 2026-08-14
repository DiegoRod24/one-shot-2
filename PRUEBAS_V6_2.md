# PRUEBAS v6.2 · INSTALL & UPDATE CORE

## iPhone / iPad
1. Abrir desde Safari: no debe abrir automáticamente el modal Instalar.
2. Pulsar manualmente Instalar ONE SHOT: sí debe mostrar los pasos de Safari.
3. Abrir desde el icono de pantalla de inicio: debe mostrar estado instalada y nunca pedir instalar otra vez.
4. Con build remoto igual al local: no debe abrir Actualizar ONE SHOT.
5. Publicar un build nuevo: debe mostrar Actualizar una vez; tras aplicarlo no debe repetirse.

## Android navegador
1. Si `beforeinstallprompt` está disponible, la instalación puede sugerirse una vez.
2. Si se cancela, no debe reabrirse en la misma sesión.
3. Una PWA instalada no debe volver a pedir instalación.

## Actualización
1. `remote.build === current`: cerrar cualquier modal viejo y mostrar estado actualizado.
2. `remote.build !== current`: ofrecer actualización.
3. Después de actualizar, guardar `oneshotAppliedBuild` con el nuevo build.
4. La fuente local debe ser `version.json`; el fallback debe apuntar solo a `DiegoRod24/one-shot-2`.

## Seguridad de datos
- No borrar IndexedDB.
- No modificar `oneshotEvidenceDB_v2`.
- No reinstalar la PWA para aplicar una actualización.
