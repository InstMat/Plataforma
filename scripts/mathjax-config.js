window.MathJax = {
    loader: {
		load: ['[tex]/ams','[tex]/cancel','[tex]/color']
	},
	tex: {
		inlineMath: {'[+]':[['$', '$'], ['\\(', '\\)']]},
		displayMath: {'[+]':[['$$', '$$'], ['\\[', '\\]']]},
		packages: {'[+]': ['ams','cancel','color']},
		tags: 'ams'
	},
	options: {
		renderActions: {
			addMenu: []
		}
    },	
	svg: {
    	fontCache: 'global'
    },
	chtml: {
    	//matchFontHeight: false,
    	//mtextInheritFont: true,    // hace que el texto normal herede la fuente de la página
    	//mathmlSpacing: true        // mejora el espaciado para que coincida mejor
    },
    output: {
        font: 'mathjax-fira'
    }
};

(function () {
  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js';
  script.defer = true;
  document.head.appendChild(script);
})();