import { Component } from '../core/Component.js';
import { StorageManager } from '../storage/StorageManager.js';

export class StyleEditor extends Component {
    constructor(containerId, stateManager) {
        super(containerId);
        this.stateManager = stateManager;
        this.styles = this.loadStyles();
        this.render();
    }

    loadStyles() {
        const saved = StorageManager.load('user_styles');
        if (saved) return saved;
        
        return {
            primaryColor: '#6C63FF',
            backgroundColor: '#0F0E17',
            textColor: '#FFFFFE',
            cardBackground: '#1A1932',
            fontFamily: 'default',
            slideAnimation: 'fade',
            cornerRadius: '16',
            shadowIntensity: 'medium'
        };
    }

    saveStyles() {
        StorageManager.save('user_styles', this.styles);
        this.applyStyles();
    }

    applyStyles() {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', this.styles.primaryColor);
        root.style.setProperty('--bg-primary', this.styles.backgroundColor);
        root.style.setProperty('--text-primary', this.styles.textColor);
        root.style.setProperty('--bg-secondary', this.styles.cardBackground);
        root.style.setProperty('--radius', `${this.styles.cornerRadius}px`);
    }

    render() {
        const colorOptions = [
            '#6C63FF', '#FF6B6B', '#FFD93D', '#6BCB77', 
            '#4D96FF', '#FF6BD6', '#00D2FF', '#FF9F43'
        ];

        this.container.innerHTML = `
            <div class="style-editor">
                <h3>🎨 Настройка стилей</h3>
                <p class="style-subtitle">Настройте внешний вид вашей презентации</p>
                
                <div class="style-option">
                    <label>Основной цвет</label>
                    <div class="color-picker">
                        ${colorOptions.map(color => `
                            <div class="color-swatch ${this.styles.primaryColor === color ? 'active' : ''}" 
                                 style="background: ${color}"
                                 data-color="${color}"></div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="style-option">
                    <label>Цвет фона</label>
                    <div class="color-picker">
                        ${['#0F0E17', '#1A1932', '#2D2B55', '#FFFFFE', '#F5F5F5'].map(color => `
                            <div class="color-swatch ${this.styles.backgroundColor === color ? 'active' : ''}" 
                                 style="background: ${color}"
                                 data-color="${color}"
                                 data-setting="backgroundColor"></div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="style-option">
                    <label>Скругление углов</label>
                    <input type="range" min="4" max="32" value="${this.styles.cornerRadius}" 
                           class="style-range" data-setting="cornerRadius">
                    <span class="range-value">${this.styles.cornerRadius}px</span>
                </div>
                
                <div class="style-option">
                    <label>Анимация слайдов</label>
                    <select class="style-select" data-setting="slideAnimation">
                        <option value="fade" ${this.styles.slideAnimation === 'fade' ? 'selected' : ''}>Плавное затухание</option>
                        <option value="slide" ${this.styles.slideAnimation === 'slide' ? 'selected' : ''}>Скольжение</option>
                        <option value="scale" ${this.styles.slideAnimation === 'scale' ? 'selected' : ''}>Масштабирование</option>
                        <option value="none" ${this.styles.slideAnimation === 'none' ? 'selected' : ''}>Без анимации</option>
                    </select>
                </div>
                
                <button class="btn-primary" id="save-styles-btn">💾 Сохранить стиль</button>
                <button class="btn-secondary" id="reset-styles-btn">↺ Сбросить</button>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Цветовые палитры
        this.container.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                const color = swatch.dataset.color;
                const setting = swatch.dataset.setting || 'primaryColor';
                
                // Обновляем активный класс
                const parent = swatch.parentElement;
                parent.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                
                // Обновляем стиль
                this.styles[setting] = color;
                this.applyStyles();
            });
        });

        // Range слайдеры
        this.container.querySelectorAll('.style-range').forEach(range => {
            range.addEventListener('input', () => {
                const setting = range.dataset.setting;
                const value = range.value;
                this.styles[setting] = value;
                
                const valueDisplay = range.parentElement.querySelector('.range-value');
                if (valueDisplay) {
                    valueDisplay.textContent = `${value}px`;
                }
                
                this.applyStyles();
            });
        });

        // Select
        this.container.querySelectorAll('.style-select').forEach(select => {
            select.addEventListener('change', () => {
                const setting = select.dataset.setting;
                this.styles[setting] = select.value;
                this.applyStyles();
            });
        });

        // Кнопка сохранения
        const saveBtn = this.container.querySelector('#save-styles-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveStyles();
                this.showNotification('✅ Стили сохранены!', 'success');
            });
        }

        // Кнопка сброса
        const resetBtn = this.container.querySelector('#reset-styles-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.styles = {
                    primaryColor: '#6C63FF',
                    backgroundColor: '#0F0E17',
                    textColor: '#FFFFFE',
                    cardBackground: '#1A1932',
                    fontFamily: 'default',
                    slideAnimation: 'fade',
                    cornerRadius: '16',
                    shadowIntensity: 'medium'
                };
                this.saveStyles();
                this.render();
                this.showNotification('↺ Стили сброшены', 'info');
            });
        }
    }

    showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}