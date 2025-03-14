// Función para cargar las lecciones desde el JSON
// Función para cargar las lecciones desde el JSON
async function cargarLecciones() {
    try {
        const response = await fetch('lecciones.json', {
            cache: 'no-cache',
        });
        const data = await response.json();
        const unidadesContainer = document.getElementById('unidades-container');
        const iframeContenido = document.querySelector("iframe[name='contenido']"); // Seleccionamos el iframe

        unidadesContainer.innerHTML = '';

        data.unidades.forEach(unidad => {
            const unidadDiv = document.createElement('div');
            unidadDiv.innerHTML = `<h3>${unidad.nombre}</h3>`;
            const listaLecciones = document.createElement('ol');
            listaLecciones.classList.add('lesson-list');

            unidad.lecciones.forEach(leccion => {
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

                    // Evento para cerrar la barra lateral y enfocar el iframe
                    li.querySelector('.lesson-link').addEventListener('click', (event) => {
                        event.preventDefault(); // Evita que el navegador siga el enlace directamente
                        sidebar.classList.remove('active');
                        iframeContenido.src = leccion.enlace; // Cambia el contenido del iframe
                        setTimeout(() => iframeContenido.focus(), 100); // Da un pequeño retraso y enfoca
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
