# Cómo editar el archivo HTML generado por Pandoc con Reveal.js

Este documento explica cómo personalizar y editar el archivo HTML generado por Pandoc usando la plantilla [Reveal.js](https://revealjs.com/) para presentaciones.

## 1. Estructura básica del archivo
- El encabezado del archivo HTML es generado automáticamente por Pandoc usando el archivo `reveal.html` o `default.html`como base. Se recomienda no modificar esta parte
- Se recomienda solo editar los contenidos dentro del entorno HTML `<body>...</body>` que es lo que se muestra en la página web.
- Dentro del entorno `body` se encuentra la estructura básica de Reveal.js: cada sección `<section>..</section>` corresponde a un `frame` de LaTeX.

## 2. Edición básica
- Puedes abrir el archivo HTML en cualquier editor de texto (VS Code, Sublime, Notepad++). Se recomienda VS Code, pues se puede integrar con [GitHub Copilot](https://github.com/features/copilot) (la IA de Github) que puede ayudar en la edición del archivo.
- Para modificar el contenido de una slide, busca la sección correspondiente:
  ```html
  <section>
    <h2>Título</h2>
    <p>Contenido...</p>
  </section>
  ```
- Puedes agregar, quitar o modificar texto, fórmulas (MathJax), imágenes, enlaces, etc.

## 3. Personalización avanzada
- Para cambiar el diseño, edita las clases CSS o agrega estilos en el `<head>` o en el archivo `style.css`.
- Puedes agregar fragmentos (pausas) Reveal.js usando la clase `fragment` en cualquier elemento HTML, como `<li>`, `<div>`, `<p>`, `<img>`, etc. Ejemplo:
  ```html
  <li class="fragment">Elemento que aparece con animación</li>
  <div class="fragment">Este bloque aparece con animación</div>
  <p class="fragment">Este párrafo aparece con animación</p>
  <img class="fragment" src="imagen.png" alt="Imagen animada">
  ```
- En el archivo `style.css` está formateada una clase especial para emular el uso de `multicols` para listas. Por ejemplo si se tiene
```html
<ol>
    <li>1</li>
    <li>2</li>
</ol>
```
está la opcion de mostrar la lista en 2 columnas usando la clase `two-columns`
```html
<ol class="two-columns">
    <li>1</li>
    <li>2</li>
</ol>
```
Esta clase también funciona en el entorno de listas no enumeradas `<ul>`. Por ahora solo está implementada la case para 2 columnas. Para mayor cantidad de columnas no hay clase implementada.
- Para agregar notas del presentador, usa:
  ```html
  <aside class="notes">Texto de la nota</aside>
  ```
- Reveal.js tiene una opción que no tiene Beamer que se puede agregar manualmente: se pueden poner slides dentro de slides generando "slides verticales". Un ejemplo de esto es
```html
<section>
Slide tradicional 1
</section>
<section>
    <section>Slide vertical 2.1</section>
    <section>Slide vertical 2.2</section>
    <section>Slide vertical 2.3</section>
</section>
```
El resultado de esto es una estructura de "sub-secciones" que puede ser útil para presentaciones largas.

## 4. Integración con MathJax
- La conversión Pandoc deja las fórmulas con el formato
```html
<span class="math inline">\(x^n+y^n=z^n\)</span>
```
o
```html
<span class="math display">\[e^{i\pi}+1=0\]</span>
```
pero el entorno `span` no es necesario. Por ejemplo si se escribe
```html
\[e^{i\pi}+1=0\]
```
automáticamente se muestra la fórmula en formato `display`, tal como en LaTeX.
- MathJax también funciona adecuadamente con `\label` dentro de entornos `equation`. Para que esto funcione se debe escribir
```html
\[
\begin{equation}\label{eq:1} ... \end{equation}
\]
```
(notar el uso de `\[...\]`). Luego si se quiere referenciar la ecuación se debe escribir directamente en el HTML
```html
\eqref{eq:1}
```
(acá no es necesario usar `\[...\]`).
- MathJax no reconoce los entornos `\begin{theorem}` (o similares) de manera nativa. Pandoc hace la conversión a un entorno HTML `<div class="theorem">` (o similar) el cual es formateado usando el archivo `style.css`. Esto se hace con cualquier entorno LaTeX, por ejemplo
```tex
\begin{center}...\end{center}
```
 es transformado por Pandoc a
```html
<div class="center">...</div>
```

## 5. Ejemplo de un slide con Reveal.js generado por Pandoc
Si el archivo `.tex` contiene
```tex
\begin{frame}
    \frametitle{Título del slide}
    Primer párrafo
    Segundo párrafo luego de una pausa
    \begin{theorem}Un teorema \[a^2+b^2=c^2\].</end{theorem}>
    \begin{enumerate}
    \item 1
    \item 2
    \end{enumerate}
\end{frame}
```
esto se transforma a `.html` (notar que se ponen pausas a cada `item`)
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
Si se quieren agregar pausas adicionales se debe editar el archivo HTML
```html
<section>
    <h2>Título del slide</h2>
    <p>Primer párrafo.</p>
    <p class="fragment">Segundo párrafo luego de una pausa.</p>
    <div class="theorem fragment">Un teorema luego de una pausa \[a^2+b^2=c^2.\]</div>
</section>
```

## 6. Recomendaciones
- Haz una copia de seguridad antes de editar el HTML.
- Si editas el HTML manualmente, evita volver a sobrescribirlo con Pandoc para no perder los cambios.
- Para cambios globales, edita la plantilla `reveal.html` o el archivo `style.css`.

## 7. Recursos útiles
- [Documentación Reveal.js](https://revealjs.com/)
- [Documentación MathJax](https://mathjax.org/)
- [Guía de Pandoc](https://pandoc.org/MANUAL.html)

---

¿Tienes dudas o sugerencias? Edita este documento en el wiki o consulta al equipo de desarrollo.
