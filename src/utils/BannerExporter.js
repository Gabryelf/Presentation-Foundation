/**
 * Экспорт баннера в standalone HTML.
 * Канвас масштабируется через CSS (vw/vh + clamp), поэтому
 * итоговый HTML не даёт скроллов и всегда помещается в экран.
 */
 export class BannerExporter {
    static exportToHTML(state) {
        const { layout, background, accent, font, decor, format, blocks } = state;
        const fontFamily = {
            inter: "'Inter', sans-serif",
            playfair: "'Playfair Display', serif",
            space: "'Space Grotesk', sans-serif",
            jetbrains: "'JetBrains Mono', monospace"
        }[font] || "'Inter', sans-serif";

        const areaRows = layout.grid.rows;
        const areaCols = layout.grid.columns;

        const gridAreas = layout.areas
            .map(row => `"${row.join(' ')}"`)
            .join(' ');

        const blocksHTML = blocks.map(b => `
            <div class="b-block" style="grid-area:${b.id};">
                ${b.title ? `<div class="b-title">${this.escape(b.title)}</div>` : ''}
                ${b.text ? `<div class="b-text">${this.escape(b.text).replace(/\n/g, '<br>')}</div>` : ''}
            </div>
        `).join('');

        return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Баннер</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&family=Playfair+Display:wght@400;600;800&family=Space+Grotesk:wght@300;500;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html,body { height:100%; overflow:hidden; background:#0F0E17; }
    body {
        display:flex; align-items:center; justify-content:center;
        font-family:${fontFamily};
    }
    .banner {
        width:min(96vw, 96vh * ${this.ratio(format)});
        aspect-ratio: ${format.replace(':', '/')};
        background: ${background};
        border-radius: 16px;
        display:grid;
        grid-template-columns: ${areaCols};
        grid-template-rows: ${areaRows};
        grid-template-areas: ${gridAreas};
        overflow:hidden;
        position:relative;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        color:#fff;
    }
    ${this.decorCSS(decor, accent)}
    .b-block {
        padding: clamp(8px, 2.5vmin, 28px);
        display:flex; flex-direction:column; justify-content:center;
        overflow:hidden;
        border-left: 3px solid transparent;
        transition: border-color .3s;
    }
    .b-block:hover { border-left-color: ${accent}; }
    .b-title {
        font-weight:800; line-height:1.1; margin-bottom:.3em;
        font-size: clamp(14px, 2.6vmin, 40px);
        letter-spacing:-0.02em;
        color:${accent};
        word-break:break-word;
    }
    .b-text {
        font-size: clamp(10px, 1.6vmin, 20px);
        line-height:1.35; opacity:.92;
        word-break:break-word;
    }
</style>
</head>
<body>
    <div class="banner">
        ${blocksHTML}
    </div>
</body>
</html>`;
    }

    static ratio(format) {
        const [a, b] = format.split(':').map(Number);
        return (a / b).toFixed(4);
    }

    static decorCSS(decor, accent) {
        switch (decor) {
            case 'glow':
                return `.banner::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), transparent 60%);pointer-events:none;}`;
            case 'grid':
                return `.banner::after{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px);background-size:24px 24px;pointer-events:none;}`;
            case 'dots':
                return `.banner::after{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,0.12) 1px,transparent 1px);background-size:16px 16px;pointer-events:none;}`;
            case 'noise':
                return `.banner::after{content:'';position:absolute;inset:0;opacity:.15;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");pointer-events:none;}`;
            default:
                return '';
        }
    }

    static escape(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}