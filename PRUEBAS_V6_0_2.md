# PRUEBAS v6.0.3 · ONE AUTO FLOW MASCOT

## 1. Voz sin avance automático
1. Abrir una evidencia.
2. Llegar a `Tipo`.
3. Decir `panel`.
4. Verificar que aparece `Valor reconocido: PANEL`.
5. Verificar que **NO** cambia a Partido todavía.
6. Pulsar `Confirmar`.
7. Verificar `Respuesta guardada`.
8. Verificar que recién entonces pasa a Partido.

## 2. Voz incorrecta para la pregunta
1. Estando en `Partido`, decir `panel`.
2. ONE debe indicar que la respuesta no corresponde claramente a esa pregunta.
3. Debe permanecer en Partido.
4. No debe modificar Tipo ni Partido.

## 3. Toque directo
1. En Tipo pulsar `PINTA`.
2. Debe guardar inmediatamente.
3. Debe mostrar confirmación de guardado.
4. Debe pasar a la siguiente pregunta.
5. Cerrar y volver a abrir la evidencia: Tipo debe continuar como PINTA.

## 4. Autoguardado manual
1. Abrir `Ver / editar formulario completo`.
2. Cambiar Partido, Candidato u Observación.
3. Esperar 1 segundo.
4. El indicador superior debe mostrar `Cambios guardados`.
5. Cerrar y reabrir: los cambios deben persistir.

## 5. Corrección de voz
1. Decir una respuesta reconocida.
2. Pulsar `Corregir`.
3. ONE no debe guardar ni avanzar.
4. Elegir otra opción o volver a hablar.

## 6. Siguiente con confirmación pendiente
1. Decir `panel`.
2. Antes de confirmar decir `siguiente`.
3. ONE debe pedir confirmar/corregir y quedarse en la misma pregunta.

## 7. Mascota
- Verificar animación hablando.
- Verificar animación escuchando.
- Verificar animación pensando.
- Verificar éxito al guardar.
- Verificar error al no reconocer.
- Verificar minimizar/restaurar.
- Verificar `silénciate` y `vuelve a hablar`.

## 8. Imagen durante la conversación
Probar por voz:
- `acerca la imagen`
- `acerca más`
- `aleja`
- `mostrar completa`
- `gira a la derecha`
- `gira a la izquierda`
- `mueve arriba/abajo/izquierda/derecha`
- `aplica marco`

## 9. Evidencia múltiple
1. Elegir `Dos` o `Tres o más`.
2. Cerrar y reabrir.
3. Verificar `elementsCount` persistente y estado múltiple.
4. No deben aparecer registros duplicados automáticos.

## 10. Descartar vs eliminar
- `Descartar`: debe conservar el registro con Estado `Descartado`.
- `Eliminar definitivamente`: debe requerir confirmación explícita y borrar solo después de aceptarla.

## 11. Regresión crítica
- Cámara frontal vertical/horizontal.
- Cámara trasera vertical/horizontal.
- Confirmar que la mejora del editor no altera el pipeline de cámara.
- Confirmar que la base sigue siendo `oneshotEvidenceDB_v2`.
