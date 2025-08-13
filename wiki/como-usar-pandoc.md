# Archivos necesarios para la conversión

Para usar los comandos personalizados de Pandoc en este proyecto, necesitas los siguientes archivos:

- [`remove-num.lua`](../pandoc-files/remove-num.lua): Filtro Lua para eliminar numeración de teoremas.
- [`reveal.html`](../pandoc-files/reveal.html): Plantilla personalizada para presentaciones Reveal.js.

Puedes descargarlos directamente desde el repositorio en la carpeta `pandoc-files/` o copiarlos desde este proyecto si ya lo tienes clonado.

**Ejemplo de descarga manual:**

1. Ve a la carpeta `pandoc-files/` en el repositorio.
2. Haz clic derecho sobre el archivo y selecciona "Descargar" o "Guardar enlace como...".
3. Ubica los archivos en la misma carpeta donde ejecutarás los comandos Pandoc.
# ¿Se puede usar Pandoc online?

Existen servicios web como [Pandoc Try Online](https://pandoc.org/try/) que permiten convertir texto entre algunos formatos desde el navegador, pero **no permiten ejecutar comandos personalizados** (por ejemplo, filtros Lua, plantillas, Reveal.js, etc.).

Si necesitas ejecutar comandos avanzados o personalizados, debes instalar Pandoc en tu computador o usar un entorno online que permita acceso a la terminal, como Replit, Gitpod o similares, donde puedes instalar Pandoc y ejecutar cualquier comando.

**Recomendación:** Para proyectos que requieren filtros, plantillas o integración avanzada, usa Pandoc instalado localmente o en un entorno online con terminal.

# Instalación de Pandoc

1. Ve a la página oficial: https://pandoc.org/installing.html
2. Descarga el instalador para tu sistema operativo (Windows, macOS o Linux).
3. Sigue las instrucciones del instalador.
4. Verifica la instalación abriendo una terminal y ejecutando:
   ```bash
   pandoc --version
   ```
   Deberías ver la versión instalada y detalles del sistema.

# Cómo usar Pandoc

1. Para convertir archivos `.tex` a HTML de una sola página:
   ```bash
   pandoc -s --mathjax -i INPUT.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=default.html -c style.css
   ```
2. Para generar una presentación Reveal.js:
   ```bash
   pandoc -s --mathjax -t revealjs -i macro.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=reveal.html -c /styles/style.css
   ```
3. Compila los temas Sass si es necesario antes de exportar.
