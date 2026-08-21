/**
 * Генератор презентаций
 */
 export class PresentationGenerator {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    /**
     * Генерация презентации из данных
     */
    generate(data, template) {
        if (!data || !data.slides) {
            throw new Error('Invalid data format');
        }

        const slides = data.slides.map((slide, index) => {
            return this.createSlide(slide, index, template);
        });

        const presentation = {
            title: data.title || 'Моя презентация',
            slides: slides,
            template: template,
            metadata: {
                generated: new Date().toISOString(),
                totalSlides: slides.length
            }
        };

        return presentation;
    }

    /**
     * Создание отдельного слайда
     */
    createSlide(slideData, index, template) {
        const layouts = {
            modern: {
                titleClass: 'modern-title',
                contentClass: 'modern-content',
                background: 'linear-gradient(135deg, #1a1932, #2d2b55)'
            },
            creative: {
                titleClass: 'creative-title',
                contentClass: 'creative-content',
                background: 'linear-gradient(135deg, #ff6b6b, #ffd93d)'
            },
            corporate: {
                titleClass: 'corporate-title',
                contentClass: 'corporate-content',
                background: 'linear-gradient(135deg, #2d2b55, #0f0e17)'
            }
        };

        const layout = layouts[template?.id] || layouts.modern;

        return {
            id: index + 1,
            title: slideData.title || `Слайд ${index + 1}`,
            content: slideData.content || slideData.text || '',
            type: this.detectSlideType(slideData),
            layout: layout,
            style: {
                background: layout.background
            }
        };
    }

    /**
     * Определение типа слайда
     */
    detectSlideType(slideData) {
        if (slideData.content && slideData.content.includes('\n- ')) {
            return 'list';
        }
        if (slideData.image) {
            return 'image';
        }
        return 'text';
    }
}