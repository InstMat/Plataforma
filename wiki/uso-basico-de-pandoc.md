# Uso básico de Pandoc

Existen servicios web como [Pandoc Try Online](https://pandoc.org/try/) que permiten convertir texto entre algunos formatos desde el navegador, pero **no permiten ejecutar comandos personalizados** (por ejemplo, filtros Lua, plantillas, Reveal.js, etc.).

Si necesitas ejecutar comandos avanzados o personalizados, debes instalar Pandoc en tu computador o usar un entorno online que permita acceso a la terminal, como [Replit](https://replit.com/), [Gitpod](https://gitpod.io/) o [Google Colab](https://colab.research.google.com/) (requiere instalar Pandoc y archivos necesarios en cada notebook), donde puedes instalar Pandoc y ejecutar cualquier comando.

**Recomendación:** Para proyectos que requieren filtros, plantillas o integración avanzada, usa Pandoc instalado localmente o en un entorno online con terminal.

## Instalación de Pandoc

1. Ve a la página oficial: [https://pandoc.org/installing.html](https://pandoc.org/installing.html)
2. Descarga el instalador para tu sistema operativo (Windows, macOS o Linux).
3. Sigue las instrucciones del instalador.
4. Verifica la instalación abriendo una terminal y ejecutando:

```bash
pandoc --version
```

Deberías ver la versión instalada y detalles del sistema.

## ¿Cómo usar Pandoc?

### 1. Convertir LaTeX a HTML básico

Para convertir archivos `.tex` a HTML básico de una sola página sin formato especial:

```bash
pandoc -s --mathjax -i INPUT.tex -o OUTPUT.html
```

### 2. Generar presentación Reveal.js

Para generar una presentación Reveal.js (a partir de un Beamer) sin formato especial:

```bash
pandoc -s --mathjax -t revealjs -i INPUT.tex -o OUTPUT.html
```

## Limitaciones de la conversión de Beamer a Reveal.js

La conversión de LaTeX/Beamer a HTML/Reveal.js usando Pandoc tiene varias limitaciones:

### Comandos y entornos no soportados

**No todos los comandos y entornos de Beamer son soportados.** Algunos estilos, bloques personalizados, animaciones y overlays pueden perderse o no traducirse correctamente. Algunos entornos que no funcionan bien son `multicols` y `minipage`, pero pueden haber otros que no he revisado.

### Fragmentos y transiciones

Para las presentaciones Beamer, las pausas (`\pause`, `\onslide`, overlays) no son correctamente convertidas por Pandoc. Sin embargo, Pandoc incorpora automáticamente las pausas en los entornos `enumerate` e `itemize` de LaTeX. 

Estos entornos son transformados de:

```latex
\begin{enumerate}
   \item ...
\end{enumerate}
```

a:

```html
<ol>
   <li class="fragment"> ... </li>
</ol>
```

Como se ve en el ejemplo anterior, Reveal.js tiene su propio sistema de pausas (`fragments`) las cuales se deben incorporar manualmente en el documento HTML para pausas fuera de entornos de listas. 

Para agregar manualmente una pausa en el archivo HTML se debe incorporar la línea `class="fragment"` dentro de un entorno HTML (`<div>`, `<p>`, `<img>`, etc.).

### Diseño y formato

El diseño visual (colores, fondos, temas) puede diferir, ya que Reveal.js usa CSS y HTML, no los temas de Beamer. Al no usar el formato especial, el archivo HTML generado será "plano". Para agregar diseños y formatos especiales se debe configurar manualmente en el archivo `style.css`.

### Matemáticas

Las fórmulas matemáticas se renderizan automáticamente con MathJax, pero algunos paquetes o comandos avanzados de LaTeX pueden no ser compatibles.

### Notas y referencias

Las notas del presentador, referencias, notas al pie de página, etc. pueden requerir ajustes manuales.

### Tablas y gráficos

Tablas complejas, gráficos TikZ y algunos entornos avanzados pueden no convertirse correctamente.

> **Recomendación:** Revisa y ajusta manualmente la presentación convertida. Prueba los comandos y entornos antes de usar conversiones masivas.

## Tutoriales recomendados

- Consulta el tutorial: [Uso personalizado de Pandoc y Reveal.js](uso-personalizado-de-pandoc-y-revealjs.md) para obtener resultados similares a los del sitio
- Consulta también el tutorial: [Editando HTML y Reveal.js](editando-html-y-revealjs.md) para hacer edición personalizada del HTML generado.

---

*Última actualización: agosto 2025*
