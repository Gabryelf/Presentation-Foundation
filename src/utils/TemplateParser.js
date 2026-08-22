/**
 * Парсер шаблонов для разных форматов
 */
 export class TemplateParser {
    /**
     * Парсинг данных в зависимости от шаблона
     */
    static parse(data, templateId) {
        // Убедимся, что данные имеют правильную структуру
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

    static parseModern(data) {
        return {
            title: data.title || 'Презентация',
            slides: data.slides.map(slide => ({
                title: slide.title || 'Слайд',
                content: slide.content || '',
                type: this.detectType(slide.content),
                layout: 'modern'
            }))
        };
    }

    static parseCreative(data) {
        const emojis = ['🚀', '💡', '🎯', '🌟', '💎', '🎨', '🔥', '✨'];
        
        return {
            title: `🎨 ${data.title || 'Креативная презентация'}`,
            slides: data.slides.map((slide, index) => ({
                title: `${emojis[index % emojis.length]} ${slide.title || `Идея ${index + 1}`}`,
                content: slide.content || '',
                type: this.detectType(slide.content),
                layout: 'creative',
                emoji: emojis[index % emojis.length]
            }))
        };
    }

    static parseCorporate(data) {
        return {
            title: `📊 ${data.title || 'Корпоративная презентация'}`,
            slides: data.slides.map(slide => ({
                title: slide.title || `Раздел ${data.slides.indexOf(slide) + 1}`,
                content: slide.content || '',
                type: this.detectType(slide.content),
                layout: 'corporate'
            }))
        };
    }

    static parseMinimal(data) {
        return {
            title: data.title || 'Minimal',
            slides: data.slides.map(slide => ({
                title: slide.title || '',
                content: slide.content || '',
                type: this.detectType(slide.content),
                layout: 'minimal'
            }))
        };
    }

    static parseDetailed(data) {
        return {
            title: `📋 ${data.title || 'Детальная презентация'}`,
            slides: data.slides.map(slide => {
                const parts = slide.content ? slide.content.split('\n\n') : [];
                return {
                    title: slide.title || 'Подробно',
                    content: slide.content || '',
                    subtitle: parts.length > 1 ? parts[0] : '',
                    details: parts.length > 1 ? parts.slice(1).join('\n\n') : slide.content,
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
                title: slide.title || 'Слайд',
                content: slide.content || '',
                type: this.detectType(slide.content),
                layout: 'default'
            }))
        };
    }

    static detectType(content) {
        if (!content) return 'text';
        if (content.includes('\n- ')) return 'list';
        if (content.includes('```')) return 'code';
        if (content.match(/^#+\s/)) return 'heading';
        if (content.match(/^\d+\.\s/)) return 'numbered';
        return 'text';
    }

    static getAvailableTemplates() {
        return [
            { id: 'modern', name: 'Современный', icon: '💎', desc: 'Минималистичный дизайн' },
            { id: 'creative', name: 'Креативный', icon: '🎨', desc: 'Яркие цвета и формы' },
            { id: 'corporate', name: 'Корпоративный', icon: '🏢', desc: 'Строгий деловой стиль' },
            { id: 'minimal', name: 'Минималистичный', icon: '⬜', desc: 'Максимум пространства' },
            { id: 'detailed', name: 'Детальный', icon: '📋', desc: 'С подзаголовками' }
        ];
    }
}