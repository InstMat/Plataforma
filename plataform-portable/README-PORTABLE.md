# Plataforma Portable de Pruebas (Liviana)

Esta carpeta contiene una version liviana y portable para crear/probar modulos y lecciones con la misma estructura de carpetas del proyecto original.

## Importante: modo sin servidor

No es viable garantizar funcionamiento completo en modo `file://` porque el navegador bloquea carga de JSON por seguridad (CORS). Por eso se usa un servidor HTTP local.

La carpeta incluye lanzadores para que no dependas exclusivamente de Python:

- Linux/macOS: `scripts/start-test-platform.sh`
- Windows: `scripts/start-test-platform.bat` o `scripts/start-test-platform.ps1`
- macOS (doble clic): `scripts/start-test-platform.command`

El lanzador `start-test-platform.sh` intenta automaticamente estos runtimes, en este orden:

1. `python3`
2. `python`
3. `node`
4. `php`
5. `ruby`
6. `powershell.exe` (si corres desde WSL)

## Iniciar plataforma

Linux/macOS:

```bash
cd plataform-portable
bash scripts/start-test-platform.sh
```

Windows (PowerShell):

```powershell
cd plataform-portable
powershell -ExecutionPolicy Bypass -File scripts/start-test-platform.ps1
```

Windows (CMD):

```bat
cd plataform-portable
scripts\start-test-platform.bat
```

## Detener plataforma

Linux/macOS:

```bash
cd plataform-portable
bash scripts/stop-test-platform.sh
```

Windows:

```powershell
cd plataform-portable
powershell -ExecutionPolicy Bypass -File scripts/stop-test-platform.ps1
```

## Generar ZIP descargable

```bash
cd plataform-portable
bash scripts/build-package.sh
```

Salida: `plataform-portable/dist/`.

## Estructura para nuevos modulos y lecciones

Mantener exactamente este patron:

- `data/<FACULTAD>/<MODULO>/lecciones.json`
- `data/<FACULTAD>/<MODULO>/<UnidadSinEspacios>/<archivo>.html`

Ejemplo:

- `data/Ingenieria/NuevoModulo/lecciones.json`
- `data/Ingenieria/NuevoModulo/UnidadI/clase101.html`
- `data/Ingenieria/NuevoModulo/UnidadII/clase201.html`

Despues, registrar el modulo en `data/carreras.json` para que aparezca en la portada.
