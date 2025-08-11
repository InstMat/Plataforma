# Instrucciones Copilot para Plataforma

## Descripción General del Proyecto
- Plataforma web modular para explorar módulos matemáticos por carrera/asignatura.
- Carga dinámica de datos desde archivos JSON (`data/`), interfaz responsiva y navegación interactiva.
- Presentaciones generadas con Pandoc y Reveal.js, usando temas personalizados y MathJax para renderizado matemático.

## Directorios y Archivos Clave
- `data/`: Datos JSON de carreras, módulos y lecciones.
- `FEN/`, `Ingenieria/`, `Salud/`: Contenido por asignatura, organizado en unidades y clases.
- `reveal/`: Framework Reveal.js, plugins, temas personalizados (Sass) y scripts de inicialización.
- `scripts/`: JS para carga de datos, configuración de MathJax y Reveal.js.
- `styles/`: CSS para landing pages y presentaciones.
- `pandoc-files/`: Plantillas de Pandoc, filtros y scripts de conversión.

## Flujos de Trabajo para Desarrolladores
- **Servidor local:**  Ejecuta `python -m http.server 8000` en la raíz del proyecto y abre `http://localhost:8000` en el navegador.
- **Conversiones con Pandoc:**
  - HTML de una sola página:  `pandoc -s --mathjax -i INPUT.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=default.html -c style.css`
  - Presentación Reveal.js:  `pandoc -s --mathjax -t revealjs -i INPUT.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=reveal.html -c style.css`
  - El filtro Lua `remove-num.lua` elimina la numeración de entornos tipo teorema.
- **Temas Reveal.js:**  Los temas usan Sass (`.scss`) en `reveal/css/theme/`, compílalos con `npm run build -- css-themes`.  Flujo: duplica un `.scss` fuente, sobreescribe variables/selectores y compila.
- **Inicialización Reveal.js:**  Configura transiciones, plugins y tema en `scripts/reveal-init.js`.

## Patrones Específicos del Proyecto
- **Interfaz dinámica:** JS carga/cachea datos desde JSON y actualiza la UI según selección (ver `scripts/carreras.js`).
- **Diseño responsivo:** CSS en `styles/landing.css` y `styles/style.css` usa media queries.
- **Presentaciones:**  Archivos HTML Reveal.js en carpetas de asignatura/unidad (ej: `Ingenieria/EDO/UnidadI/clase01.html`).  Configuración de MathJax en `scripts/mathjax-config.js`.
- **Notas/Referencias:**  Para impresión/exportación, evita `position: fixed` o valores negativos; usa `absolute` o posicionamiento estático para visibilidad.

## Puntos de Integración
- **MathJax:** Para renderizado matemático, configurado en `scripts/mathjax-config.js`.
- **Geogebra:** Embebido para visualizaciones matemáticas interactivas.
- **FontAwesome:** Íconos de UI vía CDN o archivos locales.

## Ejemplos
- Agregar un módulo: actualiza `data/carreras.json`, agrega contenido en la carpeta correspondiente y actualiza JS si es necesario.
- Personalizar una presentación: edita el `.tex`, convierte con Pandoc y ajusta Reveal.js en `reveal-init.js`.
- Crear un tema: duplica un `.scss` en `reveal/css/theme/source`, sobreescribe y compila.

---
Para más detalles, revisa los archivos README principales y de subdirectorios.
