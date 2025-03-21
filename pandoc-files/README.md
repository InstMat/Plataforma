Para convertir un archivo .tex a uno .html de una sola página usando mathjax y un style determinado

```
pandoc -s --mathjax -i INPUT.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=default.html -c style.css
```

---

Para convertir un archivo .tex beamer a uno .html en formato presentación usando mathjax y un style determinado
```
pandoc -s --mathjax -t revealjs -i INPUT.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=reveal.html -c style.css
````

La inicialización de reveal se debe hacer en el archivo reveal-init.js con la ruta adecuada 

---

El archivo remove-num.lua remueve la numeración de los entornos example, theorem, etc. del archivo html
