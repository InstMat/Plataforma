# Copilot Instructions for Plataforma Educativa Matemática

## Project Overview
A modular educational web platform for Universidad de Talca that delivers interactive mathematics content organized by degree programs (FEN, Ingeniería, Pedagogía, Salud). Uses dynamic routing, Reveal.js presentations, MathJax rendering, and GeoGebra visualizations.

## Architecture

### Core Data Structure
- **Data Layer**: `data/` contains `carreras.json` + nested course folders (FEN/, Ingeniería/, etc.)
- Each course has `lecciones.json` with structure: `{unidades: [{nombre, lecciones: [{nombre, href, pdf}]}]}`
- **No database**: All content served statically via JSON + dynamic HTML files

### Dynamic Routing Pattern
- **URL Parameters** drive everything: `curso.html?base=FEN/MatI&titulo=Matemáticas I`
- **Shell Scripts** parse parameters → populate navigation menus:
  - `scripts/course-shell.js`: Loads `lecciones.json` into `#unidades-container`
  - `scripts/lecciones.js`: Renders lessons as clickable links in sidebar
  - Both cache DOM elements for performance (`cachedElements` pattern)

### Three-File Navigation Model
1. **index.html**: Landing page → careers list via `carreras.json`
2. **curso.html**: Modules/units view → populates via `base` parameter
3. **leccion.html**: Reveal.js presentation frame with `<iframe name="contenido">`
   - Lessons load inside iframe, avoiding full page reloads

## Critical Integration Points

### MathJax Configuration
- **File**: `scripts/mathjax-config.js` - Pre-defines macros (`\RR`, `\NN`, `\ZZ`, `\QQ`, `\CC`)
- Auto-processes inline `$...$` and display `$$...$$` math
- Skips: `<script>, <noscript>, <style>, <textarea>, <pre>` tags
- **Performance**: Uses `fontCache: 'global'`, skips font checking

### Reveal.js Initialization
- **File**: `scripts/lesson-reveal-init.js` - Standardized configuration for all lessons
- Must initialize BEFORE content loads (check `window.revealInitialized` guard)
- Pandoc outputs to `reveal.html` template in `pandoc-files/`
- Key config: width 1280, height 960, hash: true for slide linking

### GeoGebra Integration Pattern
```html
<!-- MANDATORY STRUCTURE for applets -->
<div class="ggb-wrapper">
  <div id="ggb-APPLETID"></div>
  <img class="ggb-print-img" src="path/to/image.png">
</div>
```
- **deployggb.js** auto-initializes via `data-appletid` attributes
- On print/PDF export: CSS hides applet div, shows image (`.ggb-print-img`)
- **CORS**: Requires local server (`python -m http.server 8000`)

### Content Styling System
- **CSS Auto-Counters** in `styles/style.css`: `.example::before`, `.theorem::before`, etc.
- Blocks use `contain: layout style` + `will-change: transform` for performance
- Color scheme: Blue examples, Pink challenges, Gray definitions

## Development Workflows

### Adding New Lesson Content
1. Create `.tex` file with Beamer format
2. Convert via Pandoc:
   ```bash
   pandoc -s --mathjax -t revealjs INPUT.tex -o OUTPUT.html \
     --lua-filter=remove-num.lua --template=reveal.html -c style.css
   ```
3. `remove-num.lua` strips auto-numbering from theorem/example blocks
4. Wrap GeoGebra applets in `.ggb-wrapper` divs
5. Update `data/CARRERA/CURSO/lecciones.json` with new lesson entry

### Local Development Server
```bash
cd /path/to/plataforma
python -m http.server 8000
# Opens http://localhost:8000
```
Required for: JSON loading, GeoGebra applets, localStorage access

### PDF Export
- URL parameter: `leccion.html?base=...&print-pdf`
- Reveal.js auto-formats for printing, GeoGebra applets replaced by images

## Code Patterns to Maintain

### DOM Caching Pattern (Performance)
```javascript
let cachedElements = null;
function initializeElementCache() {
  if (!cachedElements) {
    cachedElements = { sidebar: document.getElementById('sidebar'), ... };
  }
  return cachedElements;
}
```
Used in: `lecciones.js`, `login.js` - prevents repeated DOM queries

### sessionStorage for State
- Last viewed lesson: `sessionStorage.setItem('ultima-leccion:' + courseBase, href)`
- Authentication: `sessionStorage.setItem('autenticado', '1')`
- Silent fail pattern for browser restrictions

### Event Delegation + requestAnimationFrame
- Click handlers use `requestAnimationFrame()` for smooth animations
- Sidebar close + iframe load in same animation frame
- See: `lecciones.js` createLessonClickHandler()

## Key File Locations
- **Data**: `data/` (JSON backbone)
- **Scripts**: `scripts/` (core logic - course-shell.js, lecciones.js, lesson-reveal-init.js)
- **Styles**: `styles/style.css` (content styling) + reveal.js theme CSS
- **Pandoc**: `pandoc-files/` (templates, filters for LaTeX→HTML conversion)
- **Reveal.js**: `reveal/` (submodule or embedded copy)

## Common Pitfalls
- ⚠️ Local server required (CORS policy blocks GeoGebra, JSON)
- ⚠️ URL parameters are case-sensitive for `base` paths
- ⚠️ GeoGebra IDs must match `id="ggb-APPLETID"` format
- ⚠️ MathJax macros defined in `mathjax-config.js` - update there, not in individual HTML files
- ⚠️ Reveal.js collision: prevent double initialization with `window.revealInitialized` guard
