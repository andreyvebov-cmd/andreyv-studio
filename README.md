# Andrey V Studio — видеоредактор

Одностраничный веб-сайт для дизайнера Andrey V. Загрузка видео, применение модных эффектов с настройкой каждого параметра в реальном времени, экспорт результата в MP4.

## Текущий статус
- [x] effects.js — ядро: параметры, UI-панель, слайдеры, переключение эффектов
- [x] Реализация эффектов (chromaKey, glitch, filmGrain, rgbSplit, wave, pixelate, neon, retro, directionalBlur)
- [x] index.html — разметка и стили
- [x] Логика загрузки видео, воспроизведения, кадров
- [x] Экспорт в MP4 (ffmpeg.wasm)

## Демо
Онлайн-версия: https://andreyvebov-cmd.github.io/andreyv-studio/

## Эффекты и параметры
- chroma: keyColor, softness, spill, brightness
- glitch: intensity, rows, speed, rgbShift
- film: grain, vignette, blur, tint, tintAmount
- rgb: split, angle, intensity
- wave: amplitude, frequency, speed, direction
- pixelate: size, shape
- neon: glow, hue, brightness, saturation
- retro: scanlines, curvature, chroma
- blur: amount, direction

## Запуск
Открой index.html в браузере. Эффекты применяются по кадрам через Canvas2D.