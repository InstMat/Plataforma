# Instrucciones Copilot para Plataforma Matemática

## Arquitectura del Proyecto
Plataforma educativa web modular con 3 capas principales:
- **Capa de datos**: JSON estructurado (`data/`) para carreras, módulos y lecciones
- **Capa de presentación**: Reveal.js + MathJax para slides educativas interactivas
- **Capa de navegación**: Sistema de shells dinámicos para exploración de contenido

### Estructura de Datos Clave
```
data/carreras.json          # Mapeo de facultades → carreras → módulos
data/FEN/modulo/lecciones.json    # Lecciones por unidad (ej: clase01, clase02)
FEN/Matematicas-AUD-CPA/UnidadV/clase16.html  # Slides Reveal.js individuales
```

## Flujos de Trabajo Críticos

### Servidor Local (Obligatorio)
```bash
python -m http.server 8000    # En raíz del proyecto
# Navega a http://localhost:8000
```

### Pipeline de Contenido Pandoc
```bash
# LaTeX → HTML presentación
pandoc -s --mathjax -t revealjs -i INPUT.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=reveal.html -c style.css

# LaTeX → HTML página única
pandoc -s --mathjax -i INPUT.tex -o OUTPUT.html --lua-filter=remove-num.lua --template=default.html -c style.css
```
**Crítico**: El filtro `remove-num.lua` es específico del proyecto - elimina numeración automática de teoremas/ejemplos.

### Sistema de Shells Dinámicos
- `curso.html?base=FEN/Matematicas-AUD-CPA&titulo=Matemática` → Carga shell con navegación lateral
- `scripts/course-shell.js` + `scripts/lecciones.js` manejan carga dinámica iframe
- `scripts/lesson-shell.js` detecta y configura applets GeoGebra automáticamente

## Patrones Específicos del Proyecto

### Bloques de Contenido Matemático (CSS Crítico)
```css
.example, .definition, .theorem, .solution, .remark {
    /* Auto-numeración con contadores CSS */
    counter-increment: example-counter;
}
.example::before { content: "Ejemplo. "; }
```
**Patrón**: Usa estas clases para contenido matemático - auto-estilizado con headers coloreados.

### Applets GeoGebra (Patrón Obligatorio)
```html
<div class="ggb-wrapper">
    <div id="ggb-element-1"></div>
    <img src="path/image.png" alt="Versión impresión" class="ggb-print-img">
</div>
```
```javascript
var applet1 = new GGBApplet({
    width: 1000, height: 600,
    filename: "clase16/derivada.ggb"
}, true);
applet1.inject('ggb-element-1');
```
**Crítico**: `.ggb-print-img` se muestra automáticamente al imprimir/exportar PDF via CSS `@media print`.

### Configuración MathJax (Pre-optimizada)
- `scripts/mathjax-config.js` tiene configuración de rendimiento específica
- Macros pre-definidas: `\RR`, `\NN`, `\ZZ` para conjuntos numéricos
- **No modificar** sin probar rendimiento en presentaciones largas

### Sistema de Modales Interactivos
```javascript
// Patrón modular para términos matemáticos
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}
```

## Convenciones de Archivos

### Estructura de Clases HTML
```
FEN/Matematicas-AUD-CPA/
├── index.html           # Landing específico del módulo
├── lecciones.json       # Navegación lateral
└── UnidadV/
    ├── clase16.html     # Slides Reveal.js individuales
    └── clase16/         # Assets específicos (ggb, png)
```

### URLs de Navegación
- Módulo: `curso.html?base=FEN/Matematicas-AUD-CPA&titulo=Matemática`
- Lección: `leccion.html?base=FEN/Matematicas-AUD-CPA&unidad=UnidadV&clase=clase16`

## Puntos de Integración Críticos

### Inicialización Reveal.js
`scripts/lesson-reveal-init.js` - configuración estándar (NO modificar dimensiones sin probar applets)

### Detección de Applets
`lesson-shell.js` busca automáticamente scripts con `GGBApplet` y carga `deployggb.js`

### Exportación PDF
URL: `leccion.html?base=...&print-pdf` activa modo impresión - verifica que applets se reemplacen por imágenes.

## Debugging y Desarrollo

### Errores Comunes
- **Applets no cargan**: Verificar que `deployggb.js` esté cargado antes de `inject()`
- **MathJax no renderiza**: Verificar configuración en `mathjax-config.js` cargada antes de contenido
- **Navegación rota**: Verificar estructura JSON en `lecciones.json` coincide con archivos físicos

### Performance
- CSS `will-change` ya optimizado en elementos animados
- MathJax tiene cache pre-configurado para macros comunes
- Applets GeoGebra auto-detectan tamaño contenedor via CSS wrapper
