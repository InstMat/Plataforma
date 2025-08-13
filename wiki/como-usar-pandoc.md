# ¿Se puede usar Pandoc online?

Existen servicios web como [Pandoc Try Online](https://pandoc.org/try/) que permiten convertir texto entre algunos formatos desde el navegador, pero **no permiten ejecutar comandos personalizados** (por ejemplo, filtros Lua, plantillas, Reveal.js, etc.).

Si necesitas ejecutar comandos avanzados o personalizados, debes instalar Pandoc en tu computador o usar un entorno online que permita acceso a la terminal, como [Replit](https://replit.com/), [Gitpod](https://gitpod.io/) o [Google Colab](https://colab.research.google.com/) (requiere instalar Pandoc y archivos necesarios en cada notebook), donde puedes instalar Pandoc y ejecutar cualquier comando.

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

# Archivos opcionales para la conversión

Para usar los comandos personalizados de Pandoc en este proyecto, necesitas los siguientes archivos:

- [`remove-num.lua`](../pandoc-files/remove-num.lua): Filtro Lua para eliminar numeración de teoremas.
- [`reveal.html`](../pandoc-files/reveal.html): Plantilla personalizada para presentaciones Reveal.js.
- [`default.html`](../pandoc-files/default.html): Plantilla personalizada para exportar páginas HTML simples.
- [`style.css`](../styles/style.css): Hoja de estilos para la presentación y páginas HTML. Acá se personalizan los entornos tipo `theorem` y similares.
- [`refinar-tex.py`](../pandoc-files/refinar-tex.py): Script Python para limpiar y adaptar archivos LaTeX/Beamer antes de la conversión.

Puedes descargarlos directamente desde el repositorio en la carpeta `pandoc-files/` o copiarlos desde este proyecto si ya lo tienes clonado.

**Ejemplo de descarga manual:**

1. Ve a la carpeta `pandoc-files/` y `styles/` en el repositorio.
2. Haz clic derecho sobre el archivo (`remove-num.lua`, `reveal.html`, `default.html`, `style.css`) y selecciona "Descargar" o "Guardar enlace como...".
3. Ubica los archivos en la misma carpeta donde ejecutarás los comandos Pandoc, o asegúrate de que la ruta en el comando coincida con la ubicación del archivo `style.css`.

# Cómo usar Pandoc

1. Para convertir archivos `.tex` a HTML básico de una sola página sin formato especial:
   ```bash
   pandoc -s --mathjax -i INPUT.tex -o OUTPUT.html
   ```
2. Para convertir archivos `.tex` a HTML básico de una sola página usando el formato especial:
   ```bash
   pandoc -s --mathjax -i INPUT.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=default.html
   ```
3. Para generar una presentación Reveal.js (a partir de un Beamer) sin formato especial:
   ```bash
   pandoc -s --mathjax -t revealjs -i INPUT.tex -o OUTPUT.html
   ```
3. Para generar una presentación Reveal.js (a partir de un Beamer) usando el formato especial:
   ```bash
   pandoc -s --mathjax -t revealjs -i INPUT.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=reveal.html -c style.css
   ```

# Limitaciones de la conversión de Beamer a Reveal.js

La conversión de LaTeX/Beamer a HTML/Reveal.js usando Pandoc tiene varias limitaciones:

- **No todos los comandos y entornos de Beamer son soportados.** Algunos estilos, bloques personalizados, animaciones y overlays pueden perderse o no traducirse correctamente. Algunos entornos que no funcionan bien son `multicols` y `minipage`, pero pueden haber otros que no he revisado.
- **Fragmentos y transiciones:** Para las presentaciones Beamer, las pausas (`\pause`, `\onslide`, overlays) no son correctamente convertidas por Pandoc. Sin embargo, Pandoc incorpora automaticamente las pausas en los entornos `enumerate` e `itemize` de LaTeX. Estos entornos son transformados de
```tex
\begin{enumerate}
   \item ...
\end{enumerate}
```
a
```html
<ol>
   <li class="fragment"> ... </li>
</ol>
```
Como se ve en el ejemplo anterior, Reveal.js tiene su propio sistema de pausas (`fragments`) las cuales se deben incorporar manualmente en el documento HTML para pausas fuera de entornos de listas.
Para agregar manualmente una pausa en el archivo HTML se debe incorporar la linea `class="fragment"` dentro de un entorno HTML (`<div>`, `<p>`, `<img>`, etc.).
- **Diseño y formato:** El diseño visual (colores, fondos, temas) puede diferir, ya que Reveal.js usa CSS y HTML, no los temas de Beamer. Al no usar el formato especial, el archivo HTML generado será "plano". Para agregar diseños y formatos especiales se debe configurar manualmente en el archivo `style.css`.
- **Matemáticas:** Las fórmulas matemáticas se renderizan automáticamente con MathJax ([ver documentación](https://mathjax.org/)), pero algunos paquetes o comandos avanzados de LaTeX pueden no ser compatibles. 
- **Notas y referencias:** Las notas del presentador, referencias, notas al pie de página, etc. pueden requerir ajustes manuales.
- **Tablas y gráficos:** Tablas complejas, gráficos TikZ y algunos entornos avanzados pueden no convertirse correctamente.

**Recomendación:** Revisa y ajusta manualmente la presentación convertida. Prueba los comandos y entornos antes de usar conversiones masivas.

## Tutoriales recomendados

Consulta el tutorial: [Cómo usar Pandoc para obtener los mismos resultados que el sitio](tutorial-pandoc-resultados.md)
Consulta también el tutorial: [Cómo editar el HTML generado por Pandoc con Reveal.js](como-editar-html-revealjs.md)

En estos tutoriales se explica paso a paso cómo configurar y ejecutar Pandoc para generar presentaciones y páginas HTML idénticas a las del sitio, incluyendo filtros, plantillas y estilos.

---