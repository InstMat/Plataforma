# Modo Portable (sin autenticacion y sin servidor)

Esta carpeta permite probar modulos y lecciones localmente, abriendo archivos HTML directamente en el navegador.
Es un paquete autocontenido: basta con compartir solo la carpeta `portable/`.

## Como usar
1. Entrega solo la carpeta `portable/`.
2. La persona que crea contenido abre:
   - `portable/plataforma.html`
3. Navega carreras -> modulo -> lecciones como en la plataforma normal.
4. Crea o edita contenido en `portable/data/<facultad>/<modulo>/...`.
5. Te devuelve la carpeta del modulo y sus lecciones desde `portable/data/...`.

## Estructura incluida de ejemplo
- `portable/data/carreras.json`
- `portable/data/Demo/ModuloDemo/lecciones.json`
- `portable/data/Demo/ModuloDemo/UnidadI/clase01.html`
- `portable/data/Demo/ModuloDemo/UnidadI/clase01/recta-demo.ggb`
- `portable/images/*` (logos minimos)
- `portable/styles/*` (estilos minimos)

## Convenciones para nuevo contenido
- `lecciones.json` en la raiz del modulo.
- Lecciones por unidad: `UnidadX/claseYY.html`.
- Mantener rutas relativas dentro de cada leccion para imagenes y recursos del modulo.

## Notas
- Esta version portable carga Reveal.js y MathJax desde CDN (online), por lo que necesita conexion a internet para presentaciones y formulas matematicas.
- En algunos navegadores muy restrictivos, las lecturas de JSON en `file://` pueden estar limitadas. Si ocurre, prueba con Firefox para trabajo offline.

## Recomendacion de editor
Para crear y revisar contenido de forma mas comoda, se recomienda usar VS Code

- Descargar VS Code: https://code.visualstudio.com/download

con estas extensiones:

- GitHub Copilot (sugerencias de codigo y ayuda al editar HTML/JS/CSS)
- Live Preview (levanta una vista previa local del sitio y evita problemas comunes de `file://`)

## Servidor local minimo (si falla `file://`)
Si el navegador bloquea la lectura de `data/*.json`, inicia un servidor local simple y abre la URL local en vez de abrir el HTML con doble clic.

### Instalar Python (opcion recomendada para iniciar servidor local simple)
Si no tienes Python, esta es la instalacion minima por sistema operativo:

1. Windows
- Opcion rapida (PowerShell):

```powershell
winget install Python.Python.3.12
```

- Alternativa: descargar desde `https://www.python.org/downloads/windows/`.
- Importante: marcar **Add Python to PATH** durante la instalacion.

2. Linux
- Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y python3
```

- Fedora:

```bash
sudo dnf install -y python3
```

- Arch:

```bash
sudo pacman -S python
```

3. macOS
- Con Homebrew:

```bash
brew install python
```

- Alternativa: instalador oficial desde `https://www.python.org/downloads/macos/`.

4. Verificar instalacion

```bash
python3 --version
```

1. Abre una terminal dentro de la carpeta `portable/`.
2. Ejecuta una de estas opciones:

```bash
# Opcion A: Python 3
python3 -m http.server 8000
```

3. Abre en el navegador:

```text
http://127.0.0.1:8000/plataforma.html
```

4. Para detener el servidor: `Ctrl + C` en la terminal.
