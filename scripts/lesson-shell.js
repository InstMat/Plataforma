// lesson-shell.js - Dynamic lesson content loader
// URL Parameters: 
// - base: path to lesson file (e.g., "Ingenieria/EDO/UnidadII/clase10")
// - titulo: course title for the lesson

// Global variables for lesson content
window.lessonBase = '';
window.lessonTitulo = '';
window.lessonContentReady = false;

// Parse URL parameters
function parseParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const baseParam = urlParams.get('base') || '';
    
    // Agregar prefijo "data/" automáticamente si no está presente
    window.lessonBase = baseParam.startsWith('data/') ? baseParam : `data/${baseParam}`;
    
    window.lessonTitulo = decodeURIComponent(urlParams.get('titulo') || '');
    window.lessonCarrera = urlParams.get('carrera') || '';

    const isPrintMode = urlParams.has('print-pdf');
    if (isPrintMode) {
        // Detectar automáticamente cuando todo esté listo antes de imprimir
        waitForContentReady().then(() => {
            window.print();
        });
    }
    return isPrintMode;
}

// Función optimizada para detectar cuando todo está listo
async function waitForContentReady() {
    return new Promise((resolve) => {
        const readyStates = {
            reveal: false,
            mathJax: false,
            geoGebra: false
        };
        
        let resolved = false;
        
        // Función optimizada para verificar si todo está listo
        const checkAllReady = () => {
            if (resolved) return; // Evitar múltiples resoluciones
            
            if (readyStates.reveal && readyStates.mathJax && readyStates.geoGebra) {
                resolved = true;
                // Resolver inmediatamente sin delays innecesarios
                requestAnimationFrame(() => resolve());
            }
        };

        // 1. Detectar Reveal.js (más eficiente)
        const checkReveal = () => {
            if (resolved) return;
            
            if (window.Reveal?.isReady?.()) {
                readyStates.reveal = true;
                checkAllReady();
                return;
            }
            
            // Listener único más eficiente
            const handleRevealReady = () => {
                readyStates.reveal = true;
                checkAllReady();
            };
            
            document.addEventListener('reveal-ready', handleRevealReady, { once: true });
            
            // Fallback más eficiente con menos polling
            const pollReveal = () => {
                if (resolved) return;
                if (window.Reveal?.isReady?.()) {
                    readyStates.reveal = true;
                    checkAllReady();
                } else {
                    setTimeout(pollReveal, 200); // Menos frecuente
                }
            };
            setTimeout(pollReveal, 500); // Empezar después
            
            // Timeout de seguridad reducido
            setTimeout(() => {
                if (!resolved && !readyStates.reveal) {
                    readyStates.reveal = true;
                    checkAllReady();
                }
            }, 2000); // Reducido de 3000ms
        };

        // 2. Detectar MathJax (simplificado)
        const checkMathJax = () => {
            if (resolved) return;
            
            if (!window.MathJax?.startup) {
                readyStates.mathJax = true;
                checkAllReady();
                return;
            }
            
            // Usar Promise existente más eficientemente
            Promise.resolve(window.MathJax.startup.promise)
                .then(() => {
                    if (resolved) return;
                    
                    // Verificación simplificada de elementos matemáticos
                    const mathElements = document.querySelectorAll('mjx-container, .MathJax, [class*="math"]');
                    
                    if (mathElements.length === 0) {
                        readyStates.mathJax = true;
                        checkAllReady();
                    } else {
                        // Procesar con timeout para evitar bloqueo
                        Promise.race([
                            window.MathJax.typesetPromise?.() || Promise.resolve(),
                            new Promise(resolve => setTimeout(resolve, 1000)) // Max 1s para MathJax
                        ]).finally(() => {
                            if (!resolved) {
                                readyStates.mathJax = true;
                                checkAllReady();
                            }
                        });
                    }
                })
                .catch(() => {
                    if (!resolved) {
                        readyStates.mathJax = true;
                        checkAllReady();
                    }
                });
        };

        // 3. Detectar GeoGebra (más eficiente)
        const checkGeoGebra = () => {
            if (resolved) return;
            
            const applets = document.querySelectorAll('[id^="ggb"], .geogebra-applet');
            
            if (applets.length === 0) {
                readyStates.geoGebra = true;
                checkAllReady();
                return;
            }

            let loadedCount = 0;
            const totalApplets = applets.length;
            let checkInterval;

            const markGeoGebraReady = () => {
                if (!resolved) {
                    readyStates.geoGebra = true;
                    clearInterval(checkInterval);
                    checkAllReady();
                }
            };

            // Verificación más eficiente con menos polling
            checkInterval = setInterval(() => {
                if (resolved) {
                    clearInterval(checkInterval);
                    return;
                }
                
                // Verificar applets globalmente
                if (window.ggbApplet || loadedCount >= totalApplets) {
                    markGeoGebraReady();
                    return;
                }
                
                // Contar applets que parecen cargados
                let currentLoaded = 0;
                applets.forEach(applet => {
                    const id = applet.id;
                    if (window[id]?.getXML || applet.querySelector('canvas, svg')) {
                        currentLoaded++;
                    }
                });
                
                loadedCount = currentLoaded;
                if (loadedCount >= totalApplets) {
                    markGeoGebraReady();
                }
            }, 300); // Menos frecuente

            // Timeout de seguridad reducido
            setTimeout(markGeoGebraReady, 3000); // Reducido de 5000ms
        };

        // Iniciar verificaciones de forma más eficiente
        if (window.lessonContentReady) {
            // Ejecutar verificaciones con microtask para no bloquear
            Promise.resolve().then(() => {
                checkReveal();
                checkMathJax();
                checkGeoGebra();
            });
        } else {
            // Listener único optimizado
            document.addEventListener('lessonContentReady', () => {
                if (!resolved) {
                    // Pequeño delay para DOM updates
                    setTimeout(() => {
                        checkReveal();
                        checkMathJax();
                        checkGeoGebra();
                    }, 50); // Reducido de 100ms
                }
            }, { once: true });
        }

        // Timeout de seguridad reducido
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                resolve();
            }
        }, 5000); // Reducido de 10000ms
    });
}

// Fix relative paths in HTML content
function fixRelativePaths(htmlContent, basePath) {
    if (!basePath) return htmlContent;

    // Extract the directory path from the base path
    const pathParts = basePath.split('/');
    const courseDir = pathParts.slice(0, -2).join('/'); // e.g., "FEN/Matematicas-AUD-CPA"
    const unitDir = pathParts[pathParts.length - 2]; // e.g., "UnidadV"

    let fixedContent = htmlContent;

    // Fix data-src attributes for images (e.g., data-src="clase16/derivada1.png")
    fixedContent = fixedContent.replace(
        /data-src="([^"]+)"/g,
        (match, src) => {
            // Skip if already absolute or already processed
            if (src.startsWith('http') || src.startsWith('//') || src.startsWith('/') || src.startsWith('../../../')) {
                return match;
            }

            // Skip if already contains the full course path (already processed)
            if (src.includes(courseDir)) {
                return match;
            }

            // Build the correct path
            const newPath = `${courseDir}/${unitDir}/${src}`;
            return `data-src="${newPath}" src="${newPath}"`;
        }
    );

    // Fix standalone src attributes for images
    fixedContent = fixedContent.replace(
        /(?<!data-src="[^"]*"\s+)src="([^"]+)"/g,
        (match, src) => {
            // Skip if already absolute or already processed
            if (src.startsWith('http') || src.startsWith('//') || src.startsWith('/') || src.startsWith('../../../')) {
                return match;
            }

            // Skip if already contains the full course path (already processed)
            if (src.includes(courseDir)) {
                return match;
            }

            // Build the correct path
            const newPath = `${courseDir}/${unitDir}/${src}`;
            return `src="${newPath}"`;
        }
    );

    // Fix GeoGebra filename references (e.g., filename: "clase16/resorte.ggb")
    fixedContent = fixedContent.replace(
        /filename:\s*"([^"]+)"/g,
        (match, filename) => {
            // Skip if already absolute or already processed
            if (filename.startsWith('http') || filename.startsWith('//') || filename.startsWith('/') || filename.startsWith('../../../')) {
                return match;
            }

            // Skip if already contains the full course path (already processed)
            if (filename.includes(courseDir)) {
                return match;
            }

            // Build the correct path
            const newPath = `${courseDir}/${unitDir}/${filename}`;
            return `filename: "${newPath}"`;
        }
    );

    return fixedContent;
}

// Load lesson content from HTML file
async function loadLessonContent() {
    if (!window.lessonBase) {
        showError('Parámetro "base" requerido en la URL');
        return;
    }

    try {
        const lessonUrl = `${window.lessonBase}.html`;

        const response = await fetch(lessonUrl, { cache: 'no-cache' });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const htmlContent = await response.text();

        // Parse the HTML content to extract slides and scripts
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // Extract slides content
        const slidesElement = doc.querySelector('.slides');

        if (slidesElement) {
            // Fix relative paths in the content before injection
            const fixedContent = fixRelativePaths(slidesElement.innerHTML, window.lessonBase);
            document.getElementById('lesson-slides').innerHTML = fixedContent;
        } else {
            throw new Error('No se encontró contenido de slides en el archivo');
        }

        // Extract and inject GeoGebra scripts
        await injectGeoGebraScripts(doc);

        // Modify title slide after content injection
        await modifyTitleSlide();

        // Mark content as ready and trigger Reveal.js initialization
        window.lessonContentReady = true;
        
        // Dispatch event to let initialization systems know content is ready
        const contentReadyEvent = new CustomEvent('lessonContentReady');
        document.dispatchEvent(contentReadyEvent);

        // Show reveal container but keep loading until everything is fully ready
        document.getElementById('reveal-container').style.display = 'block';
        
        // Wait for all components to be ready before hiding loading
        await waitForContentReady();
        
        // Everything is ready - hide loading and show presentation
        document.getElementById('loading-message').style.display = 'none';

    } catch (error) {
        console.error('Error loading lesson:', error);
        showError(`Error al cargar la lección: ${error.message}`);
    }
}

// Extract and inject GeoGebra scripts from the lesson
async function injectGeoGebraScripts(doc) {
    // Find all script tags that contain GeoGebra applet code
    const scripts = doc.querySelectorAll('script');
    const dynamicScriptsContainer = document.getElementById('dynamic-scripts');

    scripts.forEach(script => {
        const scriptContent = script.textContent || script.innerHTML;

        // Check if this script contains GeoGebra applet code
        if (scriptContent.includes('new GGBApplet') || scriptContent.includes('GGBApplet')) {
            // Fix paths in the script content
            let fixedScriptContent = fixRelativePaths(scriptContent, window.lessonBase);

            // Replace window.addEventListener("load", ...) with immediate execution
            // since we want the applets to initialize after Reveal.js is ready
            fixedScriptContent = fixedScriptContent.replace(
                /window\.addEventListener\s*\(\s*["']load["']\s*,\s*function\s*\(\s*\)\s*\{([^}]+)\}\s*\)\s*;?/g,
                function (match, injectionCode) {
                    // Return code that will execute after Reveal.js is initialized
                    return `
                        // Execute GeoGebra injection after Reveal.js is ready
                        setTimeout(function() {
                            ${injectionCode}
                        }, 1000);
                    `;
                }
            );

            // Create new script element
            const newScript = document.createElement('script');
            newScript.textContent = fixedScriptContent;

            // Append to dynamic scripts container
            dynamicScriptsContainer.appendChild(newScript);
        }
    });
}

// Modify the title slide content using carreras.json data
async function modifyTitleSlide() {
    const titleSlide = document.getElementById('title-slide');
    if (!titleSlide) return;

    try {
        // Load carreras.json
        const carrerasResponse = await fetch('data/carreras.json', { cache: 'no-cache' });
        const carrerasData = await carrerasResponse.json();

        // Extract course path from lessonBase
        const pathParts = window.lessonBase.split('/');
        const coursePath = pathParts.slice(0, -2).join('/'); // e.g., "data/FEN/Matematicas-AUD-CPA"

        // Find module and career info
        let moduleKey = null;
        let moduleName = null;

        for (const [key, module] of Object.entries(carrerasData.modulos_comunes)) {
            if (module.enlace && module.enlace.includes(coursePath.replace('data/', ''))) {
                moduleKey = key;
                moduleName = module.nombre;
                break;
            }
        }

        // Get career name if carrera parameter exists
        let careerName = null;
        if (window.lessonCarrera) {
            const career = carrerasData.carreras.find(c => c.id === window.lessonCarrera);
            careerName = career ? career.nombre : null;
        }

        // Use the lesson title from URL parameter (already decoded)
        const lessonName = window.lessonTitulo || null;

        // Update title slide elements
        const titleElement = titleSlide.querySelector('h1.title');
        const subtitleElement = titleSlide.querySelector('p.subtitle');
        let lessonStyleElement = titleSlide.querySelector('p.lesson-style');

        // Update module name
        if (titleElement && moduleName) {
            titleElement.textContent = moduleName;
        }

        // Update career name
        if (subtitleElement && careerName) {
            subtitleElement.textContent = careerName;
        }

        // Create or update lesson name element
        if (lessonName) {
            if (!lessonStyleElement) {
                lessonStyleElement = document.createElement('p');
                lessonStyleElement.className = 'lesson-style';
                // Insert after subtitle but before main-logo (or at end if no logo yet)
                const mainLogoElement = titleSlide.querySelector('p.main-logo');
                if (mainLogoElement) {
                    titleSlide.insertBefore(lessonStyleElement, mainLogoElement);
                } else {
                    titleSlide.appendChild(lessonStyleElement);
                }
            }
            lessonStyleElement.textContent = lessonName;

            // Update page title with lesson name
            document.title = lessonName;
            const titleElement = document.getElementById('lesson-title');
            if (titleElement) {
                titleElement.textContent = lessonName;
            }
        }

        // Create or update logo element (inject automatically)
        let mainLogoElement = titleSlide.querySelector('p.main-logo');
        if (!mainLogoElement) {
            mainLogoElement = document.createElement('p');
            mainLogoElement.className = 'main-logo';
            titleSlide.appendChild(mainLogoElement);
        }

        // Clean and inject logo image (replace any non-image content)
        let logoImg = mainLogoElement.querySelector('img');
        if (!logoImg) {
            // No image found - clear any existing content and create new logo
            mainLogoElement.innerHTML = '';
            logoImg = document.createElement('img');
            logoImg.setAttribute('data-src', 'images/logoINSTMAT-color.png');
            logoImg.setAttribute('src', 'images/logoINSTMAT-color.png');
            logoImg.style.width = '30%';
            logoImg.alt = 'Logo Instituto de Matemáticas';
            mainLogoElement.appendChild(logoImg);
        } else {
            // Image exists - update attributes and ensure it's the only content
            const hasOtherContent = mainLogoElement.children.length > 1 || 
                                  (mainLogoElement.textContent && mainLogoElement.textContent.trim());
            
            if (hasOtherContent) {
                // Clear all content and recreate with only the logo
                mainLogoElement.innerHTML = '';
                logoImg = document.createElement('img');
                mainLogoElement.appendChild(logoImg);
            }
            
            // Update logo attributes to ensure consistency
            logoImg.setAttribute('data-src', 'images/logoINSTMAT-color.png');
            logoImg.setAttribute('src', 'images/logoINSTMAT-color.png');
            logoImg.style.width = '30%';
            logoImg.alt = 'Logo Instituto de Matemáticas';
        }
        
    } catch (error) {
        console.warn('Error modifying title slide:', error);
    }
}

// Show error message
function showError(message) {
    document.getElementById('loading-message').style.display = 'none';
    document.getElementById('reveal-container').style.display = 'none';

    const errorDiv = document.getElementById('error-message');
    errorDiv.querySelector('p').textContent = message;
    errorDiv.style.display = 'flex';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    parseParams();
    loadLessonContent();
});

// Also try to initialize when window loads (backup)
window.addEventListener('load', function () {
    if (document.getElementById('loading-message').style.display !== 'none') {
        parseParams();
        loadLessonContent();
    }
});