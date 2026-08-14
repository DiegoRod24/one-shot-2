# ONE SHOT v6.2 · INSTALL & UPDATE CORE

Se reconstruyó la lógica de instalación y actualización por plataforma.

## Reglas nuevas
- iPhone/iPad: la guía de instalación nunca se abre automáticamente.
- iPhone/iPad abierto desde el icono: se considera aplicación instalada; no se vuelve a ofrecer instalación.
- Safari normal: la guía de instalación solo aparece por acción explícita del usuario.
- Android instalado/PWA: no se vuelve a ofrecer instalación.
- Android navegador: puede usar `beforeinstallprompt`, pero no repite la sugerencia en la misma sesión.
- Actualizar y Instalar son flujos independientes.
- Si `remote.build === current build`, no se abre el modal de actualización y no se recargan archivos innecesariamente.
- La única fuente de versión de la PWA es `version.json` del proyecto actual; el fallback remoto apunta a `DiegoRod24/one-shot-2`.

## Build
`oneshot-v6.2-install-update-core-01`
