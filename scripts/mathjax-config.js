window.MathJax = {
	loader: {
		load: ['[tex]/ams', '[tex]/cancel', '[tex]/color', 'output/svg']
	},
	tex: {
		inlineMath: { '[+]': [['$', '$'], ['\\(', '\\)']] },
		displayMath: { '[+]': [['$$', '$$'], ['\\[', '\\]']] },
		packages: { '[+]': ['ams', 'cancel', 'color'] },
		tags: 'ams',
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
		font: 'mathjax-stix2',
		/* Other fonts
		mathjax-newcm: Based on New Computer Modern (now the default font)
		mathjax-asana: A version of the Asana-Math font
		mathjax-bonum: A version of the Gyre Bonum font
		mathjax-dejavu: A version of the Gyre DejaVu font
		mathjax-fira: A version of the Fira and Fira-Math fonts
		mathjax-modern: A version of Latin-Modern
		mathjax-pagella: A version of the Gyre Pagella font
		mathjax-schola: A version of the Gyre Schola font
		mathjax-stix2: A version of the STIX2 font
		mathjax-termes: A version of the Gyre Termes font
		mathjax-tex: The original MathJax TeX font
		*/
	}
};

(function () {
	var script = document.createElement('script');
	/* script.src = 'https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js'; */
	script.src = 'https://cdn.jsdelivr.net/npm/mathjax@4/tex-svg.js	';
	script.defer = true;
	document.head.appendChild(script);
})();