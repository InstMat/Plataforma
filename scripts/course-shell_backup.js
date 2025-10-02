(function () {
  // Leer parámetros de URL directamente
  const urlParams = new URLSearchParams(location.search);
  const base = urlParams.get('base') || '';
  const titulo = urlParams.get('titulo') || (base ? base.split('/').slice(-1)[0] : 'Curso');
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
