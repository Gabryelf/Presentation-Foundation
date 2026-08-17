import { Component } from '../core/Component.js';

export class Templates extends Component {
    constructor(containerId, stateManager) {
        super(containerId);
        this.stateManager = stateManager;
        this.templates = [
            { id: 'modern', name: 'Современный', icon: '💎', desc: 'Минималистичный дизайн' },
            { id: 'creative', name: 'Креативный', icon: '🎨', desc: 'Яркие цвета и формы' },
            { id: 'corporate', name: 'Корпоративный', icon: '🏢', desc: 'Строгий деловой стиль' }
        ];
        this.render();
    }

    render() {
        this.container.innerHTML = this.templates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-preview">${template.icon}</div>
                <div class="template-info">
                    <h4>${template.name}</h4>
                    <p>${template.desc}</p>
                </div>
            </div>
        `).join('');

        // Добавляем обработчики кликов
        this.container.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const templateId = card.dataset.templateId;
                const template = this.templates.find(t => t.id === templateId);
                if (template) {
                    this.stateManager.setState({ currentTemplate: template });
                    console.log('🎨 Template selected:', template);
                }
            });
        });
    }
}