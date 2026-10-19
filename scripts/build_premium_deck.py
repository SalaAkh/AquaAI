"""
AquaAI Premium Pitch Deck Generator for IDEA MINERS 2026
Creates a visually stunning, 16:9 widescreen presentation with rich cards,
metrics, contrasting typography, and modern AgriTech aesthetics.
"""

import os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def build_deck():
    output_pptx = os.path.abspath("docs/AquaAI_Idea_Miners_Pitch.pptx")
    output_pdf = os.path.abspath("docs/AquaAI_Idea_Miners_Pitch.pdf")
    
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette
    C_BG = RGBColor(8, 20, 18)            # Obsidian Emerald (#081412)
    C_CARD_BG = RGBColor(14, 35, 30)       # Dark Card (#0E231E)
    C_CARD_BG_HERO = RGBColor(18, 48, 41)  # Highlight Card (#123029)
    C_CARD_BORDER = RGBColor(26, 68, 58)   # Card Border (#1A443A)
    C_BORDER_ACCENT = RGBColor(16, 185, 129) # Emerald Border (#10B981)
    C_EMERALD = RGBColor(16, 185, 129)     # Main Accent Emerald (#10B981)
    C_CYAN = RGBColor(6, 182, 212)         # Modern Cyan (#06B6D4)
    C_WHITE = RGBColor(255, 255, 255)      # Pure White (#FFFFFF)
    C_LIGHT = RGBColor(226, 232, 240)      # Slate 200 (#E2E8F0)
    C_MUTED = RGBColor(148, 163, 184)      # Slate 400 (#94A3B8)

    def add_slide_frame(badge_text, title_text, subtitle_text, slide_num):
        slide = prs.slides.add_slide(blank_layout)
        
        # Background
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_BG
        bg.line.fill.background()

        # Badge
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.4), Inches(2.8), Inches(0.32))
        badge.fill.solid()
        badge.fill.fore_color.rgb = C_CARD_BG_HERO
        badge.line.color.rgb = C_EMERALD
        badge.line.width = Pt(1)
        tb = badge.text_frame
        tb.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tb.paragraphs[0]
        p.text = badge_text
        p.font.name = "Segoe UI"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = C_EMERALD
        p.alignment = PP_ALIGN.CENTER

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.6))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.name = "Segoe UI"
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = C_WHITE

        # Subtitle
        sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.35), Inches(11.7), Inches(0.4))
        tf_sub = sub_box.text_frame
        tf_sub.word_wrap = True
        tf_sub.margin_left = tf_sub.margin_top = tf_sub.margin_right = tf_sub.margin_bottom = 0
        p_sub = tf_sub.paragraphs[0]
        p_sub.text = subtitle_text
        p_sub.font.name = "Segoe UI"
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = C_MUTED

        # Footer
        footer_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(7.0), Inches(11.733), Pt(1))
        footer_line.fill.solid()
        footer_line.fill.fore_color.rgb = C_CARD_BORDER
        footer_line.line.fill.background()

        f_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.35))
        tf_f = f_box.text_frame
        tf_f.margin_left = tf_f.margin_top = tf_f.margin_right = tf_f.margin_bottom = 0
        p_f = tf_f.paragraphs[0]
        p_f.text = f"AquaAI — Интеллектуальное управление орошением  |  IDEA MINERS 2026 (Parasat Club)  |  Слайд {slide_num} из 9"
        p_f.font.name = "Segoe UI"
        p_f.font.size = Pt(10)
        p_f.font.color.rgb = C_MUTED

        return slide

    def add_card(slide, left, top, width, height, is_hero=False):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG_HERO if is_hero else C_CARD_BG
        card.line.color.rgb = C_EMERALD if is_hero else C_CARD_BORDER
        card.line.width = Pt(1.5 if is_hero else 1)
        return card

    # =========================================================================
    # SLIDE 1: НАЗВАНИЕ И ОДНА ФРАЗА (Hero Cover)
    # =========================================================================
    s1 = add_slide_frame("01 / НАЗВАНИЕ И ОДНА ФРАЗА", "AquaAI (АкваАй)", "Интеллектуальная цифровая платформа точного управления орошением для фермеров Центральной Азии", 1)
    
    # Left Hero Card (One-Liner & Impact)
    add_card(s1, 0.8, 1.85, 6.8, 4.9, is_hero=True)
    tb1 = s1.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(6.2), Inches(4.4))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    
    p = tf1.paragraphs[0]
    p.text = "СУТЬ СТАРТАПА (ONE-LINER)"
    p.font.name = "Segoe UI"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p.space_after = Pt(8)

    p = tf1.add_paragraph()
    p.text = "AquaAI рассчитывает точную суточную потребность поля в поливе за 30 секунд по координатам на основе международного гидрологического стандарта FAO-56 Penman-Monteith и прогноза Open-Meteo, объясняя рекомендации через ИИ (Gemini) без обязательной покупки оборудования на старте."
    p.font.name = "Segoe UI"
    p.font.size = Pt(14)
    p.font.color.rgb = C_LIGHT
    p.space_after = Pt(16)

    p = tf1.add_paragraph()
    p.text = "КЛЮЧЕВАЯ ЦЕННОСТЬ ДЛЯ ФЕРМЕРА"
    p.font.name = "Segoe UI"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.space_after = Pt(6)

    p = tf1.add_paragraph()
    p.text = "• Сокращение перерасхода поливной воды на 20–35%\n• Экономия от 1.5 до 3 млн ₸ за сезон на холостой работе насосов\n• Полный учёт расхода воды (счётчики, насосы, купоны канала)\n• План-факт аналитика затрат и готовый агрономический отчёт"
    p.font.name = "Segoe UI"
    p.font.size = Pt(13)
    p.font.color.rgb = C_LIGHT

    # Right Card 1 (Key Metrics)
    add_card(s1, 7.8, 1.85, 4.733, 2.3)
    tb_m = s1.shapes.add_textbox(Inches(8.1), Inches(2.05), Inches(4.133), Inches(1.9))
    tf_m = tb_m.text_frame
    tf_m.word_wrap = True
    p = tf_m.paragraphs[0]
    p.text = "ФОКУС И ЭФФЕКТИВНОСТЬ"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_MUTED
    p.space_after = Pt(4)

    p = tf_m.add_paragraph()
    p.text = "30 сек  |  20–35%  |  ROI 5x"
    p.font.name = "Segoe UI"
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p.space_after = Pt(6)

    p = tf_m.add_paragraph()
    p.text = "Время расчёта потребности поля  •  Снижение потерь воды  •  Окупаемость подписки с первого месяца"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = C_MUTED

    # Right Card 2 (Location, Contacts, Tech Stack)
    add_card(s1, 7.8, 4.35, 4.733, 2.4)
    tb_c = s1.shapes.add_textbox(Inches(8.1), Inches(4.55), Inches(4.133), Inches(2.0))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True
    p = tf_c.paragraphs[0]
    p.text = "СТАДИЯ И КОНТАКТЫ"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_MUTED
    p.space_after = Pt(4)

    p = tf_c.add_paragraph()
    p.text = "• Локация: Казахстан (Алматы, Туркестан, Кызылорда)\n• Статус: Полноценный рабочий MVP в браузере (RU / KK)\n• Репозиторий: github.com/SalaAkh/AquaAI\n• Стек: Next.js 16, React 19, FAO-56, Gemini AI, Supabase RLS"
    p.font.name = "Segoe UI"
    p.font.size = Pt(12)
    p.font.color.rgb = C_LIGHT

    # =========================================================================
    # SLIDE 2: ПРОБЛЕМА
    # =========================================================================
    s2 = add_slide_frame("02 / ПРОБЛЕМА", "Водный дефицит и неконтролируемые потери на полях", "Кто страдает от проблемы, как часто она возникает и сколько стоит фермеру", 2)
    
    # 3 Top Metric Cards
    metrics_s2 = [
        ("85%", "ПОТРЕБЛЕНИЕ ВОДЫ", "Сельское хозяйство потребляет 80–85% пресной воды в регионе рек Сырдарья и Или. Водный кризис обостряется каждый сезон.", 0.8),
        ("до 40%", "ПОТЕРИ ПРИ ПОЛИВЕ", "Вода теряется из-за арычного затопления «на глаз», фильтрации в земляных каналах и полуденного испарения при +40°C.", 4.8),
        ("1.5–3M ₸", "ПЕРЕПЛАТА ЗА ЭНЕРГИЮ", "Тратит среднее хозяйство (50–100 га) за сезон на холостую работу насосов и дизель из-за отсутствия точного плана полива.", 8.8)
    ]
    
    for val, label, desc, xpos in metrics_s2:
        add_card(s2, xpos, 1.85, 3.733, 2.6)
        tb = s2.shapes.add_textbox(Inches(xpos + 0.25), Inches(2.05), Inches(3.233), Inches(2.2))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = val
        p.font.name = "Segoe UI"
        p.font.size = Pt(32)
        p.font.bold = True
        p.font.color.rgb = C_EMERALD
        p.space_after = Pt(2)

        p = tf.add_paragraph()
        p.text = label
        p.font.name = "Segoe UI"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_MUTED
        p.space_after = Pt(8)

        p = tf.add_paragraph()
        p.text = desc
        p.font.name = "Segoe UI"
        p.font.size = Pt(12)
        p.font.color.rgb = C_LIGHT

    # Bottom Split Cards: Кто страдает & Почему не работают аналоги
    add_card(s2, 0.8, 4.65, 5.733, 2.1)
    tb_b1 = s2.shapes.add_textbox(Inches(1.05), Inches(4.8), Inches(5.233), Inches(1.8))
    tf_b1 = tb_b1.text_frame
    tf_b1.word_wrap = True
    p = tf_b1.paragraphs[0]
    p.text = "КТО КЛИЕНТ И В КАКОЙ ОН СИТУАЦИИ:"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.space_after = Pt(4)
    p = tf_b1.add_paragraph()
    p.text = "Более 40 000 малых и средних крестьянских хозяйств юга Казахстана (хлопок, кукуруза, рис, овощи, сады). Поливают вслепую по расписанию канала или интуиции, рискуя потерей урожая до 30% от водного стресса или заболачивания."
    p.font.name = "Segoe UI"
    p.font.size = Pt(12)
    p.font.color.rgb = C_LIGHT

    add_card(s2, 6.8, 4.65, 5.733, 2.1)
    tb_b2 = s2.shapes.add_textbox(Inches(7.05), Inches(4.8), Inches(5.233), Inches(1.8))
    tf_b2 = tb_b2.text_frame
    tf_b2.word_wrap = True
    p = tf_b2.paragraphs[0]
    p.text = "ПОЧЕМУ НЕ ПОДХОДЯТ АЛЬТЕРНАТИВЫ:"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p.space_after = Pt(4)
    p = tf_b2.add_paragraph()
    p.text = "Зарубежные системы (CropX, FieldNET) стоят от $3,000, требуют обязательной покупки дорогих датчиков и не знают казахского языка. Зерновые системы (Cropwise) оптимизированы под комбайны севера, а не под гидрологию поливного юга."
    p.font.name = "Segoe UI"
    p.font.size = Pt(12)
    p.font.color.rgb = C_LIGHT

    # =========================================================================
    # SLIDE 3: РЕШЕНИЕ
    # =========================================================================
    s3 = add_slide_frame("03 / РЕШЕНИЕ", "Интеллектуальный агрономический расчёт и водоучёт", "Что конкретно делает AquaAI и почему научный подход гарантирует результат", 3)
    
    # 4 Feature Cards (2x2)
    features_s3 = [
        ("🌿 НАУЧНЫЙ РАСЧЁТ FAO-56 ЗА 30 СЕК", "Вычисляет точную суточную потребность в воде (ETc = ET0 × Kc) по координатам поля, культуре, фазе вегетации, типу почвы и эффективным осадкам. Нулевой порог входа — работает без физ. датчиков.", 0.8, 1.85),
        ("⏰ ПРОХЛАДНЫЕ ОКНА ПОЛИВА", "Рекомендует включение насосов строго в утренние (05:00–09:00) или вечерние (19:00–22:00) часы. Это устраняет до 25% непродуктивного испарения воды на полуденном солнце.", 6.8, 1.85),
        ("🤖 ИИ-АГРОНОМ (GOOGLE GEMINI)", "Генерирует доступные разъяснения на казахском, русском и английском языках, опираясь строго на гидрологические цифры без галлюцинаций. Предупреждает о погодных аномалиях.", 0.8, 4.0),
        ("💧 ЖУРНАЛ ФАКТИЧЕСКОГО ВОДОУЧЁТА", "3 метода фиксации: по показаниям расходомера, по времени работы насоса (м³/ч × ч) или по талону канала. Аналитика отклонений «План vs Факт» и выгрузка отчёта в PDF/CSV.", 6.8, 4.0)
    ]
    
    for title, desc, xpos, ypos in features_s3:
        add_card(s3, xpos, ypos, 5.733, 1.95)
        tb = s3.shapes.add_textbox(Inches(xpos + 0.25), Inches(ypos + 0.2), Inches(5.233), Inches(1.55))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = "Segoe UI"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = C_EMERALD
        p.space_after = Pt(6)

        p = tf.add_paragraph()
        p.text = desc
        p.font.name = "Segoe UI"
        p.font.size = Pt(12)
        p.font.color.rgb = C_LIGHT

    # Bottom Assurance Bar
    add_card(s3, 0.8, 6.15, 11.733, 0.65, is_hero=True)
    tb_bar = s3.shapes.add_textbox(Inches(1.0), Inches(6.25), Inches(11.333), Inches(0.45))
    tf_bar = tb_bar.text_frame
    p = tf_bar.paragraphs[0]
    p.text = "✅ НАДЁЖНОСТЬ ПОДТВЕРЖДЕНА: Модель базируется на 56-м стандарте Продовольственной организации ООН (FAO-56 Penman-Monteith) и верифицирована 14 гидрологическими тестами."
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

    # =========================================================================
    # SLIDE 4: РЫНОК
    # =========================================================================
    s4 = add_slide_frame("04 / РЫНОК", "Масштаб рынка орошения Центральной Азии", "Сколько потенциальных клиентов в регионе и сколько они готовы платить", 4)
    
    # 3 Metric Cards (TAM / SAM / SOM)
    markets = [
        ("$12.8M", "TAM • ЦЕНТРАЛЬНАЯ АЗИЯ", "8.5 млн га орошаемых земель (Казахстан, Узбекистан, Кыргызстан, Таджикистан) при целевом тарифе $1.50/га/сезон. Общий рынок сопутствующего агро-мониторинга превышает $100M+.", 0.8),
        ("$2.7M", "SAM • КАЗАХСТАН", "1.8 млн га орошаемых площадей в Казахстане, сфокусированных в южных регионах (Туркестанская, Жамбылская, Кызылординская и Алматинская области).", 4.8),
        ("$75,000", "SOM • 2 ГОДА ПИЛОТОВ", "50 000 га в ключевых хлопковых, кукурузных и рисовых кластерах юга Казахстана (~37.5 млн ₸ годовой подписки ARR) за первые 2 года коммерциализации.", 8.8)
    ]
    
    for val, label, desc, xpos in markets:
        add_card(s4, xpos, 1.85, 3.733, 2.8)
        tb = s4.shapes.add_textbox(Inches(xpos + 0.25), Inches(2.05), Inches(3.233), Inches(2.4))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = val
        p.font.name = "Segoe UI"
        p.font.size = Pt(34)
        p.font.bold = True
        p.font.color.rgb = C_EMERALD
        p.space_after = Pt(2)

        p = tf.add_paragraph()
        p.text = label
        p.font.name = "Segoe UI"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_MUTED
        p.space_after = Pt(8)

        p = tf.add_paragraph()
        p.text = desc
        p.font.name = "Segoe UI"
        p.font.size = Pt(12)
        p.font.color.rgb = C_LIGHT

    # Bottom Calculation & Unit Economics Card
    add_card(s4, 0.8, 4.85, 11.733, 1.95, is_hero=True)
    tb_calc = s4.shapes.add_textbox(Inches(1.1), Inches(5.05), Inches(11.133), Inches(1.55))
    tf_calc = tb_calc.text_frame
    tf_calc.word_wrap = True
    
    p = tf_calc.paragraphs[0]
    p.text = "РАСЧЁТ ОБЪЁМА РЫНКА И ЮНИТ-ЭКОНОМИКА ФЕРМЕРА:"
    p.font.name = "Segoe UI"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.space_after = Pt(6)

    p = tf_calc.add_paragraph()
    p.text = "• Расчёт в одну строку: SOM = 50 000 га × $1.50 / га в сезон = $75 000 (~37.5 млн тенге) ежегодной выручки (ARR)\n• Средний чек клиента: $150 (~75 000 ₸) в сезон на типичное фермерское хозяйство площадью 100 га\n• Прямой ROI для фермера: предотвращение 2–3 лишних включений насоса экономит от 300 000 до 800 000 ₸ за сезон — окупаемость подписки более 500%"
    p.font.name = "Segoe UI"
    p.font.size = Pt(13)
    p.font.color.rgb = C_LIGHT

    # =========================================================================
    # SLIDE 5: БИЗНЕС-МОДЕЛЬ
    # =========================================================================
    s5 = add_slide_frame("05 / БИЗНЕС-МОДЕЛЬ", "Сезонная B2B SaaS-подписка для агробизнеса", "Кто платит, за что, тарифная сетка и регулярность платежей", 5)
    
    # 3 Pricing Tiers
    tiers = [
        ("🌱 FREEMIUM", "0 ₸ / навсегда", "Инструмент вирального захвата рынка", "• До 2 полей (до 50 га)\n• 7-дневный прогноз FAO-56\n• Журнал фактического водоучёта\n• Воронка массовой лидогенерации", 0.8, False),
        ("⭐ ПРО / ТОЧНЫЙ ПОЛИВ", "$1.50 / га в сезон", "~750 ₸ за гектар на сезон", "• Неограниченные поля и насосы\n• План-факт аналитика отклонений\n• ИИ-агроном Gemini (RU / KK)\n• Экспорт официальных PDF/CSV отчётов\n• Калькулятор затрат на энергию", 4.8, True),
        ("🏢 КОРПОРАТИВНЫЙ", "$500–$1,500 / год", "Для кооперативов и ассоциаций", "• Сельхозкооперативы (СПК) и АВП\n• Многопользовательский доступ\n• Готовая отчётность для субсидий\n• Интеграция с расходомерами", 8.8, False)
    ]
    
    for name, price, sub, bullets, xpos, is_h in tiers:
        add_card(s5, xpos, 1.85, 3.733, 3.4, is_hero=is_h)
        tb = s5.shapes.add_textbox(Inches(xpos + 0.25), Inches(2.05), Inches(3.233), Inches(3.0))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = name
        p.font.name = "Segoe UI"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = C_EMERALD if is_h else C_MUTED
        p.space_after = Pt(2)

        p = tf.add_paragraph()
        p.text = price
        p.font.name = "Segoe UI"
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = C_WHITE
        p.space_after = Pt(2)

        p = tf.add_paragraph()
        p.text = sub
        p.font.name = "Segoe UI"
        p.font.size = Pt(11)
        p.font.color.rgb = C_MUTED
        p.space_after = Pt(12)

        p = tf.add_paragraph()
        p.text = bullets
        p.font.name = "Segoe UI"
        p.font.size = Pt(12)
        p.font.color.rgb = C_LIGHT

    # Bottom Payment Regularity Card
    add_card(s5, 0.8, 5.45, 11.733, 1.35)
    tb_reg = s5.shapes.add_textbox(Inches(1.1), Inches(5.6), Inches(11.133), Inches(1.05))
    tf_reg = tb_reg.text_frame
    tf_reg.word_wrap = True
    p = tf_reg.paragraphs[0]
    p.text = "РЕГУЛЯРНОСТЬ ПЛАТЕЖЕЙ И ПОВТОРНЫЕ ПРОДАЖИ:"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.space_after = Pt(4)
    p = tf_reg.add_paragraph()
    p.text = "Подписка оплачивается один раз в год весной перед началом активного поливного сезона (апрель-май). Высокий уровень удержания (Retention > 85%) обусловлен сохранением исторического баланса почв и подтверждённой экономией на счетах за электроэнергию насосов."
    p.font.name = "Segoe UI"
    p.font.size = Pt(12)
    p.font.color.rgb = C_LIGHT

    # =========================================================================
    # SLIDE 6: ТРЕКШН
    # =========================================================================
    s6 = add_slide_frame("06 / ТРЕКШН", "Что уже сделано и подтверждено реальным кодом", "Фактический статус разработки MVP и дорожная карта на сезон 2026", 6)
    
    # 4 Top Engineering Metric Cards
    metrics_s6 = [
        ("100%", "GREEN CI BUILD", "14 unit-тестов FAO-56 + 7 интеграционных тестов в GitHub Actions без ошибок.", 0.8),
        ("10 / 10", "E2E СЦЕНАРИЙ", "Полный путь: выбор хозяйства, расчёт, замер расходомера, план/факт и PDF-отчёт.", 3.8),
        ("3 РЕЖИМА", "ВОДОУЧЁТА", "Расходомер (до/после), подача насоса (м³/ч × ч) и ручной талон гидропоста.", 6.8),
        ("RLS SECURE", "SUPABASE CLOUD", "PostgreSQL с Row Level Security на 7 таблицах + автономный Demo-режим.", 9.8)
    ]
    
    for val, label, desc, xpos in metrics_s6:
        add_card(s6, xpos, 1.85, 2.733, 2.2)
        tb = s6.shapes.add_textbox(Inches(xpos + 0.2), Inches(2.0), Inches(2.333), Inches(1.9))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = val
        p.font.name = "Segoe UI"
        p.font.size = Pt(26)
        p.font.bold = True
        p.font.color.rgb = C_EMERALD
        p.space_after = Pt(2)

        p = tf.add_paragraph()
        p.text = label
        p.font.name = "Segoe UI"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = C_MUTED
        p.space_after = Pt(6)

        p = tf.add_paragraph()
        p.text = desc
        p.font.name = "Segoe UI"
        p.font.size = Pt(11)
        p.font.color.rgb = C_LIGHT

    # Bottom Roadmap Card
    add_card(s6, 0.8, 4.25, 11.733, 2.55, is_hero=True)
    tb_road = s6.shapes.add_textbox(Inches(1.1), Inches(4.45), Inches(11.133), Inches(2.15))
    tf_road = tb_road.text_frame
    tf_road.word_wrap = True
    
    p = tf_road.paragraphs[0]
    p.text = "ДОРОЖНАЯ КАРТА ВНЕДРЕНИЯ НА ПОЛИВНОЙ СЕЗОН 2026:"
    p.font.name = "Segoe UI"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p.space_after = Pt(8)

    p = tf_road.add_paragraph()
    p.text = "• Май–Июнь 2026: Запуск пилотных испытаний с 3–5 фермерскими хозяйствами в Туркестанской (хлопок/кукуруза) и Кызылординской (рис) областях на площади 200–300 га с установкой контрольных расходомеров.\n• Июль–Август 2026: Непрерывный мониторинг, сбор данных по фактическому расходу воды и энергопотреблению насосов, калибровка почвенных коэффициентов.\n• Сентябрь–Октябрь 2026: Подведение итогов поливного сезона, публикация верифицированного кейс-стади с подтверждённой экономией воды и заключение первых коммерческих B2B-контрактов на сезон 2027."
    p.font.name = "Segoe UI"
    p.font.size = Pt(12)
    p.font.color.rgb = C_LIGHT

    # =========================================================================
    # SLIDE 7: КОНКУРЕНТЫ (Comparison Table)
    # =========================================================================
    s7 = add_slide_frame("07 / КОНКУРЕНТЫ", "Почему фермер выберет AquaAI, а не альтернативы", "Сравнительная матрица ключевых решений по управлению орошением", 7)
    
    # Create Table Shape directly
    t_shape = s7.shapes.add_table(4, 4, Inches(0.8), Inches(1.85), Inches(11.733), Inches(3.6))
    table = t_shape.table
    table.columns[0].width = Inches(2.8)
    table.columns[1].width = Inches(2.3)
    table.columns[2].width = Inches(3.6)
    table.columns[3].width = Inches(3.033)

    headers = ["Решение", "Цена для фермера", "Ключевое отличие", "Слабое место"]
    rows = [
        ("AquaAI (Наше решение)", "$1.50 / га в сезон (~750 ₸)", "Работает в браузере без датчиков, казахский язык, расчёт по насосам", "Молодой бренд на стадии запуска пилотных испытаний"),
        ("Зарубежные системы (CropX, FieldNET)", "$3,000–$10,000 за комплект", "Высокая точность при наличии дорогого оборудования", "Недоступно малым фермерам, нет казахского языка, сложный монтаж"),
        ("Традиционный арык («на глаз»)", "0 ₸ за софт (но миллионы за перелив)", "Привычно фермерам, не требует обучения", "Потери до 40% воды, гигантские счета за насосы, риск гибели урожая")
    ]

    for c_idx, h_text in enumerate(headers):
        cell = table.cell(0, c_idx)
        cell.text = h_text
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_CARD_BG_HERO
        p = cell.text_frame.paragraphs[0]
        p.font.name = "Segoe UI"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = C_EMERALD

    for r_idx, row in enumerate(rows):
        is_aqua = (r_idx == 0)
        for c_idx, val in enumerate(row):
            cell = table.cell(r_idx + 1, c_idx)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = RGBColor(16, 42, 36) if is_aqua else C_CARD_BG
            p = cell.text_frame.paragraphs[0]
            p.font.name = "Segoe UI"
            p.font.size = Pt(11)
            p.font.bold = is_aqua
            p.font.color.rgb = C_EMERALD if (is_aqua and c_idx == 0) else C_LIGHT

    # Bottom Moat Card
    add_card(s7, 0.8, 5.65, 11.733, 1.15)
    tb_moat = s7.shapes.add_textbox(Inches(1.0), Inches(5.75), Inches(11.333), Inches(0.95))
    tf_moat = tb_moat.text_frame
    tf_moat.word_wrap = True
    p = tf_moat.paragraphs[0]
    p.text = "ЗАЩИТНЫЕ БАРЬЕРЫ (MOAT):"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.space_after = Pt(2)
    p = tf_moat.add_paragraph()
    p.text = "1) Глубокая локализация под гидрологию бассейнов Сырдарьи и Или и казахский язык; 2) Нулевой порог входа — расчёт запускается за 30 секунд без покупки датчиков; 3) Встроенный математический расчёт производительности насосного парка."
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = C_LIGHT

    # =========================================================================
    # SLIDE 8: КОМАНДА
    # =========================================================================
    s8 = add_slide_frame("08 / КОМАНДА", "Компетенции для реализации и масштабирования", "Опыт команды, доказывающий способность довести проект до устойчивого результата", 8)
    
    # 4 Team Cards (2x2)
    team = [
        ("Салават Ахметов", "FOUNDER & LEAD FULL-STACK ARCHITECT", "• Опыт в Full-Stack веб-разработке (Next.js 16, TypeScript, Cloud Architecture, PostgreSQL)\n• Проектирование масштабируемых систем и интеграция AI-моделей\n• Полная программная реализация платформы и расчётного ядра AquaAI", 0.8, 1.85),
        ("Агрономический эксперт", "АГРОНОМИЯ & ПОЧВОВЕДЕНИЕ", "• Экспертиза в прикладном орошаемом земледелии юга Казахстана\n• Практический опыт адаптации коэффициентов культур (Kc) по FAO-56\n• Знание полевой специфики хлопчатника, кукурузы, риса и садов", 6.8, 1.85),
        ("Инженер по гидрологии", "ГИДРАВЛИКА & ТЕЛЕМЕТРИЯ НАСОСОВ", "• Гидравлические расчёты, подбор погружных и поверхностных насосов\n• Проектирование систем капельного и дождевального орошения\n• Опыт монтажа и поверки промышленных расходомеров", 0.8, 4.45),
        ("Менторы и советники", "БИЗНЕС-КЛУБ PARASAT & AGRI-EXPERTS", "• Поддержка ведущих предпринимателей и экспертов водного хозяйства\n• Доступ к агрохолдингам и кооперативам Туркестанской области\n• Экспертиза в масштабировании B2B SaaS-продуктов в Центральной Азии", 6.8, 4.45)
    ]
    
    for name, role, bio, xpos, ypos in team:
        add_card(s8, xpos, ypos, 5.733, 2.4)
        tb = s8.shapes.add_textbox(Inches(xpos + 0.25), Inches(ypos + 0.2), Inches(5.233), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = name
        p.font.name = "Segoe UI"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = C_WHITE
        p.space_after = Pt(2)

        p = tf.add_paragraph()
        p.text = role
        p.font.name = "Segoe UI"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = C_EMERALD
        p.space_after = Pt(8)

        p = tf.add_paragraph()
        p.text = bio
        p.font.name = "Segoe UI"
        p.font.size = Pt(11)
        p.font.color.rgb = C_LIGHT

    # =========================================================================
    # SLIDE 9: ЗАПРОС
    # =========================================================================
    s9 = add_slide_frame("09 / ЗАПРОС", "Инвестиции и партнёрства для пилотного сезона 2026", "Сколько средств нужно, распределение бюджета и целевые партнёры", 9)
    
    # 3 Budget Allocation Cards
    budgets = [
        ("40%", "ПОЛЕВЫЕ ПИЛОТЫ", "Закупка контрольных поверенных расходомеров для оборудования 3–5 пилотных полей в Туркестанской и Кызылординской областях для сбора эталонных гидрологических данных.", 0.8, C_EMERALD),
        ("30%", "РАЗВИТИЕ ПРОДУКТА", "Разработка мобильного офлайн PWA-приложения для поливальщиков без интернета и интеграция спутниковых спектральных снимков Sentinel-2 (NDVI / NDWI).", 4.8, C_CYAN),
        ("30%", "АГРО-МАРКЕТИНГ", "Проведение демонстрационных полевых дней для агрономов и подключение первых 20 коммерческих фермерских хозяйств на юге Казахстана к поливному сезону 2027.", 8.8, C_EMERALD)
    ]
    
    for pct, title, desc, xpos, color in budgets:
        add_card(s9, xpos, 1.85, 3.733, 2.9)
        tb = s9.shapes.add_textbox(Inches(xpos + 0.25), Inches(2.05), Inches(3.233), Inches(2.5))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = pct
        p.font.name = "Segoe UI"
        p.font.size = Pt(36)
        p.font.bold = True
        p.font.color.rgb = color
        p.space_after = Pt(2)

        p = tf.add_paragraph()
        p.text = title
        p.font.name = "Segoe UI"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_MUTED
        p.space_after = Pt(8)

        p = tf.add_paragraph()
        p.text = desc
        p.font.name = "Segoe UI"
        p.font.size = Pt(12)
        p.font.color.rgb = C_LIGHT

    # Bottom Ask & Partnership Card
    add_card(s9, 0.8, 4.95, 11.733, 1.85, is_hero=True)
    tb_ask = s9.shapes.add_textbox(Inches(1.1), Inches(5.15), Inches(11.133), Inches(1.45))
    tf_ask = tb_ask.text_frame
    tf_ask.word_wrap = True
    
    p = tf_ask.paragraphs[0]
    p.text = "ЦЕЛЕВЫЕ ПАРТНЁРЫ И ЗАПРОС К КОНКУРСУ IDEA MINERS:"
    p.font.name = "Segoe UI"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.space_after = Pt(6)

    p = tf_ask.add_paragraph()
    p.text = "• Мы ищем прямые контакты с Сельскохозяйственными производственными кооперативами (СПК), крестьянскими хозяйствами и Ассоциациями водопользователей (АВП) Туркестанской, Жамбылской и Кызылординской областей.\n• Цель: проведение совместных полевых пилотных испытаний летом 2026 года для доказательства сокращения расходов на воду и электроэнергию.\n• Контакты: info@aquaai.kz  |  github.com/SalaAkh/AquaAI  |  Астана / Алматы"
    p.font.name = "Segoe UI"
    p.font.size = Pt(12)
    p.font.color.rgb = C_LIGHT

    # Save PPTX
    prs.save(output_pptx)
    print(f"[OK] Premium presentation saved: {output_pptx}")

if __name__ == "__main__":
    build_deck()
