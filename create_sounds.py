#!/usr/bin/env python3
"""
Criar sons de alerta simples para a extensão
"""
import wave
import math
import struct

def create_beep(filename, frequency=800, duration=0.3, sample_rate=44100):
    """Criar um beep simples"""
    num_samples = int(duration * sample_rate)

    with wave.open(filename, 'w') as wav_file:
        # Configurar parâmetros WAV
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)

        # Gerar onda senoidal
        for i in range(num_samples):
            # Fade in/out para evitar cliques
            envelope = 1.0
            fade_samples = sample_rate // 100  # 10ms fade

            if i < fade_samples:
                envelope = i / fade_samples
            elif i > num_samples - fade_samples:
                envelope = (num_samples - i) / fade_samples

            # Calcular valor da onda
            value = int(32767 * 0.3 * envelope * math.sin(2 * math.pi * frequency * i / sample_rate))

            # Escrever sample
            data = struct.pack('<h', value)
            wav_file.writeframes(data)

def create_complete_sound(filename, sample_rate=44100):
    """Criar som de conclusão (dois beeps)"""
    duration1 = 0.15
    duration2 = 0.15
    pause = 0.1

    num_samples1 = int(duration1 * sample_rate)
    num_samples2 = int(duration2 * sample_rate)
    num_pause = int(pause * sample_rate)

    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)

        # Primeiro beep (mais grave)
        for i in range(num_samples1):
            envelope = 1.0
            fade = sample_rate // 100
            if i < fade:
                envelope = i / fade
            elif i > num_samples1 - fade:
                envelope = (num_samples1 - i) / fade

            value = int(32767 * 0.3 * envelope * math.sin(2 * math.pi * 600 * i / sample_rate))
            wav_file.writeframes(struct.pack('<h', value))

        # Pausa
        for i in range(num_pause):
            wav_file.writeframes(struct.pack('<h', 0))

        # Segundo beep (mais agudo)
        for i in range(num_samples2):
            envelope = 1.0
            fade = sample_rate // 100
            if i < fade:
                envelope = i / fade
            elif i > num_samples2 - fade:
                envelope = (num_samples2 - i) / fade

            value = int(32767 * 0.3 * envelope * math.sin(2 * math.pi * 800 * i / sample_rate))
            wav_file.writeframes(struct.pack('<h', value))

# Criar os sons
print('Criando sons de alerta...')

create_beep('src/assets/sounds/ding.wav', frequency=800, duration=0.2)
print('✓ Criado: src/assets/sounds/ding.wav')

create_complete_sound('src/assets/sounds/complete.wav')
print('✓ Criado: src/assets/sounds/complete.wav')

print('\n✅ Sons criados com sucesso!')
print('\n📝 Nota: Os sons estão em formato WAV.')
print('Para melhor compatibilidade, converta para MP3:')
print('  ffmpeg -i ding.wav ding.mp3')
print('  ffmpeg -i complete.wav complete.mp3')
