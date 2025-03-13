// Función para cargar el JSON y generar el menú
async function cargarCarreras() {
    try {
        const response = await fetch('data/carreras.json', {
            cache: 'no-cache', // Evita usar la caché
        });
        const data = await response.json();
        const listaCarreras = document.getElementById('lista-carreras');
        
        // Limpiar lista antes de agregar elementos
        listaCarreras.innerHTML = '';

        // Generar la lista de carreras con módulos
        data.carreras
            .filter(carrera => carrera.modulos && carrera.modulos.length > 0) // Filtrar solo carreras con módulos
            .forEach(carrera => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#';
                a.innerHTML = `${carrera.nombre} <i class="fas fa-chevron-right"></i>`;
                a.onclick = () => {
                    verCursos(carrera.id);
                    if (window.innerWidth <= 768) { // Solo en móviles
                        sidebar.classList.remove('active');
                    }
                };
                li.appendChild(a);
                listaCarreras.appendChild(li);
            });

        // Ordenar la lista alfabéticamente
        ordenarLista();
    } catch (error) {
        console.error('Error al cargar las carreras:', error);
    }
}

// Función para mostrar los módulos de una carrera
function verCursos(carreraId) {
    const lista = document.getElementById('lista-cursos');
    const spinner = document.getElementById('loading-spinner');

    lista.innerHTML = '';
    lista.style.opacity = 0;
    spinner.style.display = 'flex'; // Mostrar spinner

    fetch('data/carreras.json', { cache: 'no-cache' })
        .then(response => response.json())
        .then(data => {
            const carrera = data.carreras.find(c => c.id === carreraId);
            if (carrera) {
                setTimeout(() => {
                    carrera.modulos.forEach((moduloId, index) => {
                        // Buscar el módulo en modulos_comunes
                        const modulo = data.modulos_comunes[moduloId];

                        // Filtrar módulos que tienen enlace "#"
                        if (modulo && modulo.enlace !== "#") {
                            const li = document.createElement('li');
                            const a = document.createElement('a');
                            a.textContent = modulo.nombre;
                            a.href = modulo.enlace;
                            a.classList.add('course-link');
                            li.appendChild(a);
                            lista.appendChild(li);

                            // Aplicar animación con retraso incremental
                            setTimeout(() => {
                                li.classList.add('visible');
                            }, index * 100);
                        }
                    });

                    lista.style.opacity = 1;
                    spinner.style.display = 'none'; // Ocultar spinner
                }, 500); // Simular retraso de carga
            } else {
                console.error(`Carrera con ID "${carreraId}" no encontrada.`);
            }
        })
        .catch(error => console.error('Error al cargar los módulos:', error));
}

// Función para ordenar la lista alfabéticamente
function ordenarLista() {
    const lista = document.getElementById('lista-carreras');
    const items = Array.from(lista.getElementsByTagName('li'));

    items.sort((a, b) => {
        const textoA = a.textContent.trim().toLowerCase();
        const textoB = b.textContent.trim().toLowerCase();
        return textoA.localeCompare(textoB);
    });

    lista.innerHTML = '';
    items.forEach(item => lista.appendChild(item));
}

// Función para recargar las carreras
function recargarCarreras() {
    const lista = document.getElementById('lista-cursos');
    lista.innerHTML = '';
    document.querySelectorAll('.sidebar a').forEach(link => link.classList.remove('active'));
}

// JavaScript para mostrar/ocultar la barra lateral en móviles
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

// Mostrar/ocultar la barra lateral al hacer clic en el botón de menú
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Cargar las carreras al iniciar la página
window.onload = cargarCarreras;
