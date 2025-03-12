Para convertir tex a html usando mathjax y un style determinado

pandoc -s --mathjax -i INPUT.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=default.html -c style.css


---------------
Como presentación

pandoc -s --mathjax -t revealjs -i INPUT.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=reveal.html -c style.css
