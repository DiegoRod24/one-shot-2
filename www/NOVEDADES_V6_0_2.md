# ONE SHOT v6.0.3 · ONE AUTO FLOW MASCOT

## Objetivo
Convertir **Editar con ONE** en una clasificación realmente conversacional y confiable: cada respuesta confirmada se guarda en la evidencia antes de continuar y las respuestas de voz dudosas nunca hacen avanzar el flujo por sí solas.

## Mejoras implementadas

- Pregunta actual en tarjeta de alto contraste para evitar textos oscuros o ilegibles.
- Mascota ONE pequeña sobre la evidencia, con cuerpo, antena, ondas y estados animados: hablando, escuchando, pensando, éxito y error.
- Pulso visual discreto sobre la fotografía cada vez que cambia la pregunta, para reforzar que ONE está revisando la misma evidencia.
- Voz con flujo `Escuché -> Valor reconocido -> Confirmar / Corregir / Volver a escuchar`.
- ONE **no avanza** con una respuesta hablada hasta que el usuario la confirma.
- Toque directo en una opción se considera confirmación explícita, se guarda y recién después avanza.
- Autoguardado real del formulario manual con debounce de 450 ms.
- Indicador visible `Cambios guardados / Guardando / Cambio pendiente / Error` con hora del último guardado.
- Cada respuesta guiada escribe inmediatamente en IndexedDB mediante `Store.save()`.
- Auditoría por paso en `classificationAudit`: fecha, campo, valor anterior, valor nuevo, origen de la respuesta y nombre del asistente.
- Borrador en `classificationDraft`: paso actual, respuestas, estado y fecha de actualización. Permite retomar una clasificación en progreso.
- `Guardar y siguiente` completa el borrador y abre la siguiente evidencia disponible.
- `Descartar` conserva la evidencia y la marca como `Descartado`; `Eliminar definitivamente` queda separado y requiere confirmación explícita.
- Evidencias con 2 o más elementos quedan marcadas como múltiples para revisión. ONE no crea registros adicionales automáticamente.
- Se mantienen comandos de imagen: acercar, alejar, mostrar completa, girar, mover encuadre y aplicar marco.
- Se mantienen comandos de asistente: silenciar, volver a hablar, ocultar mascota, atrás, siguiente, guardar y guardar/siguiente.
- Rescate de Evidencia sigue siendo no destructivo: el original y su hash se conservan.
- Motor de cámara no fue modificado respecto de la base v6.0.1 / hotfix 5.8.1.
- Base local sigue siendo `oneshotEvidenceDB_v2`.

## Corrección principal del error observado

Antes podía ocurrir:

1. ONE preguntaba `Tipo`.
2. Usuario decía `panel`.
3. El flujo avanzaba a `Partido`.
4. La UI seguía mostrando `panel` y terminaba diciendo que no entendía el valor.

Ahora:

1. ONE pregunta `Tipo`.
2. Usuario dice `panel`.
3. ONE muestra `Te escuché decir: panel` y `Valor reconocido: PANEL`.
4. El usuario confirma o corrige.
5. Solo después de confirmar se guarda `PANEL` en la evidencia.
6. Aparece `Respuesta guardada` y recién entonces se muestra la pregunta de Partido.

## Casuísticas contempladas

- Respuesta exacta por voz.
- Respuesta con sinónimos: panel/valla/cartel grande, local/sede/casa partidaria, pinta/pared pintada, etc.
- Respuesta no compatible con la pregunta actual.
- Usuario dice `sí` o `no` después de una propuesta pendiente.
- Usuario intenta avanzar con una respuesta pendiente sin confirmar.
- Usuario toca una opción en vez de hablar.
- Usuario escribe una respuesta libre para candidato u observación.
- Usuario pide acercar/alejar/girar la foto durante cualquier pregunta.
- Usuario silencia o vuelve a activar a ONE durante la clasificación.
- Usuario sale y vuelve a una clasificación parcialmente completada.
- Usuario modifica el formulario completo manualmente.
- Evidencia con más de un elemento visible.
- Evidencia descartada sin destruir historial.
- Eliminación definitiva separada de descarte.
- Rescate de foto girada o mal encuadrada sin reemplazar el original.

## Límite deliberado

ONE todavía **no afirma reconocer visualmente un panel o partido mediante un modelo de visión propio**. La lectura automática disponible se apoya en OCR, catálogo, histórico, GPS y reglas. La clasificación visual final sigue requiriendo confirmación humana.
