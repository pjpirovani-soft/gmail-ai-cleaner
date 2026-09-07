# 🤝 Guía de Contribución - Gmail AI Cleaner

¡Gracias por tu interés en contribuir a **Gmail AI Cleaner**! Las contribuciones de la comunidad son vitales para mantener el proyecto moderno, eficiente y accesible para todos los usuarios.

---

## 📜 Código de Conducta

Al participar en este proyecto, te comprometes a fomentar un ambiente respetuoso, constructivo e inclusivo para todas las personas colaboradoras, independientemente de su nivel de experiencia, género, orientación sexual, discapacidad o trasfondo cultural.

---

## 🛠️ Cómo Empezar

1. **Fork del Repositorio**: Haz un fork del repositorio en tu cuenta de GitHub.
2. **Clona tu Fork**:
   ```bash
   git clone https://github.com/tu-usuario/gmail-ai-cleaner.git
   cd gmail-ai-cleaner
   ```
3. **Crea una Rama para tu Cambio**:
   Usa nombres descriptivos siguiendo nuestras convenciones:
   - `feature/nueva-funcionalidad`
   - `fix/correccion-error-en-tabla`
   - `docs/mejora-guia-despliegue`
   - `refactor/optimizacion-filtros`
4. **Instala Dependencias**:
   ```bash
   npm install
   ```
5. **Configura tu Entorno Local**:
   ```bash
   cp .env.example .env
   ```

---

## 🎨 Guía de Estilo y Filosofía de Diseño

### 1. Material Design 3 (M3)
- Todas las vistas y componentes deben apegarse estrictamente a las especificaciones oficiales de **Google Material Design 3** (https://m3.material.io/).
- Usa la paleta corporativa de Google:
  - Primario: `#1A73E8`
  - Secundario: `#34A853`
  - Error: `#EA4335`
  - Terciario: `#FBBC04`
- Los iconos deben ser exclusivamente de la familia **Google Material Symbols**.
- Mantén la tipografía oficial **Roboto** para títulos y cuerpo de texto.
- Respeta la jerarquía de elevaciones (`var(--md-elevation-1)` a `var(--md-elevation-4)`).

### 2. TypeScript y Calidad de Código
- Tipado estricto: evita el uso de `any` a menos que sea estrictamente necesario.
- No uses `const enum`; utiliza declaraciones estándar de `enum`.
- Escribe código modular, desacoplado y con responsabilidades claras.
- Utiliza el helper estructurado de logs (`logger.info`, `logger.debug`, `logger.error`).

---

## 📝 Convención de Commits (Conventional Commits)

Seguimos el estándar [Conventional Commits](https://www.conventionalcommits.org/) para mantener un historial limpio y generar changelogs automáticos:

- `feat:` Una nueva característica para el usuario (ej. `feat: agregar exportación a CSV de correos analizados`).
- `fix:` Corrección de un bug (ej. `fix: corregir cálculo de paginación con filtros vacíos`).
- `docs:` Cambios únicamente en documentación (ej. `docs: actualizar guía de despliegue en Railway`).
- `style:` Ajustes visuales o de formato que no afectan la lógica (ej. `style: mejorar espaciado en tarjetas M3`).
- `refactor:` Refactorización de código que no agrega funcionalidad ni arregla bugs (ej. `refactor: modularizar conector de Gemini`).
- `test:` Inclusión o corrección de pruebas unitarias o de integración.
- `chore:` Tareas de mantenimiento o configuración de build (ej. `chore: actualizar dependencias en package.json`).

---

## 🚀 Proceso para Pull Requests (PR)

Antes de enviar tu Pull Request, verifica la siguiente lista:

1. [ ] ¿El código compila sin errores ejecutando `npm run build`?
2. [ ] ¿La interfaz respeta los principios de accesibilidad y diseño Material Design 3?
3. [ ] ¿Has probado tanto con una clave de Gemini activa como con el motor heurístico de respaldo?
4. [ ] ¿Has actualizado la documentación correspondiente si tu cambio introduce nuevas opciones o variables?
5. [ ] ¿Tus commits siguen el estándar Conventional Commits?

### Envío:
- Abre un Pull Request apuntando a la rama `main` del repositorio principal.
- Describe claramente el problema que resuelves y los pasos para verificar el cambio.
- Incluye capturas de pantalla si modificas elementos visuales de la interfaz.

---

## 💬 Canales de Comunicación y Soporte

Si tienes dudas, ideas o necesitas discutir un cambio de arquitectura antes de empezar a programar:
- Abre un **Issue** en GitHub con la etiqueta `pregunta` o `propuesta`.
- O contacta al equipo mantenedor en [pirovanipedrojose@gmail.com](mailto:pirovanipedrojose@gmail.com).

¡Gracias por hacer de **Gmail AI Cleaner** una herramienta cada día mejor!
