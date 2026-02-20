# Sistema de Organización de Iconos

## Contexto del Proyecto

- **Frontend**: Desarrollado en Vue.js 3 (Vite + Pinia).
- **Backend / API**: Alimentado por una API REST en Laravel 11.9 (Endpoint base: `https://apiiconos-production.up.railway.app/api/legacy`).
- **Diseño Original**: La interfaz y el diseño actual se basan estrictamente en el sistema heredado (HTML, CSS vanilla y JS) ubicado en la carpeta `./legacy`.

## Reglas de Agente (Rules)

1. **Revisión Exhaustiva Obligatoria**: Al realizar cualquier cambio, debes revisar minuciosamente el impacto en todos los elementos CSS y la lógica JS interconectada antes de terminar.
2. **Auditoría de Contraste y Visibilidad**: Asegúrate SIEMPRE de que todos los elementos interactivos y textos sean legibles. Prohibido crear contraste nulo (ej: texto blanco sobre fondo blanco o gris claro sobre blanco) o estados hover imposibles de leer.
3. **Uso Restringido de Opacidad**: Prohibido usar `opacity: 0` para elementos que deben ser interactuados por el usuario, excepto para ocultar elementos completamente del flujo (como modales emergentes, tooltips condicionales, etc.). Usa `display: none` o `v-if/v-show` siempre que sea posible.
4. **Fidelidad y Responsividad**: La interfaz debe ser 100% responsive en todos los tamaños de pantalla y debe igualar exactamente la estética, padding, colores y comportamiento del sistema original en `./legacy`.
