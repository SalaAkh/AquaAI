# 🎬 AquaAI Pitch & Demo Media Hub

Данная папка содержит презентационные материалы, финальные видеоролики и скрипты автоматической генерации для участия в **Colosseum Hackathon & Accelerator** (Crypto World's Fair).

---

## 📁 Содержимое

### 🎥 Финальные видеоролики
- **`aquaai_founder_pitch.mp4`** (~2.8 MB) — 2-минутный питч основателя (Who you are, What you are building, Why Solana, Accelerator Goal).
- **`aquaai_product_demo.mp4`** (~4.8 MB) — 3-минутная демонстрация живого продукта (FAO-56 расчет, Sentinel-2 NDVI, IoT датчики, Gemini AI и аудит на Solana Devnet).

### 🖥 Интерактивные интерфейсы
- **`video_submission_hub.html`** — веб-хаб для просмотра роликов, копирования текстов подачи и ссылок.
- **`teleprompter.html`** — локальный телесуфлер для записи речи спикера.
- **`pitch_cards.html`**, **`pitch_slide_*.html`** — исходные HTML-шаблоны слайдов презентации.

### ⚙ Скрипты генерации и ассеты
- **`generate_pitch_slides.py`** — рендеринг HTML-слайдов в PNG через headless Chrome.
- **`build_pitch_video.py`** — сборка питч-видео с аудиодорожками через FFmpeg.
- **`build_demo_video.py`** — сборка демо-видео приложения через FFmpeg.
- **`pitch_slide_*.png`**, **`full_app.png`** — отрегулированные слайды и скриншоты приложения.

---

> Полные текстовые сценарии на русском и английском языках с таймингом см. в [docs/video_scripts.md](../../docs/video_scripts.md).
