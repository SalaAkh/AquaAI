import os, subprocess

slides_data = [
    {
        "file": "pitch_slide_1.html",
        "out": "pitch_slide_1.png",
        "sub": "FOUNDER INTRODUCTION & REGIONAL CRISIS",
        "head": "The Aral Sea Basin Water Emergency",
        "grad": "80%+ Agricultural Consumption & 50% Canals Evaporation",
        "cards": [
            ("🌊", "80%+", "Aral Basin Depletion", "Agriculture consumes over eighty percent of all regional fresh water, diverting Syr Darya and Amu Darya rivers.", "accent"),
            ("💨", "50%", "Inundation Evaporative Waste", "Unlined earthen canals and calendar flood irrigation lose half of all water volume into thin air.", "emerald"),
            ("⏳", "CRITICAL", "Compounding Soil Salinity", "We do not have decades: rising temperatures and salinization degrade fertile soils every single season.", "solana")
        ]
    },
    {
        "file": "pitch_slide_2.html",
        "out": "pitch_slide_2.png",
        "sub": "WHAT WE ARE BUILDING & WHY SOLANA",
        "head": "Precision Irrigation Meets On-Chain Auditing",
        "grad": "FAO-56 Physics, Gemini AI & Solana Trustless Verification",
        "cards": [
            ("📐", "FAO-56", "Agronomic Hydrology", "Penman-Monteith physics, Open-Meteo 7-day live weather, and Sentinel-2 NDVI satellite vegetative calibration.", "accent"),
            ("🧠", "Gemini AI", "Tactical Advisor", "Generates optimal night-pumping execution windows (22:00 - 04:00) to slash thermal flash and electricity tariffs.", "emerald"),
            ("⚡", "Solana Memo", "Trustless Water Auditing", "SHA-256 fingerprinting of every recommendation on Solana Devnet. Foundation for verified green subsidies & DePIN.", "solana")
        ]
    },
    {
        "file": "pitch_slide_3.html",
        "out": "pitch_slide_3.png",
        "sub": "WHY OUR TEAM & COLOSSEUM ACCELERATOR",
        "head": "Central Asian Roots. Rapid Execution.",
        "grad": "Scaling from Live MVP to 10,000 Hectares Pilot",
        "cards": [
            ("📍", "Central Asia", "Domain & Ground Reality", "Native roots in the Aral basin: direct understanding of river basins, regulatory subsidies, and farmer adoption.", "accent"),
            ("🚀", "Live Today", "Working Production MVP", "Fully functional Next.js platform, audited agronomic core, trilingual localization (EN/KZ/RU), and Solana Devnet.", "emerald"),
            ("🌱", "10,000 Ha", "Colosseum Target", "Deploying pilot projects across Southern Kazakhstan & Uzbekistan, integrating DePIN flow meters, and leading Solana climate-tech.", "solana")
        ]
    }
]

with open("pitch_cards.html", "r", encoding="utf-8") as f:
    template = f.read()

for s in slides_data:
    cards_html = ""
    for icon, metric, title, desc, col in s["cards"]:
        cards_html += f"""
        <div class="card">
          <div class="card-icon">{icon}</div>
          <div class="card-metric {col}">{metric}</div>
          <div class="card-title">{title}</div>
          <div class="card-desc">{desc}</div>
        </div>
        """
    
    html = template.replace('id="sub">Founder Introduction & Problem<', f'id="sub">{s["sub"]}<')
    html = html.replace('id="head">The Aral Sea Basin Water Crisis<br><span class="headline-gradient" id="grad">Central Asia\'s 80% Agriculture Water Emergency<', f'id="head">{s["head"]}<br><span class="headline-gradient" id="grad">{s["grad"]}<')
    html = html.replace('<!-- Injected by page renderer -->', cards_html)
    
    with open(s["file"], "w", encoding="utf-8") as out_f:
        out_f.write(html)
    
    abs_html = os.path.abspath(s["file"]).replace("\\", "/")
    abs_out = os.path.abspath(s["out"])
    
    cmd = [
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        f"--window-size=1920,1080",
        f"--screenshot={abs_out}",
        f"file:///{abs_html}"
    ]
    subprocess.run(cmd, check=True)
    print(f"Generated {s['out']}")
