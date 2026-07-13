// Cached DOM elements for performance
let cachedElements = null;
const LESSON_PAGE_VERSION = '20260710';

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

function formatUnidadDisplayName(unidadNombre) {
    const raw = String(unidadNombre || '').trim();

    // Convert compact names like "UnidadI" -> "Unidad I" for menu display.
    const match = raw.match(/^(Unidad)([IVXLCDM]+|\d+)$/i);
    if (match) {
        return `${match[1]} ${match[2]}`;
    }

    return raw;
}

function normalizeMaterialPath(path) {
    return String(path || '').replace(/^\/+/, '').toLowerCase();
}

function isTallerSolutionMaterial(material) {
    const materialName = String(material?.nombre || '').toLowerCase();
    const materialPath = normalizeMaterialPath(material?.archivo);

    if (materialPath.startsWith('talleres/')) {
        return true;
    }

    return materialName.includes('solucion') && materialName.includes('taller');
}

function extractFirstNumber(value) {
    const match = String(value || '').match(/(\d+)/);
    if (!match || !match[1]) {
        return null;
    }
    return Number.parseInt(match[1], 10);
}

function extractLessonClassNumber(leccion, unidadNumber) {
    const fromLink = extractFirstNumber(leccion?.enlace);
    if (Number.isFinite(fromLink)) {
        if (fromLink < 100 && Number.isFinite(unidadNumber)) {
            return (unidadNumber * 100) + fromLink;
        }
        return fromLink;
    }

    const fromName = extractFirstNumber(leccion?.nombre);
    if (Number.isFinite(fromName)) {
        if (fromName < 100 && Number.isFinite(unidadNumber)) {
            return (unidadNumber * 100) + fromName;
        }
        return fromName;
    }

    return null;
}

function romanToInt(token) {
    const roman = String(token || '').toUpperCase().trim();
    if (!roman) {
        return null;
    }

    const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0;
    let previous = 0;

    for (let i = roman.length - 1; i >= 0; i--) {
        const current = values[roman[i]];
        if (!current) {
            return null;
        }
        if (current < previous) {
            total -= current;
        } else {
            total += current;
            previous = current;
        }
    }

    return total > 0 ? total : null;
}

function extractUnitNumber(unidadNombre) {
    const raw = String(unidadNombre || '').trim();
    const match = raw.match(/^Unidad\s*([IVXLCDM]+|\d+)$/i);
    if (!match || !match[1]) {
        return null;
    }

    const token = match[1];
    if (/^\d+$/.test(token)) {
        return Number.parseInt(token, 10);
    }

    return romanToInt(token);
}

function extractMaterialClassNumber(material, unidadNumber) {
    const materialName = String(material?.nombre || '');
    const nameMatch = materialName.match(/clase\s*(\d+)/i);
    if (nameMatch && nameMatch[1]) {
        const fromName = Number.parseInt(nameMatch[1], 10);
        if (Number.isFinite(fromName)) {
            // Backend can emit names like "Clase 10" for files in Unidad II.
            // In those cases we must map to the real lesson id (e.g. 210).
            if (fromName < 100 && Number.isFinite(unidadNumber)) {
                return (unidadNumber * 100) + fromName;
            }
            return fromName;
        }
    }

    const materialPath = String(material?.archivo || '');

    // Preferred format: solucion-taller-101.pdf -> clase 101
    const directClassMatch = materialPath.match(/(?:solucion[-_ ]*)?taller(?:es)?[-_ ]*(\d{3,})/i);
    if (directClassMatch && directClassMatch[1]) {
        const directClass = Number.parseInt(directClassMatch[1], 10);
        if (Number.isFinite(directClass)) {
            return directClass;
        }
    }

    // Pattern used in IntroMate: solucion-taller-2_10.pdf -> clase210
    const unitLessonMatch = materialPath.match(/(?:solucion[-_ ]*)?taller(?:es)?[-_ ]*(\d+)[-_](\d+)/i);
    if (unitLessonMatch && unitLessonMatch[1] && unitLessonMatch[2]) {
        const unit = Number.parseInt(unitLessonMatch[1], 10);
        const lessonInUnit = Number.parseInt(unitLessonMatch[2], 10);

        if (Number.isFinite(unit) && Number.isFinite(lessonInUnit)) {
            return (unit * 100) + lessonInUnit;
        }
    }

    const fromPath = extractFirstNumber(materialPath);
    if (Number.isFinite(fromPath)) {
        if (fromPath < 100 && Number.isFinite(unidadNumber)) {
            return (unidadNumber * 100) + fromPath;
        }
        return fromPath;
    }

    return null;
}

function buildMaterialLink(courseBase, material, labelOverride) {
    const materialLink = document.createElement('a');
    materialLink.href = `${courseBase}/${material.archivo}`;
    materialLink.target = '_blank';
    materialLink.rel = 'noopener noreferrer';

    const extension = String(material.archivo || '').split('.').pop().toLowerCase();
    let icon = 'fa-file';
    if (extension === 'pdf') icon = 'fa-file-pdf';
    else if (['doc', 'docx'].includes(extension)) icon = 'fa-file-word';
    else if (['xls', 'xlsx'].includes(extension)) icon = 'fa-file-excel';
    else if (['zip', 'rar'].includes(extension)) icon = 'fa-file-archive';

    const linkLabel = labelOverride || material.nombre;
    materialLink.innerHTML = `<i class="fas ${icon}"></i> ${linkLabel}`;
    return materialLink;
}

function splitUnitMaterialsByLesson(unidad) {
    const lessonSolutionsByClass = new Map();
    const generalMaterials = [];
    const unidadNumber = extractUnitNumber(unidad?.nombre);

    (unidad?.materiales || []).forEach((material) => {
        if (!isTallerSolutionMaterial(material)) {
            generalMaterials.push(material);
            return;
        }

        const classNumber = extractMaterialClassNumber(material, unidadNumber);
        if (!Number.isFinite(classNumber)) {
            // Keep unmatched files visible in the general section.
            generalMaterials.push(material);
            return;
        }

        if (!lessonSolutionsByClass.has(classNumber)) {
            lessonSolutionsByClass.set(classNumber, []);
        }
        lessonSolutionsByClass.get(classNumber).push(material);
    });

    return { lessonSolutionsByClass, generalMaterials };
}

function canViewUnitMaterials() {
    return true;
}

async function waitForLessonMenuAuth() {
    return Promise.resolve();
}

function parseCourseBase(courseBase) {
    const normalized = String(courseBase || '').replace(/^\/+/, '').replace(/^data\//, '');
    const parts = normalized.split('/').filter(Boolean);

    if (parts.length < 2) {
        return null;
    }

    return {
        carrera: parts[0],
        modulo: parts.slice(1).join('/'),
    };
}

function resolveCourseBase() {
    if (typeof window !== 'undefined' && window.COURSE_BASE) {
        return window.COURSE_BASE;
    }

    try {
        const params = new URLSearchParams(window.location.search);
        const baseParam = params.get('base') || '';
        if (!baseParam) return '';
        return baseParam.startsWith('data/') ? baseParam : `data/${baseParam}`;
    } catch (_) {
        return '';
    }
}

async function fetchLeccionesFromApi(courseBase) {
    const jsonUrl = courseBase ? `${courseBase}/lecciones.json` : 'lecciones.json';

    try {
        const response = await fetch(jsonUrl, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        if (!courseBase) {
            throw error;
        }

        const fallbackResponse = await fetch('lecciones.json', { cache: 'no-cache' });
        if (!fallbackResponse.ok) {
            throw new Error(`No se pudo cargar ${jsonUrl} ni el fallback lecciones.json`);
        }
        return fallbackResponse.json();
    }
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
    
    // Create print button (not link) with proper formatting
    const printHref = `${finalHref}${finalHref.includes('?') ? '&' : '?'}print-pdf`;
    const printButton = document.createElement('button');
    printButton.type = 'button';
    printButton.className = 'print-icon';
    printButton.title = 'Imprimir presentación';
    
    const printIcon = document.createElement('i');
    printIcon.className = 'fas fa-print';
    printButton.appendChild(printIcon);
    
    // Handler para abrir ventana de impresión con carga controlada
    printButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Abrir ventana en blanco primero
        const printWindow = window.open('about:blank', '_blank');
        
        if (!printWindow) {
            alert('Por favor, permite las ventanas emergentes para imprimir');
            return;
        }
                
        // Cargar la URL real después de un pequeño delay
        setTimeout(() => {
            printWindow.location.href = printHref;
        }, 100);
    });
    
    li.appendChild(lessonLink);
    li.appendChild(printButton);
    
    return { element: li, href: finalHref };
}

// Create unit section with lessons using DocumentFragment
function createUnidadSection(unidad, courseBase, courseCarrera, showMaterials) {
    const unidadDiv = document.createElement('div');
    unidadDiv.className = 'unidad-section';
    const unidadDisplayName = formatUnidadDisplayName(unidad.nombre);
    const unidadNumber = extractUnitNumber(unidad.nombre);
    const { lessonSolutionsByClass, generalMaterials } = splitUnitMaterialsByLesson(unidad);
    
    const title = document.createElement('h3');
    title.className = 'unidad-toggle';
    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');
    title.setAttribute('aria-expanded', 'false');

    const titleText = document.createElement('span');
    titleText.textContent = unidadDisplayName;

    const toggleIcon = document.createElement('i');
    toggleIcon.className = 'unidad-toggle-icon';
    toggleIcon.textContent = '+';
    toggleIcon.setAttribute('aria-hidden', 'true');

    title.appendChild(titleText);
    title.appendChild(toggleIcon);
    unidadDiv.appendChild(title);

    const unidadContent = document.createElement('div');
    unidadContent.className = 'unidad-content';
    unidadContent.hidden = true;
    
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
            const lessonUrl = `leccion.html?v=${encodeURIComponent(LESSON_PAGE_VERSION)}&base=${encodeURIComponent(fullLessonPath)}&titulo=${encodeURIComponent(leccion.nombre)}`;
            
            const lessonResult = createLessonItem(leccion, lessonUrl, courseBase, courseCarrera);

            const classNumber = extractLessonClassNumber(leccion, unidadNumber);
            const lessonSolutions = Number.isFinite(classNumber)
                ? (lessonSolutionsByClass.get(classNumber) || [])
                : [];

            if (showMaterials && lessonSolutions.length > 0) {
                const subItems = document.createElement('ul');
                subItems.className = 'lesson-subitems';

                lessonSolutions.forEach((solution) => {
                    const subItem = document.createElement('li');
                    subItem.className = 'lesson-subitem';

                    const solutionLink = buildMaterialLink(courseBase, solution, 'Respuestas a los talleres');
                    solutionLink.classList.add('lesson-subitem-link');
                    subItem.appendChild(solutionLink);
                    subItems.appendChild(subItem);
                });

                lessonResult.element.appendChild(subItems);
            }
            
            fragment.appendChild(lessonResult.element);
            lessonData.push(lessonResult.href);
        }
    });
    
    if (fragment.children.length > 0) {
        listaLecciones.appendChild(fragment);
        unidadContent.appendChild(listaLecciones);
        
        // Add collapsible materials section at the end if available
        if (showMaterials && generalMaterials.length > 0) {
            const materialesWrapper = document.createElement('div');
            materialesWrapper.className = 'materiales-wrapper';
            
            // Create collapsible button
            const materialesToggle = document.createElement('button');
            materialesToggle.className = 'materiales-toggle';
            materialesToggle.type = 'button';
            materialesToggle.innerHTML = `<i class="fas fa-folder-open"></i>&nbsp; Material Complementario ${unidadDisplayName} <i class="fas fa-chevron-down toggle-icon"></i>`;
            
            // Create collapsible content
            const materialesContent = document.createElement('div');
            materialesContent.className = 'materiales-content';
            
            const materialesList = document.createElement('ul');
            materialesList.className = 'materiales-list';
            
            generalMaterials.forEach(material => {
                const listItem = document.createElement('li');

                const materialLink = buildMaterialLink(courseBase, material);
                listItem.appendChild(materialLink);
                materialesList.appendChild(listItem);
            });
            
            materialesContent.appendChild(materialesList);
            
            // Toggle functionality
            materialesToggle.addEventListener('click', () => {
                const isOpen = materialesToggle.classList.toggle('active');
                materialesContent.classList.toggle('active');
                
                // Smooth animation
                if (isOpen) {
                    materialesContent.style.maxHeight = materialesContent.scrollHeight + 'px';
                } else {
                    materialesContent.style.maxHeight = '0';
                }
            });
            
            materialesWrapper.appendChild(materialesToggle);
            materialesWrapper.appendChild(materialesContent);
            unidadContent.appendChild(materialesWrapper);
        }

        const setUnidadExpanded = (expanded) => {
            unidadContent.hidden = !expanded;
            title.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            toggleIcon.textContent = expanded ? '-' : '+';
        };

        const collapseOtherUnits = () => {
            const parent = unidadDiv.parentElement;
            if (!parent) return;

            parent.querySelectorAll('.unidad-section').forEach((section) => {
                if (section === unidadDiv) return;

                const otherTitle = section.querySelector(':scope > .unidad-toggle');
                const otherContent = section.querySelector(':scope > .unidad-content');
                const otherIcon = otherTitle ? otherTitle.querySelector('.unidad-toggle-icon') : null;

                if (otherTitle && otherContent) {
                    otherContent.hidden = true;
                    otherTitle.setAttribute('aria-expanded', 'false');
                    if (otherIcon) {
                        otherIcon.textContent = '+';
                    }
                }
            });
        };

        title.addEventListener('click', () => {
            const isExpanded = title.getAttribute('aria-expanded') === 'true';
            if (!isExpanded) {
                collapseOtherUnits();
            }
            setUnidadExpanded(!isExpanded);
        });

        title.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const isExpanded = title.getAttribute('aria-expanded') === 'true';
                if (!isExpanded) {
                    collapseOtherUnits();
                }
                setUnidadExpanded(!isExpanded);
            }
        });

        unidadDiv.appendChild(unidadContent);
        
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
        await waitForLessonMenuAuth();
        
        // Course context variables with fallback to global window variables
        const courseBase = resolveCourseBase();
        const courseOpen = (typeof window !== 'undefined' && window.COURSE_OPEN) ? window.COURSE_OPEN : '';
        const courseCarrera = (typeof window !== 'undefined' && window.COURSE_CARRERA) ? window.COURSE_CARRERA : '';
        const showMaterials = canViewUnitMaterials();

        const { unidadesContainer, iframeContenido } = elements;
        
        let data;

        if (!courseBase) {
            throw new Error('No se pudo determinar COURSE_BASE para cargar lecciones');
        }

        data = await fetchLeccionesFromApi(courseBase);

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
            const unidadResult = createUnidadSection(unidad, courseBase, courseCarrera, showMaterials);
            
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
                        
                        // Fix career parameter if stored URL exists and current career is different
                        if (storedHref && courseCarrera) {
                            const url = new URL(storedHref, window.location.origin);
                            const storedCarrera = url.searchParams.get('carrera');
                            
                            // Update career parameter if it's different from current
                            if (storedCarrera !== courseCarrera) {
                                url.searchParams.set('carrera', courseCarrera);
                                storedHref = url.pathname + url.search;
                            }
                        }
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
        
        
        const { unidadesContainer } = cachedElements || initializeElementCache();
        
        if (unidadesContainer) {
            showErrorMessage(
                unidadesContainer,
                `No se pudieron cargar las lecciones (${error?.message || 'error desconocido'}).`
            );
        }
    }
}

// Optimized mobile sidebar toggle with smooth animations
function initializeSidebarToggle() {
    const { menuToggle, sidebar } = initializeElementCache();

    if (menuToggle && sidebar) {
        if (menuToggle.dataset.sidebarBound !== 'true') {
            menuToggle.addEventListener('click', () => {
                requestAnimationFrame(() => {
                    sidebar.classList.toggle('active');
                });
            });
            menuToggle.dataset.sidebarBound = 'true';
        }
        return true;
    }

    return false;
}

// Enhanced page load handling with performance optimization
async function initializePage() {
    // Initialize sidebar toggle
    if (!initializeSidebarToggle()) {
        let attempts = 0;
        const maxAttempts = 30;
        const intervalId = setInterval(() => {
            attempts += 1;
            cachedElements = null; // Releer nodos luego de inyección del header.
            if (initializeSidebarToggle() || attempts >= maxAttempts) {
                clearInterval(intervalId);
            }
        }, 100);
    }
    
    // Esperar a que course-shell.js establezca las variables globales
    await waitForCourseVariables();
    
    // Load lessons
    cargarLecciones();
}

// Helper para esperar a que course-shell.js establezca las variables
function waitForCourseVariables() {
    return new Promise((resolve) => {
        // Si ya están disponibles, continuar
        if (window.COURSE_BASE || resolveCourseBase()) {
            resolve();
            return;
        }
        
        // Esperar hasta 8 segundos para dar tiempo a course-shell/auth
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (window.COURSE_BASE || resolveCourseBase()) {
                clearInterval(checkInterval);
                resolve();
            } else if (attempts > 80) { // 8 segundos
                clearInterval(checkInterval);
                
                resolve();
            }
        }, 100);
    });
}

// Robust page initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}