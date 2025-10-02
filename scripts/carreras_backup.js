// Función para cargar el JSON y generar el menú por facultades
async function cargarCarreras() {
    // Cache DOM elements
    const elements = {
        listaCarreras: document.getElementById('lista-carreras')
    };
    
    if (!elements.listaCarreras) {
        console.error('Elemento lista-carreras no encontrado');
        return;
    }
    
    try {
        const response = await fetch('data/carreras.json', {
            cache: 'no-cache',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Limpiar lista antes de agregar elementos
        elements.listaCarreras.innerHTML = '';
        
        // Usar DocumentFragment para operaciones DOM en batch
        const fragment = document.createDocumentFragment();

        // Ordenar facultades alfabéticamente por nombre
        const facultadesOrdenadas = [...data.facultades].sort((a, b) => 
            a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        );

        // Generar la lista de facultades
        facultadesOrdenadas.forEach(facultad => {
            // Obtener las carreras de esta facultad que tienen módulos
            const carrerasConModulos = facultad.carreras
                .map(carreraId => data.carreras.find(c => c.id === carreraId))
                .filter(carrera => carrera && carrera.modulos && carrera.modulos.length > 0);
            
            // Ordenar carreras alfabéticamente por nombre
            carrerasConModulos.sort((a, b) => 
                a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
            );
            
            // Solo mostrar facultades que tienen carreras con módulos
            if (carrerasConModulos.length > 0) {
                // Crear elemento de facultad
                const facLi = document.createElement('li');
                const facA = document.createElement('a');
                facA.href = '#';
                facA.innerHTML = `${facultad.nombre} <i class="fas fa-chevron-down"></i>`;
                facA.classList.add('facultad-link');
                
                // Crear lista de carreras para esta facultad
                const carrerasList = document.createElement('ul');
                carrerasList.classList.add('submenu');
                //carrerasList.style.display = 'none';

                // Agregar las carreras (ya ordenadas)
                carrerasConModulos.forEach(carrera => {
                    const carrLi = document.createElement('li');
                    const carrA = document.createElement('a');
                    carrA.href = '#';
                    carrA.textContent = carrera.nombre;
                    carrA.onclick = (e) => {
                        e.stopPropagation();
                        verCursos(carrera.id);
                        if (window.innerWidth <= 768) {
                            sidebar.classList.remove('active');
                        }
                    };
                    carrLi.appendChild(carrA);
                    carrerasList.appendChild(carrLi);
                });

                // Configurar el click para expandir/colapsar con animación
                facA.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Cerrar otros submenús primero
                    document.querySelectorAll('.submenu').forEach(sub => {
                        if (sub !== carrerasList) {
                            sub.classList.remove('active');
                            // Restaurar íconos de otras facultades
                            const parentLi = sub.parentElement;
                            if (parentLi) {
                                const icon = parentLi.querySelector('i');
                                if (icon) icon.className = 'fas fa-chevron-down';
                            }
                        }
                    });
                    // Alternar el submenú actual con animación
                    const isShowing = carrerasList.classList.contains('active');
                    carrerasList.classList.toggle('active');
                    // Cambiar el ícono
                    const icon = facA.querySelector('i');
                    icon.className = isShowing ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
                };

                facLi.appendChild(facA);
                facLi.appendChild(carrerasList);
                
                // Añadir al fragment en lugar de al DOM directamente
                fragment.appendChild(facLi);
            }
        });
        
        // Una sola operación DOM al final
        elements.listaCarreras.appendChild(fragment);
        
        // Animar elementos con requestAnimationFrame
        requestAnimationFrame(() => {
            const facultadLinks = elements.listaCarreras.querySelectorAll('.facultad-link');
            facultadLinks.forEach((link, index) => {
                link.style.opacity = '0';
                link.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        link.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        link.style.opacity = '1';
                        link.style.transform = 'translateY(0)';
                    });
                }, index * 50);
            });
        });

    } catch (error) {
        console.error('Error al cargar las carreras:', error);
        
        // Mostrar mensaje de error amigable al usuario
        if (elements.listaCarreras) {
            elements.listaCarreras.innerHTML = `
                <li style="color: #e53e3e; padding: 1rem; text-align: center;">
                    <i class="fas fa-exclamation-triangle"></i>
                    Error al cargar las carreras. Por favor, inténtalo de nuevo.
                </li>
            `;
        }
    }
}

// Función para mostrar los módulos de una carrera en el área de contenido
// Función para mostrar los módulos de una carrera en el área de contenido
async function verCursos(carreraId) {
    // Cache DOM elements
    const elements = {
        lista: document.getElementById('lista-cursos'),
        spinner: document.getElementById('loading-spinner'),
        mensaje: document.getElementById('mensaje-modulos'),
        titulo: document.querySelector('.section-title')
    };
    
    // Early return si elementos críticos no existen
    if (!elements.lista || !elements.spinner) {
        console.error('Elementos críticos no encontrados para mostrar cursos');
        return;
    }

    // Resetear contenido
    elements.lista.innerHTML = '';
    if (elements.mensaje) {
        elements.mensaje.style.display = 'none';
        elements.mensaje.textContent = '';
    }
    elements.lista.style.opacity = 0;
    elements.spinner.style.display = 'flex';

    try {
        const response = await fetch('data/carreras.json', { cache: 'no-cache' });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const carrera = data.carreras.find(c => c.id === carreraId);
        
        if (!carrera) {
            throw new Error(`Carrera con ID '${carreraId}' no encontrada`);
        }
        
        // Cambiar el título de la sección con el nombre de la carrera
        if (elements.titulo) {
            elements.titulo.innerHTML = `Lista de módulos disponibles para <em>${carrera.nombre}</em>`;
        }
        
        // Usar setTimeout para simular carga y mejorar UX
        setTimeout(() => {
            const modulos = carrera.modulos
                .map(moduloId => data.modulos_comunes[moduloId])
                .filter(modulo => modulo);

            const modulosValidos = modulos.filter(modulo => modulo.enlace !== "#");

            elements.spinner.style.display = 'none';

            if (modulosValidos.length === 0) {
                if (elements.mensaje) {
                    elements.mensaje.textContent = "No hay módulos disponibles para esta carrera.";
                    elements.mensaje.style.display = 'block';
                }
                return;
            }

            // Ocultar mensaje si existe
            if (elements.mensaje) {
                elements.mensaje.style.display = 'none';
            }

            // Ordenar módulos alfabéticamente
            modulosValidos.sort((a, b) =>
                a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
            );

            // Usar DocumentFragment para mejor performance
            const fragment = document.createDocumentFragment();

            modulosValidos.forEach((modulo, index) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.textContent = modulo.nombre;
                
                // Añadir parámetro carrera a la URL si no es placeholder
                let href = modulo.enlace;
                if (href && href !== '#') {
                    const separator = href.includes('?') ? '&' : '?';
                    href += `${separator}carrera=${encodeURIComponent(carreraId)}`;
                }
                
                a.href = href;
                a.classList.add('course-link');
                li.appendChild(a);
                fragment.appendChild(li);
            });

            // Una sola operación DOM
            elements.lista.appendChild(fragment);

            // Animar aparición con requestAnimationFrame
            requestAnimationFrame(() => {
                elements.lista.style.opacity = 1;
                
                const items = elements.lista.querySelectorAll('li');
                items.forEach((item, index) => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(10px)';
                    
                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        });
                    }, index * 50);
                });
            });
        }, 300);
        
    } catch (error) {
        console.error('Error al cargar módulos:', error);
        
        // Ocultar spinner y mostrar error
        elements.spinner.style.display = 'none';
        
        if (elements.mensaje) {
            elements.mensaje.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                Error al cargar los módulos. Por favor, inténtalo de nuevo.
            `;
            elements.mensaje.style.display = 'block';
            elements.mensaje.style.color = '#e53e3e';
        }
    }
}



// Función para recargar las carreras (se mantiene igual)
function recargarCarreras() {
    const lista = document.getElementById('lista-cursos');
    lista.innerHTML = '';
    document.querySelectorAll('.sidebar a').forEach(link => link.classList.remove('active'));
    // Restaurar el título de la sección
    const titulo = document.querySelector('.section-title');
    if (titulo) {
        titulo.innerHTML = 'Lista de módulos disponibles';
    }
}

// JavaScript para mostrar/ocultar la barra lateral en móviles (se mantiene igual)
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Cargar las carreras al iniciar la página
window.onload = cargarCarreras;