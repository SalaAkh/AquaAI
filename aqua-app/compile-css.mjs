import fs from 'node:fs';
import path from 'node:path';

async function buildCss() {
  const globalsPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
  
  try {
    const { compile } = await import('@tailwindcss/node');
    const compiler = await compile('@import "tailwindcss";', {
      base: process.cwd(),
      onDependency: () => {},
    });
    console.log('Tailwind compiler initialized.');

    // Collect candidate strings from all files in src
    const files = [];
    function scan(dir) {
      if (!fs.existsSync(dir)) return;
      for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
          if (f !== 'node_modules' && f !== '.next') scan(p);
        } else if (/\.(tsx|ts|jsx|js|html)$/.test(f)) {
          files.push(p);
        }
      }
    }
    scan(path.join(process.cwd(), 'src'));

    const candidates = new Set();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const matches = content.match(/[a-zA-Z0-9_\-\/\[\]\:\.\%\#]+/g) || [];
      for (const m of matches) candidates.add(m);
    }

    console.log('Total candidates found:', candidates.size);
    const compiledTailwind = compiler.build(Array.from(candidates));
    console.log('Compiled Tailwind CSS length:', compiledTailwind.length);

    const customCss = `
:root {
  --background: #f8fafc;
  --surface: #ffffff;
  --foreground: #0f172a;
  --muted: #64748b;
  --primary: #0284c7;
  --primary-hover: #0369a1;
  --emerald: #059669;
  --turquoise: #0d9488;
  --border: #e2e8f0;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Native phone viewport comfort rules. Included on every prebuild. */
@media (max-width: 639px) {
  html, body { max-width: 100%; overflow-x: clip; }
  button, select, input, textarea { touch-action: manipulation; }
  input:not([type="checkbox"]):not([type="radio"]):not([type="range"]),
  textarea, select { font-size: 16px; }
  #dashboard-content { scroll-margin-top: 7rem; }
  #irrigation-entry-form, #irrigation-tracking-section { scroll-margin-top: 8rem; }
}
/* Glassmorphism & card elevation */
.card-glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.card-glass-hover {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-glass-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -10px rgba(15, 23, 42, 0.08);
  border-color: rgba(14, 165, 233, 0.3);
}

/* Subtle gradient text */
.text-gradient-water {
  background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-gradient-emerald {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Custom subtle scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animation utilities */
@keyframes pulseSubtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.animate-pulse-subtle {
  animation: pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
`;

    const finalCss = `${compiledTailwind}\n\n${customCss}`;
    fs.writeFileSync(globalsPath, finalCss, 'utf-8');
    console.log('Successfully written full CSS to src/app/globals.css! Total length:', finalCss.length);
  } catch (err) {
    console.warn('Tailwind compiler warning:', err.message);
    if (fs.existsSync(globalsPath) && fs.statSync(globalsPath).size > 1000) {
      console.log('Existing globals.css detected, proceeding with existing styles.');
    } else {
      throw err;
    }
  }
}

buildCss().catch((err) => {
  console.error(err);
  process.exit(1);
});
