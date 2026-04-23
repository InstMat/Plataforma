(function () {
  // Leer parámetros de URL directamente
  const urlParams = new URLSearchParams(location.search);
  const baseParam = urlParams.get('base') || '';
  console.log('Base parameter from URL:', baseParam);
  
  // Agregar prefijo "data/" automáticamente si no está presente
  const base = baseParam.startsWith('data/') ? baseParam : `data/${baseParam}`;
  console.log('Computed base path:', base);
  const titulo = urlParams.get('titulo') || (baseParam ? baseParam.split('/').slice(-1)[0] : 'Curso');
  const open = urlParams.get('open') || '';
  const carrera = urlParams.get('carrera') || '';

  // Expose to lecciones.js
  window.COURSE_BASE = base;
  window.COURSE_CARRERA = carrera;
  if (open) window.COURSE_OPEN = open;

  // Title updates
  document.title = titulo;
  const h2 = document.getElementById('course-title');
  if (h2) h2.textContent = titulo;
})();
