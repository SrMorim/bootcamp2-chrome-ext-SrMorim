#!/usr/bin/env python3
"""
Script para converter o ícone SVG para PNG em vários tamanhos
"""
import os

try:
    import cairosvg

    svg_path = 'icons/icon.svg'
    sizes = [16, 32, 48, 128]

    for size in sizes:
        output_path = f'icons/icon{size}.png'
        cairosvg.svg2png(
            url=svg_path,
            write_to=output_path,
            output_width=size,
            output_height=size
        )
        print(f'✓ Criado: {output_path}')

    print('\n✅ Todos os ícones foram criados com sucesso!')

except ImportError:
    print('⚠️  cairosvg não está instalado.')
    print('Para instalar: pip install cairosvg')
    print('\nAlternativamente, você pode:')
    print('1. Usar um conversor online: https://cloudconvert.com/svg-to-png')
    print('2. Usar Inkscape: inkscape -w SIZE -h SIZE icon.svg -o iconSIZE.png')
    print('3. Instalar cairosvg: pip install cairosvg')
