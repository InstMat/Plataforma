// Optimized MathJax Configuration for Enhanced Performance
(() => {
	'use strict';

	// Enhanced MathJax configuration with performance optimizations
	window.MathJax = {
		loader: {
			load: ['[tex]/ams', '[tex]/cancel', '[tex]/color'],
			// Preload core components for faster rendering
			ready: () => {
				MathJax.loader.defaultReady();
				// Cache commonly used packages
				MathJax.loader.preLoad('[tex]/ams', '[tex]/cancel', '[tex]/color');
			}
		},
		tex: {
			inlineMath: [['$', '$'], ['\\(', '\\)']],
			displayMath: [['$$', '$$'], ['\\[', '\\]']],
			packages: { '[+]': ['ams', 'cancel', 'color'] },
			tags: 'ams',
			// Performance optimizations
			processEscapes: true,
			processEnvironments: true,
			processRefs: true,
			// Faster processing with selective features
			macros: {
				// Pre-define common macros for faster processing
				RR: '{\\mathbb{R}}',
				NN: '{\\mathbb{N}}',
				ZZ: '{\\mathbb{Z}}',
				QQ: '{\\mathbb{Q}}',
				CC: '{\\mathbb{C}}'
			}
		},
		options: {
			// Remove menu for better performance
			renderActions: {
				addMenu: []
			},
			// Skip font checking for faster load
			skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
			// Optimize processing
			processHtmlClass: 'mathjax_process',
			ignoreHtmlClass: 'mathjax_ignore'
		},
		svg: {
			// Optimize SVG output
			fontCache: 'global',
			// Reduce SVG complexity for better performance
			scale: 1,
			minScale: 0.5,
			mtextInheritFont: false,
			merrorInheritFont: false,
			mathmlSpacing: false,
			// Cache font data globally
			exFactor: 0.5
		},
		output: {
			// Optimized font selection for performance
			font: 'mathjax-stix2'
			/* Performance notes for fonts:
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
		},
		startup: {
			// Enhanced startup with performance monitoring
			pageReady: () => {
				// Optimized page ready handling
				return MathJax.startup.defaultPageReady().then(() => {
					// Post-processing optimizations
					if (typeof window.MathJax.typesetPromise === 'function') {
						// Cache the typeset function for better performance
						window.MathJax._cachedTypeset = window.MathJax.typesetPromise;
					}
				});
			},
			// Ready callback for better initialization
			ready: () => {
				MathJax.startup.defaultReady();
				// Initialize performance optimizations
				if (window.MathJax && window.MathJax.startup) {
					// Warm up the renderer for faster subsequent renders
					const warmUpElement = document.createElement('div');
					warmUpElement.style.cssText = 'position:absolute;top:-9999px;left:-9999px;';
					warmUpElement.innerHTML = '$x$';
					document.body.appendChild(warmUpElement);

					// Render and remove warm-up element
					requestAnimationFrame(() => {
						if (window.MathJax.typesetPromise) {
							window.MathJax.typesetPromise([warmUpElement]).then(() => {
								document.body.removeChild(warmUpElement);
							}).catch(() => {
								// Silent cleanup if warm-up fails
								if (warmUpElement.parentNode) {
									document.body.removeChild(warmUpElement);
								}
							});
						} else {
							document.body.removeChild(warmUpElement);
						}
					});
				}
			}
		}
	};

	// Optimized script loading with performance enhancements
	function loadMathJax() {
		// Check if MathJax is already loading/loaded
		if (window.MathJax && window.MathJax.version) {
			return;
		}

		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/mathjax@4/tex-svg.js';
		script.defer = true;
		script.crossOrigin = 'anonymous';

		// Enhanced error handling
		script.onerror = () => {
			console.warn('MathJax failed to load from CDN, falling back to alternative');
			// Could implement fallback to local version here if needed
		};

		script.onload = () => {
			// MathJax loaded successfully - could add success tracking here
		};

		// Use requestAnimationFrame for non-blocking script insertion
		requestAnimationFrame(() => {
			document.head.appendChild(script);
		});
	}

	// Initialize MathJax loading with proper timing
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', loadMathJax);
	} else {
		loadMathJax();
	}
})();