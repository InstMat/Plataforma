import re

def remove_onslide_and_replace_blocks(file_path):
    # Leer el contenido del archivo
    with open(file_path, 'r', encoding='utf-8') as file:
        import re
        import argparse

        def refine_tex(input_path, output_path):
            # Leer el contenido del archivo
            with open(input_path, 'r', encoding='utf-8') as file:
                import re
                import argparse

                def refine_tex(input_path, output_path):
                    # Leer el contenido del archivo
                    with open(input_path, 'r', encoding='utf-8') as file:
                        content = file.read()

                    # Eliminar todas las ocurrencias de \pause, incluyendo \pause{...} y {\pause ...}
                    pattern_pause = re.compile(r'\\pause\s*{(.*?)}|{\\pause\s*(.*?)}|\\pause', re.DOTALL)
                    new_content = pattern_pause.sub(lambda match: match.group(1) or match.group(2) or '', content)

                    # Expresión regular para encontrar y eliminar \onslide<...> y \onslide
                    pattern_onslide = re.compile(r'\\onslide<.*?>{(.*?)}|\\onslide{(.*?)}', re.DOTALL)
                    new_content = pattern_onslide.sub(lambda match: match.group(1) or match.group(2), new_content)

                    # Eliminar entornos multicols y minipage, conservando el contenido interno
                    pattern_multicols = re.compile(r'\\begin{multicols}{[^}]*}(.*?)\\end{multicols}', re.DOTALL)
                    new_content = pattern_multicols.sub(lambda match: match.group(1), new_content)
                    pattern_minipage = re.compile(r'\\begin{minipage}{[^}]*}(.*?)\\end{minipage}', re.DOTALL)
                    new_content = pattern_minipage.sub(lambda match: match.group(1), new_content)

                    # Eliminar todas las instancias de \itemsep seguido de cualquier valor (número, unidad, espacio)
                    new_content = re.sub(r'\\itemsep\s*[^\n]+', '', new_content)

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
                    new_content = pattern_frame.sub(r'\\begin{frame}\n\\frametitle{\1}', new_content)

                    # Guardar el contenido modificado en el archivo de salida
                    with open(output_path, 'w', encoding='utf-8') as file:
                        file.write(new_content)

                if __name__ == "__main__":
                    parser = argparse.ArgumentParser(description="Refina un archivo LaTeX para conversión con Pandoc.")
                    parser.add_argument('-i', '--input', required=True, help='Archivo .tex de entrada')
                    parser.add_argument('-o', '--output', required=True, help='Archivo .tex de salida')
                    args = parser.parse_args()
                    refine_tex(args.input, args.output)