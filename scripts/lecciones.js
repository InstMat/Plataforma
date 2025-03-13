// Función para cargar las lecciones desde el JSON
async function cargarLecciones() {
    try {
        const response = await fetch('lecciones.json', {
            cache: 'no-cache', // Evita usar la caché
        }); 
        const data = await response.json();
        const unidadesContainer = document.getElementById('unidades-container');
        
        // Limpiar el contenedor antes de agregar nuevas unidades
        unidadesContainer.innerHTML = '';

        // Generar las unidades y lecciones
        data.unidades.forEach(unidad => {
            const unidadDiv = document.createElement('div');
            unidadDiv.innerHTML = `<h3>${unidad.nombre}</h3>`;
            const listaLecciones = document.createElement('ol');
            listaLecciones.classList.add('lesson-list');

            unidad.lecciones.forEach(leccion => {
                // Filtrar lecciones con enlace "#"
                if (leccion.enlace !== "#") {
                    const li = document.createElement('li');
                    li.classList.add('lesson-item', 'visible');
                    li.innerHTML = `
                        <a href="${leccion.enlace}" target="contenido" class="lesson-link">
                            ${leccion.nombre}
                        </a>
                        <a href="${leccion.enlace}?print-pdf&slideNumber=false" target="_blank" class="print-icon">
                            <i class="fas fa-print"></i>
                        </a>
                    `;

                    // Agregar evento de clic para ocultar la barra lateral
                    li.querySelector('.lesson-link').addEventListener('click', () => {
                        sidebar.classList.remove('active');
                    });

                    listaLecciones.appendChild(li);
                }
            });

            if (listaLecciones.children.length > 0) {
                unidadDiv.appendChild(listaLecciones);
                unidadesContainer.appendChild(unidadDiv);
            }
        });
    } catch (error) {
        console.error('Error al cargar las lecciones:', error);
    }
}

// JavaScript para mostrar/ocultar la barra lateral en móviles
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Cargar las lecciones al iniciar la página
window.onload = cargarLecciones;
