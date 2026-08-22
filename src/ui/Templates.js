import { Component } from '../core/Component.js';
import { TemplateParser } from '../utils/TemplateParser.js';

export class Templates extends Component {
    constructor(containerId, stateManager) {
        super(containerId);
        this.stateManager = stateManager;
        this.templates = TemplateParser.getAvailableTemplates();
        this.render();
    }

    render() {
        if (!this.container) {
            console.warn('Templates container not found');
            return;
        }

        this.container.innerHTML = this.templates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-preview">${template.icon}</div>
                <div class="template-info">
                    <h4>${template.name}</h4>
                    <p>${template.desc}</p>
                </div>
            </div>
        `).join('');

        // Восстанавливаем выбранный шаблон
        const state = this.stateManager.getState();
        if (state.currentTemplate) {
            const cards = this.container.querySelectorAll('.template-card');
            cards.forEach(card => {
                if (card.dataset.templateId === state.currentTemplate.id) {
                    card.classList.add('active');
                }
            });
        }

        this.container.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const templateId = card.dataset.templateId;
                const template = this.templates.find(t => t.id === templateId);
                if (template) {
                    this.container.querySelectorAll('.template-card').forEach(c => 
                        c.classList.remove('active')
                    );
                    card.classList.add('active');
                    
                    this.stateManager.setState({ currentTemplate: template });
                    console.log('🎨 Template selected:', template);
                }
            });
        });
    }
}