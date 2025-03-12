import re

def remove_onslide_and_replace_blocks(file_path):
    # Leer el contenido del archivo
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Expresión regular para encontrar y eliminar \onslide<...> y \onslide
    pattern_onslide = re.compile(r'\\onslide<.*?>{(.*?)}|\\onslide{(.*?)}', re.DOTALL)

    # Reemplazar todas las ocurrencias de \onslide<...> y \onslide con su contenido
    new_content = pattern_onslide.sub(lambda match: match.group(1) or match.group(2), content)

    # Lista de patrones y reemplazos para los bloques
    replacements = [
        (r'\\begin{block}{Nota}(.*?)\\end{block}', r'\\begin{remark}\1\\end{remark}'),
        (r'\\begin{block}{Ejemplo}(.*?)\\end{block}', r'\\begin{example}\1\\end{example}'),
        # Patrón flexible para {Definición}, {Definici\'on}, o {Definici'on}, ignorando texto adicional
        (r'\\begin{block}{Definici[\\\']?on[^}]*}(.*?)\\end{block}', r'\\begin{definition}\1\\end{definition}'),
        (r'\\begin{block}{Teorema[^}]*}(.*?)\\end{block}', r'\\begin{theorem}\1\\end{theorem}'),
        (r'\\begin{block}{Corolario[^}]*}(.*?)\\end{block}', r'\\begin{corollary}\1\\end{corollary}'),
        # Agrega más patrones aquí según sea necesario
    ]

    # Aplicar cada patrón y reemplazo
    for pattern, replacement in replacements:
        new_content = re.sub(pattern, replacement, new_content, flags=re.DOTALL)

    # Expresión regular para convertir \begin{frame}{TITULO} a \begin{frame}\frametitle{TITULO}
    pattern_frame = re.compile(r'\\begin{frame}{([^}]+)}')

    # Reemplazar \begin{frame}{TITULO} por \begin{frame}\frametitle{TITULO}
    new_content = pattern_frame.sub(r'\\begin{frame}\n\\frametitle{\1}', new_content)

    # Escribir el contenido modificado de vuelta al archivo
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(new_content)

# Ejemplo de uso
file_path = 'tu_archivo.tex'  # Reemplaza con la ruta de tu archivo .tex
remove_onslide_and_replace_blocks(file_path)