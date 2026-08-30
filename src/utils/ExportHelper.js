/**
 * Помощник для экспорта презентаций с полным функционалом
 */
 export class ExportHelper {
    static exportToHTML(presentation) {
        const slidesHTML = presentation.slides.map((slide, index) => {
            let contentHTML = '';
            
            // Изображение
            if (slide.image) {
                contentHTML += `<div class="slide-image"><img src="${slide.image}" alt="${slide.title}"></div>`;
            }
            
            // Контент
            if (slide.type === 'list' && slide.content) {
                const items = slide.content.split('\n- ').filter(item => item.trim());
                const listItems = items.map(item => `<li>${item}</li>`).join('');
                contentHTML += `<ul>${listItems}</ul>`;
            } else if (slide.content) {
                contentHTML += `<p>${slide.content}</p>`;
            }
            
            const bgColor = slide.style?.background || slide.layout?.background || '#1A1932';
            const textColor = slide.style?.textColor || '#FFFFFE';
            const accentColor = slide.style?.accentColor || '#6C63FF';
            
            return `
                <div class="slide" data-index="${index}" style="background: ${bgColor}; color: ${textColor};">
                    <div class="slide-content" style="border-color: ${accentColor};">
                        <h2 style="color: ${accentColor};">${slide.title}</h2>
                        ${contentHTML}
                    </div>
                </div>
            `;
        }).join('');

        return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${presentation.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0F0E17;
            color: #FFFFFE;
        }
        .slide {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            border-bottom: 2px solid rgba(255,255,255,0.05);
        }
        .slide-content {
            background: rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 40px 60px;
            max-width: 900px;
            width: 100%;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .slide-image {
            margin: 12px 0 20px;
            border-radius: 8px;
            overflow: hidden;
            max-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .slide-image img {
            width: 100%;
            height: auto;
            max-height: 300px;
            object-fit: contain;
        }
        h2 {
            font-size: 32px;
            margin-bottom: 16px;
            font-weight: 700;
        }
        p {
            font-size: 18px;
            line-height: 1.8;
            opacity: 0.9;
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 12px 0;
        }
        ul li {
            padding: 10px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            font-size: 17px;
            opacity: 0.9;
        }
        ul li:last-child {
            border-bottom: none;
        }
        ul li::before {
            content: "✦ ";
            color: var(--accent-color, #6C63FF);
        }
        .slide-controls {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(12px);
            border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            opacity: 0.3;
            transition: opacity 0.3s ease;
            z-index: 100;
        }
        .slide-controls:hover {
            opacity: 0.9;
        }
        .ctrl-btn {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            padding: 6px 12px;
            border-radius: 50%;
            font-size: 18px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .ctrl-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
        .slide-counter {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            min-width: 60px;
            text-align: center;
        }
        .progress-dots {
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(8px);
            border-radius: 20px;
        }
        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .dot.active {
            background: #6C63FF;
            transform: scale(1.4);
        }
        .dot:hover {
            transform: scale(1.2);
        }
        @media (max-width: 768px) {
            .slide-content {
                padding: 24px 30px;
            }
            h2 { font-size: 26px; }
            p, ul li { font-size: 16px; }
            .slide-controls { padding: 6px 12px; }
            .ctrl-btn { font-size: 16px; padding: 4px 10px; }
        }
        @media (max-width: 480px) {
            .slide-content {
                padding: 16px 20px;
            }
            h2 { font-size: 20px; }
            p, ul li { font-size: 14px; }
        }
    </style>
</head>
<body>
    ${slidesHTML}
    
    <div class="slide-controls" id="controls">
        <button class="ctrl-btn" id="prevBtn">◀</button>
        <span class="slide-counter"><span id="currentNum">1</span> / <span id="totalNum">${presentation.slides.length}</span></span>
        <button class="ctrl-btn" id="nextBtn">▶</button>
        <button class="ctrl-btn" id="fullscreenBtn">⛶</button>
    </div>
    <div class="progress-dots" id="dots">
        ${presentation.slides.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}
    </div>

    <script>
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const currentNum = document.getElementById('currentNum');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        let current = 0;
        const total = slides.length;

        function goTo(index) {
            if (index < 0) index = 0;
            if (index >= total) index = total - 1;
            slides.forEach((s, i) => {
                s.style.display = i === index ? 'flex' : 'none';
            });
            dots.forEach((d, i) => {
                d.classList.toggle('active', i === index);
            });
            currentNum.textContent = index + 1;
            current = index;
        }

        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1); }

        prevBtn.addEventListener('click', prev);
        nextBtn.addEventListener('click', next);
        dots.forEach(dot => {
            dot.addEventListener('click', () => goTo(parseInt(dot.dataset.index)));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                next();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                prev();
            } else if (e.key === 'Escape' && document.fullscreenElement) {
                document.exitFullscreen();
            } else if (e.key === 'f') {
                toggleFullscreen();
            }
        });

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }

        fullscreenBtn.addEventListener('click', toggleFullscreen);

        goTo(0);
    </script>
</body>
</html>
        `;
    }
}