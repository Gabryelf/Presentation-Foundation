/**
 * Генератор презентаций
 */
 export class PresentationGenerator {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

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

    createSlide(slideData, index, template) {
        const layouts = {
            modern: {
                titleClass: 'modern-title',
                contentClass: 'modern-content',
                background: 'linear-gradient(135deg, #1a1932, #2d2b55)',
                textColor: '#FFFFFE',
                accentColor: '#6C63FF'
            },
            creative: {
                titleClass: 'creative-title',
                contentClass: 'creative-content',
                background: 'linear-gradient(135deg, #ff6b6b, #ffd93d)',
                textColor: '#0F0E17',
                accentColor: '#FF6B6B'
            },
            corporate: {
                titleClass: 'corporate-title',
                contentClass: 'corporate-content',
                background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                textColor: '#FFFFFE',
                accentColor: '#4D96FF'
            },
            minimal: {
                titleClass: 'minimal-title',
                contentClass: 'minimal-content',
                background: '#FFFFFF',
                textColor: '#0F0E17',
                accentColor: '#333333'
            },
            detailed: {
                titleClass: 'detailed-title',
                contentClass: 'detailed-content',
                background: 'linear-gradient(135deg, #2d2b55, #1a1932)',
                textColor: '#FFFFFE',
                accentColor: '#FFD93D'
            }
        };

        const layout = layouts[template?.id] || layouts.modern;

        return {
            id: index + 1,
            title: slideData.title || `Слайд ${index + 1}`,
            content: slideData.content || slideData.text || '',
            type: this.detectSlideType(slideData),
            layout: layout,
            image: slideData.image || null,
            style: {
                background: layout.background,
                textColor: layout.textColor,
                accentColor: layout.accentColor
            }
        };
    }

    detectSlideType(slideData) {
        const content = slideData.content || '';
        
        if (slideData.image) return 'image';
        if (content.includes('\n- ')) return 'list';
        if (content.includes('```')) return 'code';
        if (content.match(/^#{1,6}\s/)) return 'heading';
        if (content.match(/^\d+\.\s/)) return 'numbered';
        if (content.includes('|') && content.includes('---')) return 'table';
        return 'text';
    }
}