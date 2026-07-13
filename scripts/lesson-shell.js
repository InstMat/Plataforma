// lesson-shell.js - Dynamic lesson content loader
// URL Parameters: 
// - base: path to lesson file (e.g., "Ingenieria/EDO/UnidadII/clase10")
// - titulo: course title for the lesson

// Global variables for lesson content
window.lessonBase = '';
window.lessonTitulo = '';
window.lessonCarrera = '';
window.lessonContentReady = false;
window.lessonLoadStarted = false;
window.__printGeoState = null;
window.__printWatermarkState = null;

// Parse URL parameters
function parseParams() {
    // Evitar arrastrar hash entre lecciones: cada carga inicia limpia.
    if (window.location.hash) {
        try {
            window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
        } catch (_) {
            window.location.hash = '';
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const baseParam = urlParams.get('base') || '';

    // Agregar prefijo "data/" automáticamente si no está presente
    window.lessonBase = baseParam.startsWith('data/') ? baseParam : `data/${baseParam}`;

    window.lessonTitulo = decodeURIComponent(urlParams.get('titulo') || '');
    window.lessonCarrera = urlParams.get('carrera') || '';

    const isPrintMode = urlParams.has('print-pdf');
    window.lessonIsPrintMode = isPrintMode;
    // NO crear botón aquí - se creará después de que el contenido esté listo
    return isPrintMode;
}

function normalizeGeoGebraFragmentsForPrintMode() {
    if (!window.lessonIsPrintMode) return;

    const wrappers = document.querySelectorAll('.ggb-wrapper');
    wrappers.forEach((wrapper) => {
        const fragment = wrapper.closest('.fragment');
        if (!fragment) return;

        fragment.classList.remove('fragment', 'visible', 'current-fragment');
        fragment.style.opacity = '1';
        fragment.style.visibility = 'visible';
        fragment.style.transform = 'none';
    });
}

function normalizeAllFragmentsForPrintMode() {
    if (!window.lessonIsPrintMode) return;

    const fragments = document.querySelectorAll('.fragment');
    fragments.forEach((fragment) => {
        fragment.classList.add('visible');
        fragment.classList.remove('current-fragment');
        fragment.style.opacity = '1';
        fragment.style.visibility = 'visible';
        fragment.style.transform = 'none';
    });
}

function prepareStaticGeoGebraForPrintMode() {
    if (!window.lessonIsPrintMode) return;

    const wrappers = document.querySelectorAll('.ggb-wrapper');
    wrappers.forEach((wrapper) => {
        const appletNodes = wrapper.querySelectorAll('[id^="ggb-element-"], iframe, canvas');
        appletNodes.forEach((node) => {
            node.style.display = 'none';
            node.style.visibility = 'hidden';
            node.style.width = '0';
            node.style.height = '0';
        });

        const images = wrapper.querySelectorAll('.ggb-print-img');
        images.forEach((img, index) => {
            if (index > 0) {
                img.remove();
                return;
            }

            img.style.display = 'block';
            img.style.visibility = 'visible';
            img.style.opacity = '1';
            img.style.position = 'relative';
            // Solo aplicar width por defecto si no tiene uno definido inline
            if (!img.style.width) {
                img.style.width = '72%';
            }
            img.style.height = 'auto';
            img.style.maxWidth = '100%';
            img.style.margin = '0 auto';
            img.style.zIndex = '100';
        });
    });
}

function assignMathBlockNumbers() {
    const numberedBlockClasses = [
        'example',
        'definition',
        'theorem',
        'proposition',
        'lemma',
        'remark',
        'exercise',
        'taller',
        'challenge',
    ];

    const counters = Object.create(null);
    const totals = Object.create(null);
    numberedBlockClasses.forEach((className) => {
        counters[className] = 0;
        totals[className] = 0;
    });

    const selector = numberedBlockClasses
        .map((className) => `.reveal .slides .${className}`)
        .join(', ');

    const blocks = document.querySelectorAll(selector);

    blocks.forEach((block) => {
        const className = numberedBlockClasses.find((name) => block.classList.contains(name));
        if (!className) return;
        totals[className] += 1;
    });

    blocks.forEach((block) => {
        const className = numberedBlockClasses.find((name) => block.classList.contains(name));
        if (!className) return;

        if (totals[className] <= 1) {
            block.removeAttribute('data-block-number');
            return;
        }

        counters[className] += 1;
        block.setAttribute('data-block-number', String(counters[className]));
    });
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

            // Timeout de seguridad: permitir más margen en móviles lentos.
            setTimeout(() => {
                if (!resolved && !readyStates.reveal) {
                    readyStates.reveal = true;
                    checkAllReady();
                }
            }, 5000);
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

            // Timeout de seguridad para applets lentos en móviles.
            setTimeout(markGeoGebraReady, 5000);
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

        // Timeout global: evita continuar demasiado pronto cuando el dispositivo va lento.
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                resolve();
            }
        }, 7000);
    });
}

async function waitForRevealReady(timeoutMs = 8000) {
    if (!window.Reveal) {
        return false;
    }

    if (window.Reveal?.isReady?.()) {
        return true;
    }

    return new Promise((resolve) => {
        let resolved = false;

        const finish = (value) => {
            if (resolved) {
                return;
            }
            resolved = true;
            clearInterval(intervalId);
            clearTimeout(timeoutId);
            resolve(value);
        };

        const onRevealReady = () => finish(true);
        document.addEventListener('reveal-ready', onRevealReady, { once: true });

        const intervalId = setInterval(() => {
            if (window.Reveal?.isReady?.()) {
                finish(true);
            }
        }, 100);

        const timeoutId = setTimeout(() => finish(false), timeoutMs);
    });
}

function getPresentSlidesCount() {
    return document.querySelectorAll('.slides section.present').length;
}

function forceFirstSlidePresentFallback() {
    const sections = document.querySelectorAll('.slides section');
    if (!sections || sections.length === 0) {
        return false;
    }

    sections.forEach((section, index) => {
        section.classList.remove('past', 'present', 'future', 'stack');
        if (index === 0) {
            section.classList.add('present');
            section.style.display = 'block';
        } else {
            section.classList.add('future');
        }
    });

    return getPresentSlidesCount() > 0;
}

async function ensureRevealHasPresentSlide() {
    if (!window.Reveal || typeof window.Reveal.isReady !== 'function' || !window.Reveal.isReady()) {
        return false;
    }

    if (getPresentSlidesCount() > 0) {
        return true;
    }

    try {
        // Recuperación defensiva para hashes personalizados que dejan Reveal sin slide activa.
        if (typeof window.Reveal.slide === 'function') {
            window.Reveal.slide(0, 0, 0);
        }

        await new Promise((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(resolve));
        });

        if (getPresentSlidesCount() > 0) {
            return true;
        }

        if (typeof window.Reveal.setState === 'function') {
            window.Reveal.setState({ indexh: 0, indexv: 0, indexf: 0, paused: false, overview: false });
            await new Promise((resolve) => setTimeout(resolve, 120));
        }

        if (getPresentSlidesCount() > 0) {
            return true;
        }

        if (typeof window.Reveal.slide === 'function') {
            window.Reveal.slide(0, 0, 0);
            await new Promise((resolve) => setTimeout(resolve, 120));
        }

        if (getPresentSlidesCount() > 0) {
            return true;
        }

        return forceFirstSlidePresentFallback();
    } catch (_) {
        // No bloquear la carga si Reveal falla en este ajuste correctivo.
        return forceFirstSlidePresentFallback();
    }
}

async function stabilizeRevealInitialLayout() {
    if (!window.Reveal || typeof window.Reveal.layout !== 'function') {
        return;
    }

    const runLayoutPass = () => {
        try {
            window.Reveal.layout();
        } catch (_) {
            // Ignorar: no bloquear la carga por fallos internos de Reveal.
        }
    };

    // Re-layout inmediato y en ticks cortos para corregir escalado inicial inestable.
    runLayoutPass();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    runLayoutPass();
    await new Promise((resolve) => setTimeout(resolve, 120));
    runLayoutPass();

    // Si el navegador soporta Font Loading API, esperar fuentes para recalcular escala final.
    try {
        if (document.fonts && document.fonts.ready) {
            await Promise.race([
                document.fonts.ready,
                new Promise((resolve) => setTimeout(resolve, 1200)),
            ]);
            runLayoutPass();
        }
    } catch (_) {
        // Fallback silencioso si no hay soporte o falla la promesa.
    }
}

async function finalizeRevealStableState() {
    if (!window.Reveal) {
        return;
    }

    const ensurePresentNow = async () => {
        if (getPresentSlidesCount() > 0) {
            return true;
        }

        const recovered = await ensureRevealHasPresentSlide();
        if (recovered && getPresentSlidesCount() > 0) {
            return true;
        }

        if (typeof window.Reveal.slide === 'function') {
            window.Reveal.slide(0, 0, 0);
            await new Promise((resolve) => setTimeout(resolve, 120));
        }

        if (getPresentSlidesCount() > 0) {
            return true;
        }

        return forceFirstSlidePresentFallback();
    };

    if (await ensurePresentNow()) {
        return;
    }

    // Segundo intento corto para estados que se corrigen tarde por hashchange interno.
    await new Promise((resolve) => setTimeout(resolve, 180));
    await ensurePresentNow();
}

async function forceStartAtTitleSlide() {
    if (!window.Reveal || typeof window.Reveal.isReady !== 'function' || !window.Reveal.isReady()) {
        return;
    }

    if (typeof window.Reveal.slide !== 'function') {
        return;
    }

    try {
        window.Reveal.slide(0, 0, 0);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        if (typeof window.Reveal.layout === 'function') {
            window.Reveal.layout();
        }

        // Mantener la URL sin hash para no conservar estado entre lecciones.
        try {
            window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
        } catch (_) {
            window.location.hash = '';
        }
    } catch (_) {
        // No bloquear la carga por errores internos de Reveal durante el salto inicial.
    }
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

function isDemoLessonPath(lessonBase) {
    if (!lessonBase) {
        return false;
    }

    const normalizedBase = String(lessonBase).replace(/^\/+/, '');
    return normalizedBase === 'data/Demo' || normalizedBase.startsWith('data/Demo/');
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
            assignMathBlockNumbers();
            normalizeAllFragmentsForPrintMode();
            normalizeGeoGebraFragmentsForPrintMode();
            prepareStaticGeoGebraForPrintMode();
        } else {
            throw new Error('No se encontró contenido de slides en el archivo');
        }

        // Extract and inject GeoGebra scripts
        await injectGeoGebraScripts(doc);

        // Mark content as ready and trigger Reveal.js initialization
        window.lessonContentReady = true;

        // Dispatch event to let initialization systems know content is ready
        const contentReadyEvent = new CustomEvent('lessonContentReady');
        document.dispatchEvent(contentReadyEvent);

        // Show reveal container but keep loading until everything is fully ready
        if (window.lessonLoadingState && typeof window.lessonLoadingState.showReveal === 'function') {
            window.lessonLoadingState.showReveal();
        } else {
            document.getElementById('reveal-container').style.display = 'block';
        }

        // Modify title slide AFTER Reveal.js is ready
        await modifyTitleSlide();

        // Esperar a que el navegador renderice los cambios del DOM
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(resolve);
            });
        });

        // En portable priorizamos mostrar la lección apenas Reveal está estable.
        // MathJax y GeoGebra pueden seguir terminando de inicializar en segundo plano desde CDN.
        let revealReady = await waitForRevealReady(12000);

        // Reintento defensivo: en móviles lentos puede ocurrir que el primer init no termine a tiempo.
        if (!revealReady && typeof initializeRevealForLesson === 'function') {
            try {
                initializeRevealForLesson();
            } catch (_) {
                // Ignorar: el segundo intento es best-effort.
            }
            revealReady = await waitForRevealReady(5000);
        }

        if (!revealReady) {
            throw new Error('Reveal.js no terminó de inicializarse a tiempo. Intenta recargar la lección.');
        }

        if (window.lessonLoadingState && typeof window.lessonLoadingState.hideLoading === 'function') {
            window.lessonLoadingState.hideLoading();
        } else {
            document.getElementById('loading-message').style.display = 'none';
        }

        await Promise.race([
            waitForContentReady(),
            new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);

        if (window.Reveal) {
            const hasPresentSlide = await ensureRevealHasPresentSlide();
            if (!hasPresentSlide) {
                // Evitar error fatal: mostrar al menos la primera slide en estado estable.
                forceFirstSlidePresentFallback();
            }

            try {
                if (typeof window.Reveal.sync === 'function') {
                    window.Reveal.sync();
                }
            } catch (_) {
                // No bloquear la carga de la lección por errores internos de Reveal.
            }

            try {
                if (typeof window.Reveal.layout === 'function') {
                    window.Reveal.layout();
                }
            } catch (_) {
                // No bloquear la carga de la lección por errores internos de Reveal.
            }

            await stabilizeRevealInitialLayout();
            await finalizeRevealStableState();
            await forceStartAtTitleSlide();
        }

        // Crear botón de pantalla completa para usuarios sin teclado
        createFullscreenButton();
        setupGeoGebraAutoRepairObservers();

        // Agregar ampliación por modal para imágenes del contenido
        createImageZoomControls();

        // Crear botón de impresión DESPUÉS de que todo esté listo
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('print-pdf')) {
            createPrintButton();
        }

    } catch (error) {

        if (window.lessonLoadingState && typeof window.lessonLoadingState.showError === 'function') {
            window.lessonLoadingState.showError(`Error al cargar la lección: ${error.message}`);
        } else {
            showError(`Error al cargar la lección: ${error.message}`);
        }
    }
}

// Extract and inject GeoGebra scripts from the lesson
async function injectGeoGebraScripts(doc) {
    if (window.lessonIsPrintMode) {
        return;
    }

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
        const pathParts = window.lessonBase.split('/').filter(Boolean);
        const coursePath = pathParts.slice(0, -2).join('/'); // e.g., "data/FEN/MatI"
        const relativeCoursePath = coursePath.replace(/^data\//, '');
        const courseSegments = relativeCoursePath.split('/').filter(Boolean);
        const moduleKeyFromPath = courseSegments.length > 0 ? courseSegments[courseSegments.length - 1] : '';

        // Find module and career info
        let moduleName = null;

        // 1) Fast path: key lookup by folder name (e.g. IntroMate)
        if (moduleKeyFromPath && carrerasData.modulos_comunes && carrerasData.modulos_comunes[moduleKeyFromPath]) {
            moduleName = carrerasData.modulos_comunes[moduleKeyFromPath].nombre || null;
        }

        // 2) Fallback: match by enlace path
        if (!moduleName && carrerasData.modulos_comunes) {
            for (const module of Object.values(carrerasData.modulos_comunes)) {
                if (module.enlace && module.enlace.includes(relativeCoursePath)) {
                    moduleName = module.nombre;
                    break;
                }
            }
        }

        // 3) Last fallback: folder name
        if (!moduleName) {
            moduleName = moduleKeyFromPath || null;
        }

        // Resolve career name with strict priority: URL career -> user career -> faculty fallback
        let careerName = null;
        let resolvedCarreraId = String(sessionStorage.getItem('selected_carrera_id') || '').trim();

        if (!resolvedCarreraId && window.authManager && typeof window.authManager.getUserCarrera === 'function') {
            const userCarrera = window.authManager.getUserCarrera();
            const firstCarreraId = Array.isArray(userCarrera) ? userCarrera[0] : userCarrera;
            resolvedCarreraId = String(firstCarreraId || '').trim();
        }

        if (!resolvedCarreraId || resolvedCarreraId === 'ALL') {
            try {
                const selectedCarrera = sessionStorage.getItem('selected_carrera_id')
                    || localStorage.getItem('selected_carrera_id');
                if (selectedCarrera) {
                    resolvedCarreraId = String(selectedCarrera).trim();
                }
            } catch (_) {
                // ignore storage issues
            }
        }

        // Último recurso: usar la facultad del path (ej. "Ingenieria" de base=data/Ingenieria/...)
        // El bloque siguiente ya sabe resolver facultad → carrera real del usuario.
        if ((!resolvedCarreraId || resolvedCarreraId === 'ALL') && courseSegments.length > 0) {
            resolvedCarreraId = courseSegments[0];
        }

        // Si carrera viene como facultad (ej. fen), intentar reemplazar por carrera real del usuario
        if (resolvedCarreraId && Array.isArray(carrerasData.facultades) && Array.isArray(carrerasData.carreras)) {
            const facultadMatch = carrerasData.facultades.find(
                f => String(f.id || '').toLowerCase() === resolvedCarreraId.toLowerCase()
            );

            if (facultadMatch && window.authManager && typeof window.authManager.getUserCarrera === 'function') {
                const userCarrera = window.authManager.getUserCarrera();
                const userCarreras = Array.isArray(userCarrera) ? userCarrera : [userCarrera];
                const candidata = userCarreras
                    .map(c => String(c || '').trim())
                    .find(c => c && c !== 'ALL' && facultadMatch.carreras.includes(c));

                if (candidata) {
                    resolvedCarreraId = candidata;
                }
            }

            // Fallback adicional para admins: usar la última carrera seleccionada en UI
            if (facultadMatch) {
                try {
                    const selectedCarrera = sessionStorage.getItem('selected_carrera_id')
                        || localStorage.getItem('selected_carrera_id');
                    if (selectedCarrera && facultadMatch.carreras.includes(selectedCarrera)) {
                        resolvedCarreraId = selectedCarrera;
                    }
                } catch (_) {
                    // ignore storage issues
                }
            }
        }

        if (resolvedCarreraId && resolvedCarreraId !== 'ALL' && Array.isArray(carrerasData.carreras)) {
            const targetId = resolvedCarreraId.toLowerCase();
            const career = carrerasData.carreras.find(c => String(c.id || '').toLowerCase() === targetId);
            careerName = career ? career.nombre : resolvedCarreraId;
        }

        // Faculty is only a last resort when no career id exists at all
        if (!careerName && Array.isArray(carrerasData.facultades) && courseSegments.length > 0) {
            const facultadId = String(courseSegments[0]).toLowerCase();
            const facultad = carrerasData.facultades.find(f => String(f.id || '').toLowerCase() === facultadId);
            if (facultad && facultad.nombre) {
                careerName = facultad.nombre;
            }
        }

        // Use the lesson title from URL parameter (already decoded)
        const lessonName = window.lessonTitulo || null;

        // Update title slide elements
        const titleElement = titleSlide.querySelector('h1.title');
        let subtitleElement = titleSlide.querySelector('p.subtitle');
        let lessonStyleElement = titleSlide.querySelector('p.lesson-style');

        // ✅ ALWAYS update title (lesson name or module name)
        if (titleElement) {
            titleElement.textContent = lessonName || moduleName || '';
        }

        // ✅ ALWAYS ensure/update subtitle (module name)
        if (!subtitleElement) {
            subtitleElement = document.createElement('p');
            subtitleElement.className = 'subtitle';

            const mainLogoElement = titleSlide.querySelector('p.main-logo');
            if (mainLogoElement) {
                titleSlide.insertBefore(subtitleElement, mainLogoElement);
            } else {
                titleSlide.appendChild(subtitleElement);
            }
        }
        subtitleElement.textContent = moduleName || '';

        // ✅ ALWAYS create/update career name element (even if empty to clear previous)
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
        // ✅ Always update content (clears previous value if careerName is null/empty)
        lessonStyleElement.textContent = careerName || '';

        // Update page title with lesson name
        if (lessonName) {
            document.title = lessonName;
            const pageTitleElement = document.getElementById('lesson-title');
            if (pageTitleElement) {
                pageTitleElement.textContent = lessonName;
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
            logoImg.style.width = '40%';
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
            logoImg.style.width = '20%';
            logoImg.alt = 'Logo Instituto de Matemáticas';
        }

        // Forzar reflow para asegurar que los cambios del DOM estén aplicados
        titleSlide.offsetHeight;

    } catch (error) {
        console.error('modifyTitleSlide error:', error);
    }
}

// Create print button in the top-right corner
function createPrintButton() {
    // Verificar que el botón no exista ya (prevenir duplicados)
    if (document.getElementById('print-button')) {
        return;
    }

    const printBtn = document.createElement('button');
    printBtn.id = 'print-button';
    printBtn.className = 'no-print';
    printBtn.innerHTML = '<i class="fas fa-print"></i> Imprimir';
    printBtn.title = 'Imprimir presentación';

    printBtn.addEventListener('click', async () => {
        // Asegurar que Reveal.js esté listo antes de imprimir
        if (!window.Reveal || !window.Reveal.isReady()) {
            console.warn('Reveal.js no está listo para imprimir');
            return;
        }

        // Configurar Reveal para impresión
        window.Reveal.configure({
            pdfMaxPagesPerSlide: Number.POSITIVE_INFINITY,
            pdfSeparateFragments: false
        });

        // Asegurar que los fallback de GeoGebra estén cargados antes de abrir el diálogo de impresión.
        await ensurePrintImagesReady();

        // Preparar elementos de impresión (GeoGebra + marca de agua por página)
        preparePrintArtifacts();

        // Forzar reflow y esperar un frame para sincronizar con el navegador
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                document.body.offsetHeight; // Forzar reflow
                requestAnimationFrame(resolve);
            });
        });

        // Ejecutar impresión
        window.print();
    });

    // Agregar al contenedor de controles
    const controlsContainer = document.getElementById('controls-container');
    if (controlsContainer) {
        controlsContainer.appendChild(printBtn);
    } else {
        document.body.insertBefore(printBtn, document.body.firstChild);
    }
}

async function ensurePrintImagesReady() {
    const images = Array.from(document.querySelectorAll('.ggb-wrapper .ggb-print-img'));

    if (images.length === 0) return;

    await Promise.all(images.map((img) => new Promise((resolve) => {
        // Cargar data-src si existiera en contenidos heredados.
        if (!img.getAttribute('src') && img.dataset?.src) {
            img.setAttribute('src', img.dataset.src);
        }

        img.loading = 'eager';
        img.decoding = 'sync';

        if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
        }

        const done = () => {
            img.removeEventListener('load', done);
            img.removeEventListener('error', done);
            resolve();
        };

        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });

        // No bloquear impresión indefinidamente si una imagen falla.
        setTimeout(done, 1500);
    })));
}

function snapshotGeoGebraLayoutBeforeFullscreen() {
    const hosts = document.querySelectorAll('.ggb-wrapper [id^="ggb-element-"]');

    hosts.forEach((host) => {
        const rect = host.getBoundingClientRect();
        if (rect.width > 0) {
            host.dataset.ggbRestoreWidth = `${Math.round(rect.width)}px`;
        }
        if (rect.height > 0) {
            host.dataset.ggbRestoreHeight = `${Math.round(rect.height)}px`;
        }
    });
}

function restoreGeoGebraLayoutAfterFullscreenExit() {
    const wrappers = document.querySelectorAll('.ggb-wrapper');

    wrappers.forEach((wrapper) => {
        // Restablecer layout base del wrapper por si el applet alteró estilos inline.
        wrapper.style.width = '100%';
        wrapper.style.display = 'flex';
        wrapper.style.justifyContent = 'center';
        wrapper.style.alignItems = 'center';
        wrapper.style.flexDirection = 'row';

        const appletHosts = wrapper.querySelectorAll('[id^="ggb-element-"]');
        appletHosts.forEach((host) => {
            const restoreWidth = host.dataset.ggbRestoreWidth;
            const restoreHeight = host.dataset.ggbRestoreHeight;

            if (restoreWidth) {
                host.style.width = restoreWidth;
            }
            if (restoreHeight) {
                host.style.height = restoreHeight;
            }

            host.style.display = 'block';
            host.style.flex = '0 0 auto';
            host.style.marginLeft = 'auto';
            host.style.marginRight = 'auto';
            host.style.maxWidth = '100%';
        });
    });

    const triggerLayout = () => {
        window.dispatchEvent(new Event('resize'));
        if (window.Reveal?.layout) {
            window.Reveal.layout();
        }
    };

    // Repetimos el relayout porque el WebView de GeoGebra ajusta tamaño de forma asíncrona.
    triggerLayout();
    setTimeout(triggerLayout, 120);
    setTimeout(triggerLayout, 320);
}

function setupGeoGebraAutoRepairObservers() {
    if (window.__ggbAutoRepairBound) {
        return;
    }

    const hosts = document.querySelectorAll('.ggb-wrapper [id^="ggb-element-"]');
    if (hosts.length === 0) {
        return;
    }

    const observers = [];

    const updateBaseline = (host, wrapper) => {
        if (isFullscreenActive()) {
            return;
        }

        const hostRect = host.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        if (hostRect.width <= 0 || wrapperRect.width <= 0) {
            return;
        }

        host.dataset.ggbRestoreWidth = `${Math.round(hostRect.width)}px`;
        host.dataset.ggbRestoreHeight = `${Math.round(hostRect.height)}px`;
        host.dataset.ggbRestoreWrapperWidth = `${Math.round(wrapperRect.width)}`;
    };

    const tryRepair = (host, wrapper) => {
        if (isFullscreenActive()) {
            return;
        }

        const baselineWidth = parseFloat(host.dataset.ggbRestoreWidth || '0');
        const baselineWrapperWidth = parseFloat(host.dataset.ggbRestoreWrapperWidth || '0');
        if (!baselineWidth || !baselineWrapperWidth) {
            updateBaseline(host, wrapper);
            return;
        }

        const hostRect = host.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        if (hostRect.width <= 0 || wrapperRect.width <= 0) {
            return;
        }

        const viewportNarrow = wrapperRect.width < baselineWrapperWidth * 0.8;
        if (viewportNarrow) {
            updateBaseline(host, wrapper);
            return;
        }

        const hasUnexpectedShrink = hostRect.width < baselineWidth * 0.75;
        if (!hasUnexpectedShrink) {
            updateBaseline(host, wrapper);
            return;
        }

        host.style.width = `${Math.round(baselineWidth)}px`;
        const baselineHeight = host.dataset.ggbRestoreHeight;
        if (baselineHeight) {
            host.style.height = baselineHeight;
        }

        host.style.display = 'block';
        host.style.flex = '0 0 auto';
        host.style.marginLeft = 'auto';
        host.style.marginRight = 'auto';
        host.style.maxWidth = '100%';

        wrapper.style.display = 'flex';
        wrapper.style.justifyContent = 'center';
        wrapper.style.alignItems = 'center';

        window.dispatchEvent(new Event('resize'));
        if (window.Reveal?.layout) {
            window.Reveal.layout();
        }

        setTimeout(() => updateBaseline(host, wrapper), 350);
    };

    hosts.forEach((host) => {
        const wrapper = host.closest('.ggb-wrapper');
        if (!wrapper) {
            return;
        }

        updateBaseline(host, wrapper);

        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                tryRepair(host, wrapper);
            });
            resizeObserver.observe(host);
            resizeObserver.observe(wrapper);
            observers.push(resizeObserver);
        }

        const mutationObserver = new MutationObserver(() => {
            tryRepair(host, wrapper);
        });
        mutationObserver.observe(host, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        observers.push(mutationObserver);
    });

    window.addEventListener('resize', () => {
        hosts.forEach((host) => {
            const wrapper = host.closest('.ggb-wrapper');
            if (wrapper) {
                updateBaseline(host, wrapper);
            }
        });
    });

    window.__ggbAutoRepairBound = true;
    window.__ggbAutoRepairObservers = observers;
}

function isFullscreenActive() {
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function isGeoGebraFullscreenElement(element) {
    if (!(element instanceof Element)) {
        return false;
    }

    if (element.matches('.ggb-wrapper, [id^="ggb-element-"], .geogebra-applet')) {
        return true;
    }

    if (element.matches('iframe, canvas') && Boolean(element.closest('.ggb-wrapper'))) {
        return true;
    }

    return Boolean(element.closest('.ggb-wrapper'));
}

function getFullscreenOwner() {
    const fullscreenElement = getFullscreenElement();
    if (!fullscreenElement) {
        return null;
    }

    if (fullscreenElement === document.documentElement) {
        return 'reveal';
    }

    if (isGeoGebraFullscreenElement(fullscreenElement)) {
        return 'geogebra';
    }

    return 'other';
}

function updateFullscreenButtonState(button) {
    if (!button) return;

    const active = isFullscreenActive();
    button.classList.toggle('is-active', active);
    button.innerHTML = active
        ? '<i class="fas fa-compress"></i>'
        : '<i class="fas fa-expand"></i>';

    if (button.disabled) {
        button.setAttribute('aria-label', 'Pantalla completa de Reveal deshabilitada durante fullscreen de GeoGebra');
        button.title = 'Desactiva primero la pantalla completa interna de GeoGebra';
        return;
    }

    button.setAttribute('aria-label', active ? 'Salir de pantalla completa' : 'Activar pantalla completa');
    button.title = active ? 'Salir de pantalla completa' : 'Activar pantalla completa';
}

async function toggleFullscreen() {
    const rootElement = document.documentElement;

    if (isFullscreenActive()) {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
            return;
        }

        if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
            return;
        }

        return;
    }

    if (rootElement.requestFullscreen) {
        await rootElement.requestFullscreen();
        return;
    }

    if (rootElement.webkitRequestFullscreen) {
        rootElement.webkitRequestFullscreen();
    }
}

function createFullscreenButton() {
    if (window.lessonIsPrintMode) {
        return;
    }

    if (document.getElementById('fullscreen-button')) {
        return;
    }

    const button = document.createElement('button');
    button.id = 'fullscreen-button';
    button.className = 'no-print';
    // Fallback inline styles in case style.css is cached in production.
    button.style.position = 'fixed';
    button.style.top = '20px';
    button.style.left = '20px';
    button.style.zIndex = '99999';
    updateFullscreenButtonState(button);

    button.addEventListener('click', async () => {
        if (button.disabled) {
            return;
        }

        try {
            await toggleFullscreen();
        } catch (error) {
            console.error('No se pudo cambiar el modo pantalla completa:', error);
        } finally {
            updateFullscreenButtonState(button);
        }
    });

    snapshotGeoGebraLayoutBeforeFullscreen();
    window.addEventListener('resize', () => {
        if (!isFullscreenActive()) {
            snapshotGeoGebraLayoutBeforeFullscreen();
        }
    });

    let wasFullscreenActive = isFullscreenActive();
    let previousFullscreenOwner = getFullscreenOwner();
    const handleFullscreenChange = () => {
        const isActiveNow = isFullscreenActive();
        const ownerNow = getFullscreenOwner();

        const geogebraFullscreenActive = ownerNow === 'geogebra';
        button.disabled = geogebraFullscreenActive;
        button.style.opacity = geogebraFullscreenActive ? '0.55' : '';
        button.style.cursor = geogebraFullscreenActive ? 'not-allowed' : '';
        updateFullscreenButtonState(button);

        if (wasFullscreenActive && !isActiveNow && previousFullscreenOwner === 'geogebra') {
            restoreGeoGebraLayoutAfterFullscreenExit();
            setTimeout(snapshotGeoGebraLayoutBeforeFullscreen, 380);
        }

        wasFullscreenActive = isActiveNow;
        previousFullscreenOwner = ownerNow;
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    const controlsContainer = document.getElementById('controls-container');
    if (controlsContainer) {
        controlsContainer.appendChild(button);
    } else {
        document.body.insertBefore(button, document.body.firstChild);
    }
}

function ensureImageZoomModal() {
    let modal = document.getElementById('image-zoom-modal');
    if (modal) {
        return modal;
    }

    modal = document.createElement('div');
    modal.id = 'image-zoom-modal';
    modal.className = 'image-zoom-modal no-print';
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
        <div class="image-zoom-backdrop" data-close-image-zoom="true"></div>
        <div class="image-zoom-dialog" role="dialog" aria-modal="true" aria-label="Imagen ampliada">
            <button type="button" class="image-zoom-close" aria-label="Cerrar imagen ampliada" title="Cerrar">
                <i class="fas fa-times"></i>
            </button>
            <img class="image-zoom-content" alt="Imagen ampliada">
        </div>
    `;

    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.image-zoom-close');
    closeButton?.addEventListener('click', closeImageZoomModal);
    modal.addEventListener('click', (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.dataset.closeImageZoom === 'true') {
            closeImageZoomModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeImageZoomModal();
        }
    });

    return modal;
}

function getZoomableImageSource(img) {
    return img.currentSrc || img.getAttribute('src') || img.getAttribute('data-src') || '';
}

function applyImageZoomSize(modalImage) {
    if (!(modalImage instanceof HTMLImageElement)) {
        return;
    }

    const naturalWidth = modalImage.naturalWidth;
    const naturalHeight = modalImage.naturalHeight;
    if (!naturalWidth || !naturalHeight) {
        return;
    }

    // Mantener tamaño original si cabe; reducir proporcionalmente cuando excede viewport.
    const maxWidth = Math.max(window.innerWidth * 0.92 - 32, 240);
    const maxHeight = Math.max(window.innerHeight * 0.92 - 32, 180);
    const scale = Math.min(1, maxWidth / naturalWidth, maxHeight / naturalHeight);

    modalImage.style.width = `${Math.round(naturalWidth * scale)}px`;
    modalImage.style.height = `${Math.round(naturalHeight * scale)}px`;
}

function openImageZoomModal(img) {
    const src = getZoomableImageSource(img);
    if (!src) {
        return;
    }

    const modal = ensureImageZoomModal();
    const modalImage = modal.querySelector('.image-zoom-content');
    if (!(modalImage instanceof HTMLImageElement)) {
        return;
    }

    modalImage.src = src;
    modalImage.alt = img.alt || 'Imagen ampliada';

    const onLoaded = () => applyImageZoomSize(modalImage);
    if (modalImage.complete && modalImage.naturalWidth > 0) {
        onLoaded();
    } else {
        modalImage.addEventListener('load', onLoaded, { once: true });
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('image-zoom-open');
}

function closeImageZoomModal() {
    const modal = document.getElementById('image-zoom-modal');
    if (!modal) {
        return;
    }

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('image-zoom-open');

    const modalImage = modal.querySelector('.image-zoom-content');
    if (modalImage instanceof HTMLImageElement) {
        modalImage.removeAttribute('style');
    }
}

function isImageZoomEligible(img) {
    if (!(img instanceof HTMLImageElement)) {
        return false;
    }

    if (img.closest('#image-zoom-modal')) {
        return false;
    }

    // Excluir imágenes internas de applets GeoGebra (controles/iconos del propio applet).
    if (img.closest('.ggb-wrapper') || img.closest('[id^="ggb-element-"]') || img.closest('.geogebra-applet')) {
        return false;
    }

    if (img.classList.contains('ggb-print-img')) {
        return false;
    }

    if (img.closest('#title-slide .main-logo')) {
        return false;
    }

    return Boolean(getZoomableImageSource(img));
}

function createImageZoomControls() {
    if (window.lessonIsPrintMode) {
        return;
    }

    ensureImageZoomModal();

    const images = document.querySelectorAll('.reveal .slides img');
    images.forEach((img) => {
        if (!isImageZoomEligible(img)) {
            return;
        }

        if (img.closest('.image-zoom-wrapper')) {
            return;
        }

        const wrapper = document.createElement('span');
        wrapper.className = 'image-zoom-wrapper';

        const parent = img.parentNode;
        if (!parent) {
            return;
        }

        parent.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        const inlineWidth = (img.style.width || '').trim();
        if (inlineWidth.endsWith('%')) {
            // Mantiene el tamaño relativo original y evita que el wrapper achique la imagen.
            wrapper.style.width = inlineWidth;
            img.style.width = '100%';

            // Si la imagen traía desplazamientos laterales inline, moverlos al wrapper
            // para que el botón quede en la esquina real de la imagen visible.
            const inlineMarginLeft = (img.style.marginLeft || '').trim();
            const inlineMarginRight = (img.style.marginRight || '').trim();

            if (inlineMarginLeft) {
                wrapper.style.marginLeft = inlineMarginLeft;
                img.style.marginLeft = '0';
            }

            if (inlineMarginRight) {
                wrapper.style.marginRight = inlineMarginRight;
                img.style.marginRight = '0';
            }
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'image-zoom-trigger no-print';
        button.setAttribute('aria-label', 'Ampliar imagen');
        button.title = 'Ampliar imagen';
        button.innerHTML = '<i class="fas fa-expand-alt"></i>';
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openImageZoomModal(img);
        });

        wrapper.appendChild(button);

        img.classList.add('zoomable-image');
        img.addEventListener('click', () => openImageZoomModal(img));
    });

    if (!window.__imageZoomResizeBound) {
        window.addEventListener('resize', () => {
            const modal = document.getElementById('image-zoom-modal');
            if (!modal || !modal.classList.contains('is-open')) {
                return;
            }

            const modalImage = modal.querySelector('.image-zoom-content');
            applyImageZoomSize(modalImage);
        });
        window.__imageZoomResizeBound = true;
    }
}

function prepareGeoGebraForPrint() {
    if (window.__printGeoState) return;

    const state = [];

    const wrappers = document.querySelectorAll('.ggb-wrapper');
    wrappers.forEach((wrapper) => {
        state.push({ el: wrapper, style: wrapper.getAttribute('style') });
        wrapper.style.display = 'flex';
        wrapper.style.visibility = 'visible';
        wrapper.style.opacity = '1';
        wrapper.style.position = 'relative';
    });

    const applets = document.querySelectorAll('.ggb-wrapper [id^="ggb-element-"], .ggb-wrapper iframe, .ggb-wrapper canvas');
    applets.forEach((node) => {
        state.push({ el: node, style: node.getAttribute('style') });
        node.style.display = 'none';
        node.style.visibility = 'hidden';
        node.style.width = '0';
        node.style.height = '0';
    });

    const images = document.querySelectorAll('.ggb-wrapper .ggb-print-img');
    images.forEach((img) => {
        state.push({ el: img, style: img.getAttribute('style') });
        img.style.display = 'block';
        img.style.visibility = 'visible';
        img.style.opacity = '1';
        img.style.position = 'relative';
        // Mantener width inline cuando exista; usar un fallback más conservador para evitar recortes en PDF.
        if (!img.style.width) {
            img.style.width = '72%';
        }
        img.style.height = 'auto';
        img.style.maxWidth = '100%';
        img.style.margin = '0 auto';
        img.style.zIndex = '100';
    });

    const fragments = document.querySelectorAll('.fragment');
    fragments.forEach((fragment) => {
        if (!fragment.querySelector('.ggb-wrapper')) return;
        state.push({ el: fragment, style: fragment.getAttribute('style') });
        fragment.style.display = 'flex';
        fragment.style.visibility = 'visible';
        fragment.style.opacity = '1';
    });

    window.__printGeoState = state;
}

function restoreGeoGebraAfterPrint() {
    const state = window.__printGeoState || [];
    state.forEach(({ el, style }) => {
        if (!el) return;
        if (style === null || style === undefined) {
            el.removeAttribute('style');
        } else {
            el.setAttribute('style', style);
        }
    });
    window.__printGeoState = null;
}

function prepareWatermarkForPrint() {
    if (window.__printWatermarkState) return;

    const state = [];
    const pdfPages = document.querySelectorAll('.reveal .slides .pdf-page');
    const targets = pdfPages.length > 0
        ? pdfPages
        : document.querySelectorAll('.reveal .slides section:not(.stack)');

    targets.forEach((target) => {
        if (!target) return;

        const hasWatermark = Array.from(target.children).some(
            (child) => child.classList && child.classList.contains('print-watermark-logo')
        );
        if (hasWatermark) return;

        const previousInlinePosition = target.style.position;
        const shouldForceRelative = window.getComputedStyle(target).position === 'static';

        if (shouldForceRelative) {
            target.style.position = 'relative';
        }

        const mark = document.createElement('img');
        mark.className = 'print-watermark-logo';
        mark.src = 'images/logoINSTMAT-Isologo-color.png';
        mark.alt = '';
        mark.setAttribute('aria-hidden', 'true');
        mark.loading = 'eager';

        target.appendChild(mark);
        state.push({ target, mark, shouldForceRelative, previousInlinePosition });
    });

    window.__printWatermarkState = state;
}

function restoreWatermarkAfterPrint() {
    const state = window.__printWatermarkState || [];

    state.forEach(({ target, mark, shouldForceRelative, previousInlinePosition }) => {
        if (mark && mark.parentNode) {
            mark.parentNode.removeChild(mark);
        }

        if (target && shouldForceRelative) {
            if (previousInlinePosition) {
                target.style.position = previousInlinePosition;
            } else {
                target.style.removeProperty('position');
            }
        }
    });

    window.__printWatermarkState = null;
}

function preparePrintArtifacts() {
    prepareGeoGebraForPrint();
    prepareWatermarkForPrint();
}

function restorePrintArtifacts() {
    restoreGeoGebraAfterPrint();
    restoreWatermarkAfterPrint();

    if (window.Reveal) {
        window.Reveal.configure({
            pdfMaxPagesPerSlide: Number.POSITIVE_INFINITY,
            pdfSeparateFragments: true
        });
    }
}

window.addEventListener('beforeprint', preparePrintArtifacts);
window.addEventListener('afterprint', restorePrintArtifacts);

function startLessonLoadOnce() {
    if (window.lessonLoadStarted) {
        return;
    }

    window.lessonLoadStarted = true;
    parseParams();
    loadLessonContent();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    startLessonLoadOnce();
});

// Also try to initialize when window loads (backup)
window.addEventListener('load', function () {
    if (document.getElementById('loading-message').style.display !== 'none') {
        startLessonLoadOnce();
    }
});