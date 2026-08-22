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
        if (saved) {
            // Применяем сохраненные стили
            setTimeout(() => this.applyStyles(saved), 50);
            return saved;
        }
        
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
        this.applyStyles(this.styles);
        this.showNotification('✅ Стили сохранены!', 'success');
    }

    applyStyles(styles) {
        const root = document.documentElement;
        if (styles.primaryColor) {
            root.style.setProperty('--primary-color', styles.primaryColor);
        }
        if (styles.backgroundColor) {
            root.style.setProperty('--bg-primary', styles.backgroundColor);
        }
        if (styles.textColor) {
            root.style.setProperty('--text-primary', styles.textColor);
        }
        if (styles.cardBackground) {
            root.style.setProperty('--bg-secondary', styles.cardBackground);
        }
        if (styles.cornerRadius) {
            root.style.setProperty('--radius', `${styles.cornerRadius}px`);
        }
        
        // Обновляем состояние
        this.stateManager.setState({ styleSettings: styles });
    }

    render() {
        const colorOptions = [
            '#6C63FF', '#FF6B6B', '#FFD93D', '#6BCB77', 
            '#4D96FF', '#FF6BD6', '#00D2FF', '#FF9F43'
        ];

        const bgOptions = ['#0F0E17', '#1A1932', '#2D2B55', '#FFFFFE', '#F5F5F5'];

        if (!this.container) {
            console.warn('StyleEditor container not found');
            return;
        }

        this.container.innerHTML = `
            <div class="style-editor">
                <h3>🎨 Настройка стилей</h3>
                <p class="style-subtitle">Настройте внешний вид вашей презентации</p>
                
                <div class="style-presets">
                    <button class="preset-btn" data-preset="dark">🌙 Темный</button>
                    <button class="preset-btn" data-preset="light">☀️ Светлый</button>
                    <button class="preset-btn" data-preset="colorful">🌈 Яркий</button>
                    <button class="preset-btn" data-preset="minimal">⬜ Минимал</button>
                </div>
                
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
                        ${bgOptions.map(color => `
                            <div class="color-swatch ${this.styles.backgroundColor === color ? 'active' : ''}" 
                                 style="background: ${color}; ${color === '#FFFFFE' || color === '#F5F5F5' ? 'border: 2px solid #ddd;' : ''}"
                                 data-color="${color}"
                                 data-setting="backgroundColor"></div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="style-option">
                    <label>Скругление углов: <span class="range-value">${this.styles.cornerRadius}px</span></label>
                    <input type="range" min="4" max="32" value="${this.styles.cornerRadius}" 
                           class="style-range" data-setting="cornerRadius">
                </div>
                
                <div class="style-option">
                    <label>Анимация слайдов</label>
                    <select class="style-select" data-setting="slideAnimation">
                        <option value="fade" ${this.styles.slideAnimation === 'fade' ? 'selected' : ''}>Плавное затухание</option>
                        <option value="slide" ${this.styles.slideAnimation === 'slide' ? 'selected' : ''}>Скольжение</option>
                        <option value="scale" ${this.styles.slideAnimation === 'scale' ? 'selected' : ''}>Масштабирование</option>
                        <option value="bounce" ${this.styles.slideAnimation === 'bounce' ? 'selected' : ''}>Подпрыгивание</option>
                        <option value="flip" ${this.styles.slideAnimation === 'flip' ? 'selected' : ''}>Переворот</option>
                        <option value="glow" ${this.styles.slideAnimation === 'glow' ? 'selected' : ''}>Свечение</option>
                        <option value="none" ${this.styles.slideAnimation === 'none' ? 'selected' : ''}>Без анимации</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px;">
                    <button class="btn-primary" id="save-styles-btn">💾 Сохранить стиль</button>
                    <button class="btn-secondary" id="reset-styles-btn">↺ Сбросить</button>
                </div>
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
                
                const parent = swatch.parentElement;
                parent.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                
                this.styles[setting] = color;
                this.applyStyles(this.styles);
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
                
                this.applyStyles(this.styles);
            });
        });

        // Select
        this.container.querySelectorAll('.style-select').forEach(select => {
            select.addEventListener('change', () => {
                const setting = select.dataset.setting;
                this.styles[setting] = select.value;
                this.applyStyles(this.styles);
            });
        });

        // Пресеты
        this.container.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                this.applyPreset(preset);
            });
        });

        // Кнопка сохранения
        const saveBtn = this.container.querySelector('#save-styles-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveStyles();
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
                this.applyStyles(this.styles);
                this.render();
                this.showNotification('↺ Стили сброшены к стандартным', 'info');
            });
        }
    }

    applyPreset(preset) {
        const presets = {
            dark: {
                primaryColor: '#6C63FF',
                backgroundColor: '#0F0E17',
                textColor: '#FFFFFE',
                cardBackground: '#1A1932',
                cornerRadius: '16',
                slideAnimation: 'fade'
            },
            light: {
                primaryColor: '#4D96FF',
                backgroundColor: '#F5F5F5',
                textColor: '#0F0E17',
                cardBackground: '#FFFFFF',
                cornerRadius: '12',
                slideAnimation: 'slide'
            },
            colorful: {
                primaryColor: '#FF6B6B',
                backgroundColor: '#1A1932',
                textColor: '#FFFFFE',
                cardBackground: '#2D2B55',
                cornerRadius: '20',
                slideAnimation: 'bounce'
            },
            minimal: {
                primaryColor: '#333333',
                backgroundColor: '#FFFFFF',
                textColor: '#0F0E17',
                cardBackground: '#F8F8F8',
                cornerRadius: '4',
                slideAnimation: 'none'
            }
        };

        const selected = presets[preset];
        if (selected) {
            this.styles = { ...this.styles, ...selected };
            this.applyStyles(this.styles);
            this.render();
            this.showNotification(`🎨 Применен пресет "${preset}"`, 'success');
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