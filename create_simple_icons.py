#!/usr/bin/env python3
"""
Criar ícones PNG simples para a extensão usando apenas bibliotecas padrão
"""
try:
    from PIL import Image, ImageDraw, ImageFont

    def create_icon(size):
        # Criar imagem com fundo verde
        img = Image.new('RGB', (size, size), '#27ae60')
        draw = ImageDraw.Draw(img)

        # Desenhar círculo de fundo mais claro
        margin = size // 10
        draw.ellipse([margin, margin, size-margin, size-margin], fill='#2ecc71')

        # Desenhar relógio simples (círculo e ponteiros)
        center = size // 2
        clock_radius = size // 3
        clock_margin = size // 4

        # Círculo do relógio
        draw.ellipse(
            [center - clock_radius, center - clock_radius,
             center + clock_radius, center + clock_radius],
            outline='white',
            width=max(1, size // 40)
        )

        # Ponteiro das horas (vertical)
        draw.line(
            [center, center, center, center - clock_radius // 2],
            fill='white',
            width=max(1, size // 40)
        )

        # Ponteiro dos minutos (horizontal)
        draw.line(
            [center, center, center + clock_radius // 2, center],
            fill='white',
            width=max(1, size // 40)
        )

        return img

    # Criar ícones em todos os tamanhos
    sizes = [16, 32, 48, 128]
    for size in sizes:
        icon = create_icon(size)
        icon.save(f'icons/icon{size}.png')
        print(f'✓ Criado: icons/icon{size}.png')

    print('\n✅ Todos os ícones foram criados com sucesso!')

except ImportError:
    print('⚠️  Pillow não está instalado.')
    print('Criando ícones placeholder usando método alternativo...\n')

    # Criar PNGs mínimos válidos (1x1 pixel verde) como placeholder
    # PNG de 1x1 pixel verde (#27ae60)
    png_data = {
        16: b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\x08\x02\x00\x00\x00\x90\x91h6\x00\x00\x00\x19IDAT\x08\x99c\xdc\xfb\xef\xdf\xff\x9f\x81A\x06\x06\x18\x1a\x80\xa5\x01\x18\x1a\x80\xa5\x01\x00\x00\x00\xff\xffZ\x07\x0f\xfe\x8e#\x95\x9e\x00\x00\x00\x00IEND\xaeB`\x82',
        32: b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00 \x00\x00\x00 \x08\x02\x00\x00\x00\xfc\x18\xed\xa3\x00\x00\x00\x1cIDAT\x08\x99c\xdc\xfb\xef\xdf\xff\x9f\x81A\x06\x06\x18\x1a\x80\xa5\x01\x18\x1a\x80\xa5\x01\x00\x00\x00\x00\xff\xff\xf1\xa0\x19\x89Q]\xf2\xe4\x00\x00\x00\x00IEND\xaeB`\x82',
        48: b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x000\x00\x00\x000\x08\x02\x00\x00\x00W\x00_\xf6\x00\x00\x00\x1fIDAT\x08\x99c\xdc\xfb\xef\xdf\xff\x9f\x81A\x06\x06\x18\x1a\x80\xa5\x01\x18\x1a\x80\xa5\x01\x00\x00\x00\x00\x00\xff\xff\xd1C \x87\xb0J\xee;\x00\x00\x00\x00IEND\xaeB`\x82',
        128: b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x80\x00\x00\x00\x80\x08\x02\x00\x00\x00L\\\xf6\x9c\x00\x00\x00"IDAT\x08\x99c\xdc\xfb\xef\xdf\xff\x9f\x81A\x06\x06\x18\x1a\x80\xa5\x01\x18\x1a\x80\xa5\x01\x00\x00\x00\x00\x00\x00\xff\xff\xbb<+\x92\xae\x8b1\xc0\x00\x00\x00\x00IEND\xaeB`\x82'
    }

    for size, data in png_data.items():
        with open(f'icons/icon{size}.png', 'wb') as f:
            f.write(data)
        print(f'✓ Criado placeholder: icons/icon{size}.png')

    print('\n📝 Nota: Foram criados ícones placeholder.')
    print('Para ícones melhores, você pode:')
    print('1. Instalar Pillow: python3 -m pip install Pillow --user')
    print('2. Usar um editor online: https://www.photopea.com/')
    print('3. Abrir icons/icon.svg e exportar manualmente')

if __name__ == '__main__':
    pass
