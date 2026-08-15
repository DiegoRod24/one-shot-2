# ONE SHOT v6.4.1 · FER VISUAL IN-APP FIX

## Corrección principal
La v6.4 tenía la lógica correcta de estados, pero Fer todavía se veía demasiado geométrico. Esta versión conserva la lógica y reemplaza la representación visual por un personaje SVG humanizado construido dentro de la propia app.

## Fer dentro de la app
- Editar: Fer acompaña Partido → Tipo junto a la evidencia.
- Reportes: Fer cambia de gesto al revisar, procesar, alertar y terminar.
- Antecedentes/duplicados: Fer aparece únicamente cuando el usuario solicita ayuda.
- Asistente general: el botón flotante deja de verse como un bloque vacío y muestra correctamente a Fer.
- Cámara: sigue limpia; Fer se oculta durante la captura normal.

## Rasgos
Moño alto, cabello oscuro, barba con canas, rostro estilizado, hoodie oscuro, camisa y credencial ONE SHOT.

## Estados visuales
Idle, saludo, hablando, escuchando/esperando, pensando, procesando, revisando, éxito, alerta, error y ayuda.

## Compatibilidad
No modifica el motor de Cámara ni app.js. Se conserva la lógica v6.3.1/v6.4 de partidos, PANEL/MURAL/BANNER, revisión, municipalidad/alcalde y reportes.
