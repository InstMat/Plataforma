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
- `reveal.html`: archivo HTML macro que contiene codigo general.
- `remove-num.lua`: elimina numeraciones.
- `style.css`: hoja de estilos.

## 3. Recomendaciones
- Ubica todos los archivos necesarios en la misma carpeta o ajusta las rutas en los comandos.
- Es importante usar la ruta `/styles/style.css` en el comando de conversión, pues esa es la ruta que se usa en el servidor. Para pruebas locales basta usar
```bash
pandoc -s --mathjax -t revealjs -i macro.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=reveal.html -c style.css
```
- Revisa el resultado y ajusta el contenido si es necesario (ver [limitaciones](como-usar-pandoc.md#limitaciones-de-la-conversión-de-beamer-a-revealjs)). En esta parte se deben hacer los ajustes respecto a las pausas del beamer y otros posibles problemas.

## Preprocesamiento de archivos LaTeX

Antes de convertir tus archivos `.tex` con Pandoc, puedes usar el script [`refinar-tex.py`](../pandoc-files/refinar-tex.py) para limpiar comandos Beamer y adaptar bloques al formato compatible con Pandoc/Reveal.js.

### ¿Cómo usar el script?

**Nota:** Debes tener instalado `python3` en tu sistema para ejecutar el script.

#### Instalación de Python3

- **Windows/macOS/Linux:**
   - Ve a la página oficial: https://www.python.org/downloads/
   - Descarga el instalador para tu sistema operativo y sigue las instrucciones.
   - Verifica la instalación abriendo una terminal y ejecutando:
      ```bash
      python3 --version
      ```
      Deberías ver la versión instalada.

#### Ejecución en sistemas online

Si no quieres instalar Python localmente, puedes usar entornos online como [Replit](https://replit.com/) o [Gitpod](https://gitpod.io/):
- Sube tu archivo `.tex` y el script `refinar-tex.py`.
- Abre una terminal en el entorno online y ejecuta el script igual que en local:
   ```bash
   python3 refinar-tex.py -i INPUT.tex -o OUTPUT.tex
   ```

1. Abre una terminal y navega a la carpeta donde está tu archivo `.tex` y el script `refinar-tex.py`.
2. Ejecuta el script indicando el archivo de entrada y el de salida:
   ```bash
   python3 refinar-tex.py -i INPUT.tex -o OUTPUT.tex
   ```
3. El archivo de salida (`OUTPUT.tex`) será el que usarás como entrada para Pandoc.

**¿Qué hace el script?**
- Elimina comandos `\onslide` y `\pause` que no son bien manejados por pandoc.
- Convierte bloques Beamer en formato `\begin{block}{Teorema}`, `\begin{block}{Nota}`, `\begin{block}{Ejemplo}` a entornos estándar `\begin{theorem}`, `\begin{remark}`, `\begin{example}`. Solo funciona con algunos casos. *En caso de no estar seguro, se recomienda hacer los cambios de manera manual*.
- Elimina los entornos `multicols` y `minipage`, conservando el contenido interno (por ejemplo, si tienes `\begin{multicols}{4} ... \end{multicols}`, el resultado será solo el contenido interno).
- Ajusta los frames para compatibilidad con Pandoc. Si el beamer tiene el formato `\begin{frame}{Título}\end{frame}` lo convierte a `\begin{frame}\frametitle{Título}\end{frame}`.

Revisa y ajusta el script según tus necesidades. Puedes agregar más patrones para otros comandos o bloques.

## 4. Recursos útiles
- [Documentación Pandoc](https://pandoc.org/MANUAL.html)
- [Documentación Reveal.js](https://revealjs.com/)
- [Documentación MathJax](https://mathjax.org/)

---