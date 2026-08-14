# ONE SHOT v6.0.4 · ONE TURN TAKING MASCOT

## Corrección principal
ONE ya no se escucha a sí mismo. Cuando el asistente habla, el reconocimiento de voz se bloquea; al terminar la frase, se reactiva automáticamente si el micrófono continuo estaba encendido.

## Doble protección contra eco
1. Pausa real del SpeechRecognition mientras speechSynthesis habla.
2. Filtro de eco: durante unos segundos descarta transcripciones demasiado parecidas a la última frase pronunciada por ONE.

## Mascota interactiva
Estados visuales reales:
- speaking: mueve boca/cuerpo.
- waiting/listening: respira y pulsa mientras espera tu respuesta.
- thinking: inclina la cabeza y mueve la mirada.
- success: pequeño salto/celebración.
- error: mantiene la pregunta sin avanzar.

## Micrófono
- Un toque: activa conversación continua.
- Otro toque: pausa la escucha.
- No es necesario tocar en cada pregunta.

## Regla de avance
- Respuesta clara y válida: guarda y avanza automáticamente.
- Respuesta ambigua: solicita confirmación/corrección.
- Respuesta fuera de contexto: no avanza.
