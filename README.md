# Plataforma de Módulos Matemáticos

Este proyecto es una **plataforma web** que permite a los usuarios explorar módulos matemáticos asociados a diferentes carreras. La plataforma está diseñada para ser dinámica, fácil de usar y visualmente atractiva.

---

## Características principales

- **Menú lateral interactivo**: Lista de carreras con animaciones y efectos hover.
- **Grilla de módulos**: Los módulos de cada carrera se muestran en una grilla de 3 columnas con botones grandes y animaciones.
- **Carga dinámica de datos**: Los datos de las carreras, módulos y lecciones se cargan desde un archivo JSON.
- **Diseño responsive**: La plataforma se adapta a diferentes tamaños de pantalla (móviles, tablets, escritorio).
- **Spinner de carga**: Muestra un spinner mientras se cargan los módulos.
 - **Presentaciones Reveal.js**: Slides interactivas generadas con Pandoc y Reveal.js para clases y unidades.
 - **Renderizado matemático**: Integración con MathJax para mostrar fórmulas LaTeX en HTML y presentaciones.
 - **Visualizaciones interactivas**: Soporte para applets GeoGebra embebidos.
 - **Wiki colaborativo**: Documentación y tutoriales para usuarios y desarrolladores.

---

## Tecnologías utilizadas

- **HTML5**: Estructura de la plataforma.
- **CSS3**: Estilos y animaciones.
- **JavaScript**: Lógica para cargar y mostrar datos dinámicamente.
- **FontAwesome**: Íconos utilizados en la interfaz.
 - **Pandoc**: Conversión de archivos LaTeX a HTML y Reveal.js.
 - **MathJax**: Renderizado de matemáticas.
 - **GeoGebra**: Visualizaciones matemáticas interactivas.
 - **Reveal.js**: Framework para presentaciones tipo slides.

---

## Flujos de trabajo principales

### Usar un servidor local (recomendado)

1. Clona o descarga este repositorio.
2. Abre una terminal y navega a la carpeta del proyecto:
3. Inicia un servidor HTTP con Python:
    - Si tienes Python 3:
      ```python -m http.server 8000```
    - Si tienes Python 2.7:
      ```python -m SimpleHTTPServer 8000```
4. Abre tu navegador y visita: http://localhost:8000

- **Conversión de archivos LaTeX**:
  - Usa Pandoc para convertir `.tex` a HTML o presentaciones Reveal.js. Ejemplo:
    ```bash
    pandoc -s --mathjax -t revealjs -i INPUT.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=reveal.html -c style.css
    ```
  - El filtro Lua `remove-num.lua` elimina numeración de teoremas.
  - El script Python `refinar-tex.py` limpia comandos Beamer y adapta bloques antes de la conversión.

---

## Integraciones y recomendaciones

- **MathJax**: Configurado en `scripts/mathjax-config.js` para renderizar matemáticas en todo el sitio.
- **GeoGebra**: Applets embebidos para visualizaciones interactivas.
- **FontAwesome**: Íconos de interfaz vía CDN o archivos locales.
- **Pandoc**: Requiere instalación local o uso en entornos online con terminal (Replit, Gitpod, Colab).

---

## Recursos y documentación

 - Documentación y tutoriales en el [Wiki de GitHub](https://github.com/hcastro-cl/Plataforma/wiki).


---
