# ¿Cómo editar el archivo HTML generado por Pandoc con Reveal.js?

Este documento explica cómo personalizar y editar el archivo HTML generado por Pandoc usando la plantilla [Reveal.js](https://revealjs.com/) para presentaciones.

## 1. Estructura básica del archivo

El archivo `OUTPUT.html` generado por Pandoc tiene la siguiente estructura básica:

```html
<div class="slides">
    <!--Title page (esta slide será reemplazada automáticamente por el sitio)-->
    <section id="title-slide">
        <h1 class="title">Título completo (Acá va el nombre del módulo)</h1>
        <p class="subtitle">Subtítulo (Acá puede ir el nombre de la carrera)</p>
        <p class="author">Autor y/o logo</p>
    </section>
    
    <!-- Table of Contents (si es que la hay) -->
    
    <!-- Slides -->
    <section id="título-de-la-diapositiva" class="slide level3 frame">
        <h3>Título de la diapositiva</h3>
        <div class="definition">
            <p> </p>
        </div>
        <div class="theorem">
            <p> </p>
        </div>
        <div class="proof">
            <p><em>Proof.</em> ◻</p>
        </div>
        <div class="proposition">
            <p><strong> 1</strong>. </p>
        </div>
        <div class="corollary">
            <p> </p>
        </div>
        <div class="lemma">
            <p><strong> 1</strong>. </p>
        </div>
        <div class="remark">
            <p> </p>
        </div>
    </section>
  
    <section id="título" class="slide level3 frame">
        <h3>Título</h3>
        <div class="example">
            <p> </p>
        </div>
        <div class="exercise">
            <p><strong> 1</strong>. </p>
        </div>
        <div class="solution">
            <p> </p>
        </div>
        <div class="block">
        </div>
    </section>
</div>
```

- El encabezado del archivo HTML es generado automáticamente por el sitio una vez que se carga en la carpeta `data`. No se debe agregar contenido.
- A partir de la etiqueta `<!-- Slides -->` se encuentra la estructura básica de Reveal.js: cada sección `<section>..</section>` corresponde a un `frame` de LaTeX.

## 2. Edición básica

- Si no sabes HTML puedes revisar el tutorial de [W3Schools](https://www.w3schools.com/html).
- Abre el archivo HTML en cualquier editor de texto (VS Code, Sublime, Notepad++). Se recomienda VS Code por su integración con [GitHub Copilot](https://github.com/features/copilot).
- Para modificar el contenido de una slide, busca la sección correspondiente:

```html
<section>
    <h2>Título</h2>
    <p>Contenido...</p>
</section>
```

Puedes agregar, quitar o modificar texto, fórmulas (MathJax), imágenes, videos, enlaces, etc.

## 3. Personalización avanzada

### Estilos CSS

Para cambiar el diseño, edita las clases CSS o agrega estilos en el `<head>` o en el archivo `style.css`.

### Fragmentos (pausas) Reveal.js

Agrega fragmentos usando la clase `fragment`:

```html
<li class="fragment">Elemento animado</li>
<div class="fragment">Bloque animado</div>
<p class="fragment">Párrafo animado</p>
<img class="fragment" src="imagen.png" alt="Imagen animada">
```

### Listas en dos columnas

En el archivo `style.css` está definida una clase para emular `multicols` en listas:

```html
<ol class="two-columns">
    <li>1</li>
    <li>2</li>
</ol>
```

También funciona con `<ul>`. Por ahora solo está implementada la clase para 2 columnas.

### Notas del presentador

Para agregar notas del presentador:

```html
<aside class="notes">Texto de la nota</aside>
```

### Slides verticales

Reveal.js también permite slides verticales:

```html
<section>Slide tradicional 1</section>
<section>
    <section>Slide vertical 2.1</section>
    <section>Slide vertical 2.2</section>
    <section>Slide vertical 2.3</section>
</section>
```

## 4. Integración con MathJax

### Formato de fórmulas

La conversión Pandoc deja las fórmulas con el formato:

```html
<span class="math inline">\(x^n+y^n=z^n\)</span>
```

o

```html
<span class="math display">\[e^{i\pi}+1=0\]</span>
```

El entorno `span` no es necesario. Basta con:

```latex
\[e^{i\pi}+1=0\]
```

### Referencias a ecuaciones

MathJax funciona con `\label` dentro de entornos `equation`:

```latex
\[
    \begin{equation}\label{eq:1} ... \end{equation}
\]
```

**Notar que se debe usar `\[..\]` para poder usar entornos LaTeX como `\begin{equation}...\end{equation}`**. 

Luego puedes referenciar la ecuación en cualquier parte de la página usando:

```latex
\eqref{eq:1}
```

### Conversión de entornos

Pandoc convierte entornos LaTeX a divs HTML:

```latex
\begin{center}...\end{center}
```

se transforma automáticamente en:

```html
<div class="center">...</div>
```

## 5. Ejemplo de un slide generado por Pandoc

### Entrada `.tex`:

```latex
\begin{frame}
    \frametitle{Título del slide}
    Primer párrafo
    Segundo párrafo luego de una pausa
    \begin{theorem}Un teorema \[a^2+b^2=c^2\].\end{theorem}
    \begin{enumerate}
        \item 1
        \item 2
    \end{enumerate}
\end{frame}
```

### Salida `.html`:

```html
<section>
    <h2>Título del slide</h2>
    <p>Primer párrafo.</p>
    <p>Segundo párrafo luego de una pausa.</p>
    <div class="theorem">Un teorema \[a^2+b^2=c^2.\]</div>
    <ol>
        <li class="fragment"><p>1</p></li>
        <li class="fragment"><p>2</p></li>
    </ol>
</section>
```

### Añadiendo pausas adicionales

Se pueden agregar pausas adicionales en el `.html` resultante. Por ejemplo, para poner una pausa antes de que aparezca el teorema se incluye `fragment` en la clase del `div` del teorema:

```html
<section>
    <h2>Título del slide</h2>
    <p>Primer párrafo.</p>
    <p>Segundo párrafo luego de una pausa.</p>
    <div class="theorem fragment">Un teorema \[a^2+b^2=c^2.\]</div>
    <ol>
        <li class="fragment"><p>1</p></li>
        <li class="fragment"><p>2</p></li>
    </ol>
</section>
```

## 6. Recomendaciones

- Haz una copia de seguridad antes de editar el HTML.
- Si editas el HTML manualmente, evita sobrescribirlo con Pandoc.
- Usa un editor con resaltado de sintaxis (VS Code recomendado).
- Prueba tus cambios frecuentemente en el navegador.

---

*Última actualización: agosto 2025*
