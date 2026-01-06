# Frontend Plataforma de Módulos Matemáticos

Este proyecto es una **plataforma educativa web modular** que permite a los usuarios explorar módulos matemáticos asociados a diferentes carreras. La plataforma utiliza una arquitectura de 3 capas (datos JSON, presentación Reveal.js + MathJax, y navegación dinámica) para ofrecer una experiencia educativa interactiva y optimizada.

---

## Características principales

### Navegación y UI
- **Sistema de shells dinámicos**: Carga de contenido via URL parameters (`curso.html?base=...`)
- **Menú lateral interactivo**: Lista de carreras con animaciones y efectos hover
- **Grilla de módulos responsive**: Adaptación automática a diferentes tamaños de pantalla
- **Modales interactivos**: Sistema modular para términos matemáticos con soporte fullscreen móvil

### Contenido Educativo
- **Presentaciones Reveal.js optimizadas**: Slides con inicialización automática y configuración estandarizada
- **Renderizado matemático avanzado**: MathJax con macros pre-definidas (`\RR`, `\NN`, `\ZZ`) y cache optimizado
- **Bloques de contenido matemático**: Auto-estilizado con CSS counters (`.example`, `.definition`, `.theorem`)
- **Visualizaciones GeoGebra**: Applets con auto-detección, centrado dinámico y reemplazo automático por imágenes al imprimir

### Performance y Desarrollo
- **Carga dinámica optimizada**: Cache de datos JSON y DocumentFragment para operaciones DOM
- **Pipeline Pandoc personalizado**: Filtro `remove-num.lua` específico del proyecto
- **Exportación PDF mejorada**: URL `?print-pdf` con reemplazo automático de applets por imágenes estáticas

---

## Tecnologías utilizadas

### Core Frontend
- **HTML5**: Estructura semántica con optimizaciones de performance
- **CSS3**: Estilos con `will-change`, media queries y CSS counters para auto-numeración
- **JavaScript ES6+**: Módulos, async/await, DocumentFragment y cache optimizado
- **FontAwesome**: Íconos con preload y CDN fallback

### Frameworks Educativos
- **Reveal.js**: Presentaciones con configuración estandarizada (`lesson-reveal-init.js`)
- **MathJax 4**: Renderizado optimizado con macros pre-definidas y cache
- **GeoGebra**: Applets con auto-detección, deployggb.js y responsive wrapper
- **Pandoc + Lua**: Pipeline de conversión LaTeX→HTML con filtros personalizados

### Arquitectura de Datos
- **JSON estructurado**: Mapeo carreras→módulos→lecciones en `data/`
- **Shells dinámicos**: `course-shell.js`, `lesson-shell.js` para navegación
- **URL parameters**: Sistema de routing cliente (`?base=...&titulo=...`)

---

## Estructura del Proyecto

```
Plataforma/
├── .github/                    # Configuración GitHub (Copilot instructions)
│   └── copilot-instructions.md
├── data/                       # Datos JSON estructurados
│   ├── carreras.json          # Mapeo de carreras y módulos (editar solo si sabe lo que está haciendo)
│   ├── FEN/                   # Facultad de Economía y Negocios + Administración Pública
│   │   ├── AlgLin/
│   │   ├── Calc/
│   │   ├── Esta/
│   │   ├── Mat-AdmPub/
│   │   ├── MatI/
│   │   ├── MatII/
│   │   ├── MatIII/
│   │   ├── MatIV/
│   │   └── MetMat/
│   ├── Ingenieria/            # Facultad de Ingeniería
│   │   ├── Alg/
│   │   ├── AlgLin/
│   │   ├── CalcI/
│   │   ├── CalcII/
│   │   ├── EDO/
│   │   ├── IntroMate/
│   │   └── ProbEsta/
│   ├── Pedagogia/             # Pedagogía en Matemáticas
│   │   ├── AlgAbs/
│   │   ├── AlgAbsII/
│   │   ├── AlgLin/
│   │   ├── CalcDife/
│   │   ├── CalcInte/
│   │   ├── CalcVV/
│   │   ├── Estad/
│   │   ├── FundMate/
│   │   ├── GeomI/
│   │   ├── GeomII/
│   │   ├── GeomIII/
│   │   └── Proba/
│   └── Salud/                 # Facultad de Ciencias de la Salud
│       ├── MatBas/
│       ├── MatI/
│       └── MatII/
├── images/                     # Recursos gráficos
│   └── ...
├── reveal/                    # Framework Reveal.js (v5.2.0)
│   ├── ...
├── scripts/                   # Lógica JavaScript del proyecto
│   ├── carreras.js            # Carga carreras en index.html
│   ├── course-shell.js        # Shell dinámico para curso.html
│   ├── lecciones.js           # Renderiza lista de lecciones
│   ├── lesson-reveal-init.js  # Config estandarizada Reveal.js
│   ├── lesson-shell.js        # Shell dinámico para leccion.html
│   ├── login.js               # Sistema de autenticación
│   ├── mathjax-config.js      # Configuración MathJax con macros
│   └── reveal-init.js         # Inicialización general Reveal.js
├── styles/                    # Hojas de estilo
│   ├── landing.css            # Estilos página principal
│   └── style.css              # Estilos globales + CSS counters
├── wiki/                      # Documentación y tutoriales
│   ├── index.html
│   ├── editando-html-y-revealjs.html
│   ├── uso-basico-de-pandoc.html
│   └── uso-personalizado-de-pandoc-y-revealjs.html
├── index.html                 # Página principal (landing)
├── curso.html                 # Vista de módulos/unidades
├── leccion.html               # Frame para presentaciones
└── README.md                  # Este archivo
```

### Notas sobre la estructura:
- Cada carpeta en `data/CARRERA/CURSO/` contiene un `lecciones.json` con la estructura de unidades y lecciones
- La carpeta `reveal/` es un submódulo o copia del framework Reveal.js oficial. Editar solo si sabe lo que está haciendo.

### Ejemplo de archivo `lecciones.json`:

```json
{
    "unidades": [
        {
            "nombre": "Unidad I",
            "lecciones": [
                {
                    "nombre": "Clase 1-01",
                    "enlace": "clase101"
                },
                {
                    "nombre": "Clase 1-02",
                    "enlace": "clase102"
                }
            ]
        },
        {
            "nombre": "Unidad II",
            "lecciones": [
                {
                    "nombre": "Clase 2-01",
                    "enlace": "clase201"
                }
            ]
        },
        {
            "nombre": "Unidad III",
            "lecciones": [
                {
                    "nombre": "Clase 3-01",
                    "enlace": "clase301"
                }
            ]
        }
    ]
}
```

**Campos del JSON**:
- `unidades`: Array de unidades temáticas del curso
- `nombre`: Título de la unidad o lección (este nombre apacererá en la slide de portada)
- `enlace`: El archivo `clase102.html` se encuentra en la carpeta `UnidadI` y el archivo `clase201.html` se encuentra en la carpeta `UnidadII` (notar que se elimina el espacio en las unidades). Para el enlace basta escribir el nombre del archivo HTML sin la extensión.

---

## Flujos de trabajo principales

### Servidor Local (Obligatorio)

1. Clona o descarga este repositorio
2. Abre una terminal y navega a la carpeta del proyecto
3. Inicia un servidor HTTP con Python:
```bash
# Python 3 (recomendado)
python -m http.server 8000

# Python 2.7
python -m SimpleHTTPServer 8000
```
4. Abre tu navegador y visita: http://localhost:8000

> ⚠️ **Importante**: El servidor local es obligatorio debido a políticas CORS para carga de JSON y applets GeoGebra.

### Pipeline de Contenido Pandoc

```bash
# LaTeX → Presentación Reveal.js
pandoc -s --mathjax -t revealjs -i INPUT.tex -o OUTPUT.html \
  --lua-filter=remove-num.lua --template=reveal.html

# LaTeX → HTML página única
pandoc -s --mathjax -i INPUT.tex -o OUTPUT.html \
  --lua-filter=remove-num.lua --template=default.html
```

**Filtros específicos del proyecto**:
- `remove-num.lua`: Elimina numeración automática de teoremas/ejemplos
- `refinar-tex.py`: Limpia comandos Beamer y adapta bloques

### Navegación Dinámica

```
# Estructura de URLs
curso.html?base=FEN/Matematicas&titulo=Matemática
leccion.html?base=FEN/Matematicas&unidad=UnidadV&clase=clase16

# Exportar a PDF
leccion.html?base=...&print-pdf  # Reemplaza applets por imágenes
```

---

## Integraciones y patrones específicos

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

### Bloques de Contenido Matemático
```html
<div class="example">
  <p>Contenido del ejemplo...</p>
</div>
<div class="definition">
  <p>Definición matemática...</p>
</div>
```
**CSS auto-genera headers**: "Ejemplo.", "Definición.", etc. con colores específicos.

### Modales Interactivos
```javascript
// Patrón modular para términos matemáticos
function showModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}
```
**Responsive**: Fullscreen automático en dispositivos móviles.

### Configuraciones Optimizadas
- **MathJax**: `scripts/mathjax-config.js` con macros pre-definidas (`\RR`, `\NN`, `\ZZ`)
- **Reveal.js**: `scripts/lesson-reveal-init.js` con configuración estandarizada
- **Performance**: CSS `will-change`, DocumentFragment, cache de datos JSON

---

## Recursos y documentación

 - Documentación y tutoriales en la carpeta [Wiki](https://github.com/InstMat/Plataforma/tree/main/wiki).


---


