/**
 * Парсер шаблонов для разных форматов
 */
 export class TemplateParser {
    /**
     * Парсинг данных в зависимости от шаблона
     */
    static parse(data, templateId) {
        // Проверяем, что data существует и содержит slides
        if (!data || !data.slides || !Array.isArray(data.slides)) {
            console.warn('Invalid data format, using fallback:', data);
            return this.createFallbackData(data);
        }

        const slides = data.slides || [];
        const title = data.title || 'Презентация';

        const parsers = {
            'modern': this.parseModern,
            'creative': this.parseCreative,
            'corporate': this.parseCorporate,
            'minimal': this.parseMinimal,
            'detailed': this.parseDetailed
        };

        const parser = parsers[templateId] || this.parseDefault;
        return parser({ title, slides });
    }

    static createFallbackData(data) {
        // Если данные неверные, создаем из того что есть
        if (typeof data === 'string') {
            const lines = data.split('\n').filter(l => l.trim());
            return {
                title: lines[0] || 'Презентация',
                slides: lines.slice(1).map((text, i) => ({
                    title: `Слайд ${i + 1}`,
                    content: text,
                    type: 'text'
                }))
            };
        }
        return {
            title: 'Презентация',
            slides: [{ title: 'Слайд 1', content: 'Данные не загружены', type: 'text' }]
        };
    }

    static parseModern(data) {
        return {
            title: data.title || 'Презентация',
            slides: data.slides.map(slide => ({
                title: this.getTitle(slide),
                content: this.getContent(slide),
                type: this.detectType(this.getContent(slide)),
                layout: 'modern'
            }))
        };
    }

    static parseCreative(data) {
        const emojis = ['🚀', '💡', '🎯', '🌟', '💎', '🎨', '🔥', '✨'];
        return {
            title: `🎨 ${data.title || 'Креативная презентация'}`,
            slides: data.slides.map((slide, index) => ({
                title: `${emojis[index % emojis.length]} ${this.getTitle(slide) || `Идея ${index + 1}`}`,
                content: this.getContent(slide),
                type: this.detectType(this.getContent(slide)),
                layout: 'creative',
                emoji: emojis[index % emojis.length]
            }))
        };
    }

    static parseCorporate(data) {
        return {
            title: `📊 ${data.title || 'Корпоративная презентация'}`,
            slides: data.slides.map(slide => ({
                title: this.getTitle(slide) || `Раздел ${data.slides.indexOf(slide) + 1}`,
                content: this.getContent(slide),
                type: this.detectType(this.getContent(slide)),
                layout: 'corporate'
            }))
        };
    }

    static parseMinimal(data) {
        return {
            title: data.title || 'Minimal',
            slides: data.slides.map(slide => ({
                title: this.getTitle(slide) || '',
                content: this.getContent(slide),
                type: this.detectType(this.getContent(slide)),
                layout: 'minimal'
            }))
        };
    }

    static parseDetailed(data) {
        return {
            title: `📋 ${data.title || 'Детальная презентация'}`,
            slides: data.slides.map(slide => {
                const content = this.getContent(slide);
                const parts = content ? content.split('\n\n') : [];
                return {
                    title: this.getTitle(slide) || 'Подробно',
                    content: content,
                    subtitle: parts.length > 1 ? parts[0] : '',
                    details: parts.length > 1 ? parts.slice(1).join('\n\n') : content,
                    type: 'detailed',
                    layout: 'detailed'
                };
            })
        };
    }

    static parseDefault(data) {
        return {
            title: data.title || 'Презентация',
            slides: data.slides.map(slide => ({
                title: this.getTitle(slide) || 'Слайд',
                content: this.getContent(slide),
                type: this.detectType(this.getContent(slide)),
                layout: 'default'
            }))
        };
    }

    static getTitle(slide) {
        if (typeof slide === 'string') {
            const lines = slide.split('\n');
            const firstLine = lines[0] || '';
            if (firstLine.startsWith('# ')) {
                return firstLine.replace('# ', '');
            }
            return firstLine.substring(0, 50) || `Слайд`;
        }
        return slide.title || slide.heading || '';
    }

    static getContent(slide) {
        if (typeof slide === 'string') {
            return slide;
        }
        return slide.content || slide.text || slide.body || '';
    }

    static detectType(content) {
        if (!content || typeof content !== 'string') return 'text';
        if (content.includes('\n- ') || content.includes('\n* ')) return 'list';
        if (content.includes('```')) return 'code';
        if (content.match(/^#+\s/m)) return 'heading';
        if (content.match(/^\d+\.\s/m)) return 'numbered';
        if (content.includes('|') && content.includes('---')) return 'table';
        return 'text';
    }

    static getAvailableTemplates() {
        return [
            { id: 'modern', name: 'Современный', icon: '💎', desc: 'Минималистичный' },
            { id: 'creative', name: 'Креативный', icon: '🎨', desc: 'Яркие цвета' },
            { id: 'corporate', name: 'Корпоративный', icon: '🏢', desc: 'Деловой стиль' },
            { id: 'minimal', name: 'Минимал', icon: '⬜', desc: 'Максимум пространства' },
            { id: 'detailed', name: 'Детальный', icon: '📋', desc: 'С подзаголовками' }
        ];
    }
}