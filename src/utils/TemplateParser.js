/**
 * Парсер шаблонов для разных форматов
 */
 export class TemplateParser {
    /**
     * Парсинг данных в зависимости от шаблона
     */
    static parse(data, templateId) {
        const parsers = {
            'modern': this.parseModern,
            'creative': this.parseCreative,
            'corporate': this.parseCorporate,
            'minimal': this.parseMinimal,
            'detailed': this.parseDetailed
        };

        const parser = parsers[templateId] || this.parseDefault;
        return parser(data);
    }

    /**
     * Современный шаблон (минималистичный)
     */
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

    /**
     * Креативный шаблон (яркий, с эмодзи)
     */
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

    /**
     * Корпоративный шаблон (строгий, деловой)
     */
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

    /**
     * Минималистичный шаблон
     */
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

    /**
     * Детальный шаблон (с подзаголовками)
     */
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

    /**
     * Шаблон по умолчанию
     */
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

    /**
     * Определение типа слайда
     */
    static detectType(content) {
        if (!content) return 'text';
        if (content.includes('\n- ')) return 'list';
        if (content.includes('```')) return 'code';
        if (content.match(/^#+\s/)) return 'heading';
        if (content.match(/^\d+\.\s/)) return 'numbered';
        return 'text';
    }

    /**
     * Получение списка доступных шаблонов
     */
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