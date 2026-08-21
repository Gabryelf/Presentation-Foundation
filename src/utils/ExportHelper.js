/**
 * Помощник для экспорта презентаций
 */
 export class ExportHelper {
    /**
     * Экспорт в HTML
     */
    static exportToHTML(presentation) {
        const slidesHTML = presentation.slides.map((slide, index) => {
            let contentHTML = '';
            
            if (slide.type === 'list' && slide.content) {
                const items = slide.content.split('\n- ').filter(item => item.trim());
                const listItems = items.map(item => `<li>${item}</li>`).join('');
                contentHTML = `<ul>${listItems}</ul>`;
            } else if (slide.content) {
                contentHTML = `<p>${slide.content}</p>`;
            }

            return `
                <div class="slide" data-index="${index}">
                    <div class="slide-content">
                        <h2>${slide.title}</h2>
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
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0F0E17;
            color: #FFFFFE;
        }
        .slide {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            border-bottom: 2px solid #2D2B55;
        }
        .slide-content {
            background: #1A1932;
            border-radius: 16px;
            padding: 60px 80px;
            max-width: 900px;
            width: 100%;
            border: 1px solid #2D2B55;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        h2 {
            font-size: 36px;
            margin-bottom: 20px;
            color: #6C63FF;
        }
        p {
            font-size: 18px;
            color: #A7A9BE;
            line-height: 1.8;
        }
        ul {
            list-style: none;
            padding: 0;
        }
        ul li {
            padding: 12px 0;
            border-bottom: 1px solid #2D2B55;
            color: #A7A9BE;
            font-size: 18px;
        }
        ul li:before {
            content: "✦ ";
            color: #6C63FF;
        }
        @media (max-width: 768px) {
            .slide-content {
                padding: 30px 24px;
            }
            h2 {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    ${slidesHTML}
</body>
</html>
        `;
    }
}