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

        // Generar la lista de facultades
        data.facultades.forEach(facultad => {
            // Obtener las carreras de esta facultad que tienen módulos
            const carrerasConModulos = facultad.carreras
                .map(carreraId => data.carreras.find(c => c.id === carreraId))
                .filter(carrera => carrera && carrera.modulos && carrera.modulos.length > 0);
            
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
                carrerasList.style.display = 'none';

                // Agregar las carreras
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

                // Configurar el click para expandir/colapsar
                facA.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Cerrar otros submenús primero
                    document.querySelectorAll('.submenu').forEach(sub => {
                        if (sub !== carrerasList) {
                            sub.style.display = 'none';
                            // Restaurar íconos de otras facultades
                            const parentLi = sub.parentElement;
                            if (parentLi) {
                                const icon = parentLi.querySelector('i');
                                if (icon) icon.className = 'fas fa-chevron-down';
                            }
                        }
                    });
                    
                    // Alternar el submenú actual
                    const isShowing = carrerasList.style.display === 'block';
                    carrerasList.style.display = isShowing ? 'none' : 'block';
                    
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

// Función para mostrar los módulos de una carrera (se mantiene igual)
function verCursos(carreraId) {
    const lista = document.getElementById('lista-cursos');
    const spinner = document.getElementById('loading-spinner');

    lista.innerHTML = '';
    lista.style.opacity = 0;
    spinner.style.display = 'flex';

    fetch('data/carreras.json', { cache: 'no-cache' })
        .then(response => response.json())
        .then(data => {
            const carrera = data.carreras.find(c => c.id === carreraId);
            if (carrera) {
                setTimeout(() => {
                    carrera.modulos.forEach((moduloId, index) => {
                        const modulo = data.modulos_comunes[moduloId];
                        if (modulo && modulo.enlace !== "#") {
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
                        }
                    });

                    lista.style.opacity = 1;
                    spinner.style.display = 'none';
                }, 500);
            }
        })
        .catch(error => console.error('Error al cargar los módulos:', error));
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