// Cached DOM elements for performance
let cachedElements = null;

// Initialize DOM element cache
function initializeElementCache() {
    if (!cachedElements) {
        cachedElements = {
            unidadesContainer: document.getElementById('unidades-container'),
            iframeContenido: document.querySelector("iframe[name='contenido']"),
            sidebar: document.getElementById('sidebar'),
            menuToggle: document.getElementById('menu-toggle')
        };
    }
    return cachedElements;
}

// Utility functions for URL handling
function __isAbsolute__(href) {
    return /^(https?:)?\/\//.test(href);
}

function __join__(base, rel) {
    if (!base || __isAbsolute__(rel) || rel.startsWith('#') || rel.startsWith('leccion.html')) return rel;
    return `${base.replace(/\/+$/, '')}/${rel.replace(/^\/+/, '')}`;
}

// Optimized lesson click handler with smooth animations
function createLessonClickHandler(href, courseBase) {
    return (event) => {
        event.preventDefault();
        
        const { sidebar, iframeContenido } = cachedElements;
        
        // Smooth sidebar close animation
        requestAnimationFrame(() => {
            sidebar.classList.remove('active');
            
            // Update iframe source
            if (iframeContenido) {
                iframeContenido.src = href;
                
                // Store last viewed lesson
                try {
                    if (courseBase) {
                        sessionStorage.setItem(`ultima-leccion:${courseBase}`, href);
                    }
                } catch (_) {
                    // Silent fail for sessionStorage issues
                }
                
                // Focus iframe after load with smooth transition
                requestAnimationFrame(() => {
                    setTimeout(() => iframeContenido.focus(), 100);
                });
            }
        });
    };
}

// Create lesson item with optimized DOM operations
function createLessonItem(leccion, href, courseBase, courseCarrera) {
    // Add career parameter if available
    let finalHref = href;
    if (courseCarrera && href && href !== '#') {
        const separator = href.includes('?') ? '&' : '?';
        finalHref += `${separator}carrera=${encodeURIComponent(courseCarrera)}`;
    }
    
    const li = document.createElement('li');
    li.classList.add('lesson-item', 'visible');
    
    // Create lesson link
    const lessonLink = document.createElement('a');
    lessonLink.href = finalHref;
    lessonLink.target = 'contenido';
    lessonLink.className = 'lesson-link';
    lessonLink.textContent = leccion.nombre;
    lessonLink.addEventListener('click', createLessonClickHandler(finalHref, courseBase));
    
    // Create print link with proper formatting
    const printHref = `${finalHref}${finalHref.includes('?') ? '&' : '?'}print-pdf&slideNumber=false`;
    const printLink = document.createElement('a');
    printLink.href = printHref;
    printLink.target = '_blank';
    printLink.className = 'print-icon';
    
    const printIcon = document.createElement('i');
    printIcon.className = 'fas fa-print';
    printLink.appendChild(printIcon);
    
    li.appendChild(lessonLink);
    li.appendChild(printLink);
    
    return { element: li, href: finalHref };
}

// Create unit section with lessons using DocumentFragment
function createUnidadSection(unidad, courseBase, courseCarrera) {
    const unidadDiv = document.createElement('div');
    
    const title = document.createElement('h3');
    title.textContent = unidad.nombre;
    unidadDiv.appendChild(title);
    
    const listaLecciones = document.createElement('ol');
    listaLecciones.classList.add('lesson-list');
    
    // Use DocumentFragment for batch DOM operations
    const fragment = document.createDocumentFragment();
    const lessonData = [];
    
    unidad.lecciones.forEach((leccion) => {
        if (leccion.enlace !== "#") {
            // Extract unit number from unidadNombre (e.g., "Unidad I" → "UnidadI")
            const unidadPath = unidad.nombre.replace(/\s+/g, '');
            
            // Build full lesson path: courseBase + "/" + unidadPath + "/" + enlace
            const fullLessonPath = `${courseBase}/${unidadPath}/${leccion.enlace}`;
            
            // Build lesson URL with automatic title
            const lessonUrl = `leccion.html?base=${encodeURIComponent(fullLessonPath)}&titulo=${encodeURIComponent(leccion.nombre)}`;
            
            const lessonResult = createLessonItem(leccion, lessonUrl, courseBase, courseCarrera);
            
            fragment.appendChild(lessonResult.element);
            lessonData.push(lessonResult.href);
        }
    });
    
    if (fragment.children.length > 0) {
        listaLecciones.appendChild(fragment);
        unidadDiv.appendChild(listaLecciones);
        return { element: unidadDiv, lessons: lessonData };
    }
    
    return null;
}

// Show error message with improved styling
function showErrorMessage(container, message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        color: #b00;
        margin: 1rem 0;
        padding: 1rem;
        border: 1px solid #f5c6cb;
        border-radius: 0.25rem;
        background-color: #f8d7da;
        text-align: center;
    `;
    errorDiv.textContent = message;
    
    container.innerHTML = '';
    container.appendChild(errorDiv);
}

// Main function to load lessons with performance optimizations
async function cargarLecciones() {
    try {
        // Initialize DOM cache
        const elements = initializeElementCache();
        
        // Course context variables with fallback to global window variables
        const courseBase = (typeof window !== 'undefined' && window.COURSE_BASE) ? window.COURSE_BASE : '';
        console.log('Course base path:', courseBase);
        const courseOpen = (typeof window !== 'undefined' && window.COURSE_OPEN) ? window.COURSE_OPEN : '';
        console.log('Course open lesson:', courseOpen);
        const courseCarrera = (typeof window !== 'undefined' && window.COURSE_CARRERA) ? window.COURSE_CARRERA : '';
        console.log('Course career:', courseCarrera);

        const { unidadesContainer, iframeContenido } = elements;
        
        // Determine JSON URL with fallback logic
        const jsonUrl = courseBase ? `${courseBase}/lecciones.json` : 'lecciones.json';
        console.log('Loading lessons from:', jsonUrl);
        let data;
        
        try {
            // Primary fetch attempt
            const response = await fetch(jsonUrl, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            data = await response.json();
        } catch (e) {
            // Fallback: try from current folder
            if (courseBase) {
                try {
                    const fallbackResponse = await fetch('lecciones.json', { cache: 'no-cache' });
                    if (!fallbackResponse.ok) throw new Error(`HTTP ${fallbackResponse.status}`);
                    data = await fallbackResponse.json();
                } catch (e2) {
                    throw new Error(`No se pudo cargar ${jsonUrl} ni el fallback lecciones.json`);
                }
            } else {
                throw e;
            }
        }

        // Check for empty unidades array
        if (!data.unidades || data.unidades.length === 0) {
            requestAnimationFrame(() => {
                // Clear sidebar
                unidadesContainer.innerHTML = '';
                
                // Show construction message in iframe
                if (iframeContenido) {
                    const constructionHTML = `
                        <!DOCTYPE html>
                        <html lang="es">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Módulo en Construcción</title>
                            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                            <style>
                                body {
                                    margin: 0;
                                    padding: 0;
                                    height: 100vh;
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: center;
                                    align-items: center;
                                    font-family: 'Arial', sans-serif;
                                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                                    color: #333;
                                }
                                .construction-container {
                                    text-align: center;
                                    max-width: 600px;
                                    padding: 2rem;
                                    background: white;
                                    border-radius: 15px;
                                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                                }
                                .construction-icon {
                                    font-size: 4em;
                                    color: #f39c12;
                                    margin-bottom: 1rem;
                                    animation: bounce 2s infinite;
                                }
                                .construction-title {
                                    font-size: 1.8em;
                                    margin-bottom: 1rem;
                                    color: #2c3e50;
                                }
                                .construction-message {
                                    font-size: 1.1em;
                                    color: #666;
                                    line-height: 1.6;
                                }
                                @keyframes bounce {
                                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                                    40% { transform: translateY(-10px); }
                                    60% { transform: translateY(-5px); }
                                }
                            </style>
                        </head>
                        <body>
                            <div class="construction-container">
                                <i class="fas fa-hard-hat construction-icon"></i>
                                <h2 class="construction-title">Módulo en Construcción</h2>
                                <p class="construction-message">
                                    Estamos trabajando en el contenido de este módulo.<br>
                                    Pronto estará disponible con lecciones y material de estudio.
                                </p>
                            </div>
                        </body>
                        </html>
                    `;
                    
                    const blob = new Blob([constructionHTML], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    iframeContenido.src = url;
                    
                    // Clean up the blob URL after loading
                    iframeContenido.onload = () => {
                        URL.revokeObjectURL(url);
                    };
                }
            });
            return;
        }

        // Track lesson links for auto-loading
        let firstHref = null;
        let openHref = courseOpen ? __join__(courseBase, courseOpen) : null;
        
        // Add career parameter to openHref if available
        if (openHref && courseCarrera) {
            const separator = openHref.includes('?') ? '&' : '?';
            openHref += `${separator}carrera=${encodeURIComponent(courseCarrera)}`;
        }
        
        // Use DocumentFragment for efficient DOM operations
        const mainFragment = document.createDocumentFragment();
        const allLessons = [];

        data.unidades.forEach((unidad) => {
            const unidadResult = createUnidadSection(unidad, courseBase, courseCarrera);
            
            if (unidadResult) {
                mainFragment.appendChild(unidadResult.element);
                
                // Track lessons for auto-loading
                unidadResult.lessons.forEach((href) => {
                    if (!firstHref) firstHref = href;
                    allLessons.push(href);
                });
            }
        });

        // Batch DOM update with smooth animation
        requestAnimationFrame(() => {
            unidadesContainer.innerHTML = '';
            unidadesContainer.appendChild(mainFragment);
            
            // Auto-load initial lesson with priority: open > stored > first available
            if (iframeContenido) {
                let storedHref = null;
                try {
                    if (courseBase) {
                        storedHref = sessionStorage.getItem(`ultima-leccion:${courseBase}`);
                    }
                } catch (_) {
                    // Silent fail for sessionStorage issues
                }
                
                const initialHref = openHref || storedHref || firstHref;
                
                if (initialHref) {
                    // Smooth iframe loading
                    requestAnimationFrame(() => {
                        iframeContenido.src = initialHref;
                        
                        // Update stored lesson if coming from open parameter
                        if (courseBase && openHref) {
                            try {
                                sessionStorage.setItem(`ultima-leccion:${courseBase}`, initialHref);
                            } catch (_) {
                                // Silent fail for sessionStorage issues
                            }
                        }
                    });
                }
            }
        });
        
    } catch (error) {
        console.error('Error al cargar las lecciones:', error);
        
        const { unidadesContainer } = cachedElements || initializeElementCache();
        
        if (unidadesContainer) {
            showErrorMessage(
                unidadesContainer,
                'No se pudieron cargar las lecciones. Verifica la ruta base y vuelve a intentar.'
            );
        }
    }
}

// Optimized mobile sidebar toggle with smooth animations
function initializeSidebarToggle() {
    const { menuToggle, sidebar } = initializeElementCache();
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            requestAnimationFrame(() => {
                sidebar.classList.toggle('active');
            });
        });
    }
}

// Enhanced page load handling with performance optimization
function initializePage() {
    // Initialize sidebar toggle
    initializeSidebarToggle();
    
    // Load lessons
    cargarLecciones();
}

// Robust page initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}