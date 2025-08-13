# Cómo usar Pandoc para obtener los mismos resultados que el sitio

Este tutorial te guía paso a paso para convertir archivos LaTeX-Beamer (`.tex`) en presentaciones Reveal.js y páginas HTML idénticas a las del sitio, usando los mismos filtros, plantillas y estilos.

## 1. Requisitos previos
- Instala Pandoc ([instrucciones aquí](https://pandoc.org/installing.html)).
- Descarga los archivos necesarios: `macro.tex`, `remove-num.lua`, `reveal.html` y `style.css` desde la carpeta `pandoc-files/` y `styles/` del repositorio.

## 2. Conversión a presentación Reveal.js

```bash
pandoc -s --mathjax -t revealjs -i macro.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=reveal.html -c /styles/style.css
```
- `macro.tex`: tu archivo fuente LaTeX.
- `OUTPUT.html`: nombre del archivo HTML generado.
- `reveal.html`: archivo HTML macro que contiene codigo general
- `remove-num.lua`: elimina numeraciones.
- `style.css`: hoja de estilos.

## 3. Recomendaciones
- Ubica todos los archivos necesarios en la misma carpeta o ajusta las rutas en los comandos.
- Es importante usar la ruta `/styles/style.css` en el comando de conversión, pues esa es la ruta que se usa en el servidor.
- Revisa el resultado y ajusta el contenido si es necesario (ver [limitaciones](como-usar-pandoc.md#limitaciones-de-la-conversión-de-beamer-a-revealjs)). En esta parte se deben hacer los ajustes respecto a las pausas del beamer.

## 4. Recursos útiles
- [Documentación Pandoc](https://pandoc.org/MANUAL.html)
- [Documentación Reveal.js](https://revealjs.com/)
- [Documentación MathJax](https://mathjax.org/)

---