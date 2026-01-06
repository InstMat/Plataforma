# ¿Cómo usar Pandoc para obtener los mismos resultados que el sitio?

Este tutorial te guía paso a paso para convertir archivos LaTeX-Beamer (`.tex`) en presentaciones Reveal.js y páginas HTML idénticas a las del sitio, usando los mismos filtros, plantillas y estilos.

## 1. Requisitos previos

- Instala Pandoc ([instrucciones aquí](https://pandoc.org/installing.html)).
- Clona el repositorio en tu computador:
  ```bash
  git clone https://github.com/InstMat/Plataforma.git
  ```
  o descarga el archivo zip desde [aquí](https://github.com/InstMat/Plataforma/archive/refs/heads/main.zip) y descomprímelo.
- Ubica los archivos `macro.tex` y `reveal.html` en la carpeta `Plataforma/wiki/`. Se recomienda usar el archivo [macro.tex](macro.tex) como plantilla beamer base.

## 2. Conversión a presentación Reveal.js

En la carpeta `Plataforma/wiki/` (o en la carpeta donde hayas descargado los archivos `macro.tex`, `reveal.html` y `remove-num.lua`), abre una terminal y ejecuta el siguiente comando:

```bash
pandoc -s --mathjax -t revealjs -i macro.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=reveal.html
```

### Parámetros:

- `macro.tex`: tu archivo fuente LaTeX.
- `OUTPUT.html`: nombre del archivo HTML generado.
- `reveal.html`: archivo HTML macro que contiene código general necesario para el funcionamiento en el sitio.
- `remove-num.lua`: elimina numeraciones automáticas de algunos entornos (opcional).

El archivo `OUTPUT.html` generado de esta manera no tendrá formato. Para probar la conversión, ubica el archivo en la carpeta `/data/TEST/UnidadI` e ingresa al sitio usando:

```
http://localhost:8000/curso.html?base=TEST&titulo=M%C3%B3dulo%20de%20prueba&carrera=test-carrera
```

Recuerda que primero debes iniciar el servidor local con:

```bash
python3 -m http.server 8000
```

en la carpeta raíz del sitio.

## 3. Recomendaciones

- Ubica los archivos `macro.tex`, `reveal.html` y `remove-num.lua` en la misma carpeta o ajusta las rutas en los comandos.
- Revisa el resultado `OUTPUT.html` y ajusta el contenido si es necesario (ver [limitaciones](uso-basico-de-pandoc.md#limitaciones-de-la-conversión-de-beamer-a-revealjs)). En esta parte se deben hacer los ajustes respecto a las pausas del Beamer y otros posibles problemas.

## 4. Opcional: preprocesamiento de archivos LaTeX

Antes de convertir tus archivos `.tex` con Pandoc, puedes usar el script [refinar-tex.py](refinar-tex.py) para limpiar comandos Beamer y adaptar bloques al formato compatible con Pandoc/Reveal.js.

### ¿Cómo usar el script python?

**Nota:** Debes tener instalado `python3` en tu sistema para ejecutar el script.

#### Instalación de Python3 en Windows/macOS/Linux:

1. Ve a la página oficial: [python.org](https://www.python.org/downloads/).
2. Descarga el instalador para tu sistema operativo y sigue las instrucciones.
3. Verifica la instalación abriendo una terminal y ejecutando:
   ```bash
   python3 --version
   ```
   Deberías ver la versión instalada.

#### Ejecución en sistemas online

Si no quieres instalar Python localmente, puedes usar entornos online como [Replit](https://replit.com/) o [Gitpod](https://gitpod.io/):

1. Sube tu archivo `.tex` y el script `refinar-tex.py`.
2. Abre una terminal en el entorno online y ejecuta el script igual que en local:
   ```bash
   python3 refinar-tex.py -i INPUT.tex -o OUTPUT.tex
   ```

#### Ejecución local

Si tienes instalado Python en tu computador:

1. Abre una terminal y navega a la carpeta donde está tu archivo `.tex` y el script `refinar-tex.py`.
2. Ejecuta el script indicando el archivo de entrada y el de salida:
   ```bash
   python3 refinar-tex.py -i INPUT.tex -o OUTPUT.tex
   ```
3. El archivo de salida (`OUTPUT.tex`) será el que usarás como entrada para Pandoc.

### ¿Qué hace el script?

- Elimina comandos `\onslide` y `\pause` que no son bien manejados por Pandoc.
- Convierte bloques Beamer en formato `\begin{block}{Teorema}`, `\begin{block}{Nota}`, `\begin{block}{Ejemplo}` a entornos estándar `\begin{theorem}`, `\begin{remark}`, `\begin{example}`. Solo funciona con algunos casos. *En caso de no estar seguro, se recomienda hacer los cambios de manera manual*.
- Elimina los entornos `multicols` y `minipage`, conservando el contenido interno.
- Ajusta los frames para compatibilidad con Pandoc. Si el Beamer tiene el formato `\begin{frame}{Título}` lo convierte a `\begin{frame}\frametitle{Título}`.

Revisa y ajusta el script según tus necesidades. Puedes agregar más patrones para otros comandos o bloques.

## 5. Recursos útiles

- [Documentación Pandoc](https://pandoc.org/MANUAL.html)
- [Documentación Reveal.js](https://revealjs.com/)
- [Documentación MathJax](https://mathjax.org/)

---

*Última actualización: agosto 2025*
