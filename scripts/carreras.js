// Función para cargar el JSON y generar el menú por facultades
async function cargarCarreras() {
    try {
        const response = await fetch('data/carreras.json', {
            cache: 'no-cache',
        });
        const data = await response.json();
        const listaCarreras = document.getElementById('lista-carreras');
        
        // Limpiar lista antes de agregar elementos
        listaCarreras.innerHTML = '';

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
                listaCarreras.appendChild(facLi);
            }
        });

    } catch (error) {
        console.error('Error al cargar las carreras:', error);
    }
}

// Función para mostrar los módulos de una carrera en el área de contenido
function verCursos(carreraId) {
    const lista = document.getElementById('lista-cursos');
    const spinner = document.getElementById('loading-spinner');
    const mensaje = document.getElementById('mensaje-modulos');
    const titulo = document.querySelector('.section-title');

    // Resetear contenido
    lista.innerHTML = '';
    mensaje.style.display = 'none';
    mensaje.textContent = '';
    lista.style.opacity = 0;
    spinner.style.display = 'flex';

    fetch('data/carreras.json', { cache: 'no-cache' })
        .then(response => response.json())
        .then(data => {
            const carrera = data.carreras.find(c => c.id === carreraId);
            if (carrera) {
                // Cambiar el título de la sección con el nombre de la carrera
                if (titulo) {
                    titulo.innerHTML = `Lista de módulos disponibles para <em>${carrera.nombre}</em>`;
                }
                setTimeout(() => {
                    const modulos = carrera.modulos
                        .map(moduloId => data.modulos_comunes[moduloId])
                        .filter(modulo => modulo);

                    const modulosValidos = modulos.filter(modulo => modulo.enlace !== "#");

                    if (modulosValidos.length === 0) {
                        mensaje.textContent = "No hay módulos disponibles para esta carrera.";
                        mensaje.style.display = 'block';
                    } else {
                        mensaje.style.display = 'none';

                        // Ordenar módulos alfabéticamente
                        modulosValidos.sort((a, b) =>
                            a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
                        );

                        modulosValidos.forEach((modulo, index) => {
                            const li = document.createElement('li');
                            const a = document.createElement('a');
                            a.textContent = modulo.nombre;
                            a.href = modulo.enlace;
                            a.classList.add('course-link');
                            li.appendChild(a);
                            lista.appendChild(li);

                            setTimeout(() => {
                                li.classList.add('visible');
                            }, index * 100);
                        });
                    }

                    lista.style.opacity = 1;
                    spinner.style.display = 'none';
                }, 500);
            }
        })
        .catch(error => {
            console.error('Error al cargar los módulos:', error);
            mensaje.textContent = "Error al cargar los módulos.";
            mensaje.style.display = 'block';
            spinner.style.display = 'none';
        });
}



// Función para recargar las carreras (se mantiene igual)
function recargarCarreras() {
    const lista = document.getElementById('lista-cursos');
    lista.innerHTML = '';
    document.querySelectorAll('.sidebar a').forEach(link => link.classList.remove('active'));
}

// JavaScript para mostrar/ocultar la barra lateral en móviles (se mantiene igual)
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Cargar las carreras al iniciar la página
window.onload = cargarCarreras;