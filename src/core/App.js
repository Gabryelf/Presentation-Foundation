import { StateManager } from './StateManager.js';
import { StorageManager } from '../storage/StorageManager.js';
import { PresentationGenerator } from './PresentationGenerator.js';
import { SlideRenderer } from './SlideRenderer.js';
import { TemplateParser } from '../utils/TemplateParser.js';
import { Header } from '../ui/Header.js';
import { Footer } from '../ui/Footer.js';
import { Templates } from '../ui/Templates.js';
import { StyleEditor } from '../ui/StyleEditor.js';
import { ExportHelper } from '../utils/ExportHelper.js';

class App {
    constructor() {
        if (App.instance) {
            return App.instance;
        }
        App.instance = this;

        this.stateManager = new StateManager();
        this.generator = new PresentationGenerator(this.stateManager);
        this.currentSlideIndex = 0;
        this.presentation = null;
        this.zoomLevel = 1;
        this.isFullscreen = false;
        
        this.loadSettings();
        this.init();
    }

    init() {
        console.log('🚀 Presentation-Foundation v3.0.0');
        
        // Инициализируем компоненты
        this.components = {
            header: new Header('app-header'),
            footer: new Footer('app-footer'),
            templates: new Templates('templates-grid', this.stateManager),
            styleEditor: new StyleEditor('style-editor-container', this.stateManager)
        };

        // Настраиваем все системы
        this.setupTabs();
        this.setupFileUpload();
        this.setupDataInput();
        this.setupPresentationControls();
        this.setupExport();
        this.setupZoomControls();

        // Подписываемся на изменения состояния
        this.stateManager.subscribe((state) => {
            console.log('📊 State updated:', state);
            this.updateUI(state);
        });

        // Восстанавливаем последнюю презентацию
        this.restoreLastPresentation();
    }

    loadSettings() {
        const settings = StorageManager.load(StorageManager.KEYS.SETTINGS, {});
        this.settings = settings;
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                // Убираем активные классы
                tabs.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Добавляем активный класс
                btn.classList.add('active');
                const tabId = btn.dataset.tab;
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
    }

    setupDataInput() {
        const applyBtn = document.getElementById('apply-data-btn');
        const titleInput = document.getElementById('presentation-title');
        const slidesInput = document.getElementById('slides-input');

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const title = titleInput?.value || 'Моя презентация';
                const slidesText = slidesInput?.value || '';
                
                if (!slidesText.trim()) {
                    this.showNotification('⚠️ Введите хотя бы один слайд!', 'error');
                    return;
                }

                const lines = slidesText.split('\n').filter(line => line.trim());
                const slides = lines.map((text, index) => ({
                    id: index + 1,
                    title: this.extractTitle(text, index),
                    content: text
                }));

                const data = { title, slides };
                
                this.stateManager.setState({
                    uploadedData: data,
                    isLoading: false,
                    error: null
                });

                const generateBtn = document.getElementById('generate-btn');
                if (generateBtn) {
                    generateBtn.style.display = 'block';
                }

                this.showNotification('✅ Данные применены!', 'success');
                StorageManager.save('uploaded_data', data);
            });
        }
    }

    setupFileUpload() {
        const uploadBtn = document.getElementById('upload-btn');
        const fileInput = document.getElementById('file-input');
        const uploadArea = document.getElementById('upload-area');

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                fileInput.click();
            });

            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleFileUpload(file);
                }
            });
        }

        // Drag and drop
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--primary-color)';
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = 'var(--border-color)';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border-color)';
                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleFileUpload(file);
                }
            });
        }
    }

    async handleFileUpload(file) {
        this.stateManager.setState({ isLoading: true, error: null });

        try {
            const content = await this.readFile(file);
            let data;
            
            if (file.name.endsWith('.json')) {
                data = JSON.parse(content);
            } else {
                data = this.parseTextContent(content);
            }

            this.stateManager.setState({
                uploadedData: data,
                isLoading: false,
                error: null
            });

            const generateBtn = document.getElementById('generate-btn');
            if (generateBtn) {
                generateBtn.style.display = 'block';
            }

            this.showNotification('✅ Файл успешно загружен!', 'success');
            StorageManager.save('uploaded_data', data);
        } catch (error) {
            this.stateManager.setState({
                isLoading: false,
                error: error.message
            });
            this.showNotification('❌ Ошибка: ' + error.message, 'error');
        }
    }

    parseTextContent(content) {
        const lines = content.split('\n').filter(line => line.trim());
        const title = lines[0] || 'Моя презентация';
        const slides = lines.slice(1).filter(line => line.trim());
        
        return {
            title: title,
            slides: slides.map((text, index) => ({
                id: index + 1,
                title: this.extractTitle(text, index),
                content: text
            }))
        };
    }

    extractTitle(text, index) {
        const titleMatch = text.match(/^#+\s*(.+)/);
        if (titleMatch) return titleMatch[1];
        
        const words = text.split(' ');
        if (words.length > 10) {
            return words.slice(0, 8).join(' ') + '...';
        }
        return `Слайд ${index + 1}`;
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    }

    setupPresentationControls() {
        document.getElementById('prev-slide')?.addEventListener('click', () => {
            this.navigateSlide(-1);
        });

        document.getElementById('next-slide')?.addEventListener('click', () => {
            this.navigateSlide(1);
        });

        document.getElementById('back-to-main')?.addEventListener('click', () => {
            this.hidePresentation();
        });

        document.addEventListener('keydown', (e) => {
            const presentationMode = document.getElementById('presentation-mode');
            if (presentationMode.style.display === 'none') return;
            
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                this.navigateSlide(-1);
                e.preventDefault();
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
                this.navigateSlide(1);
                e.preventDefault();
            } else if (e.key === 'Escape') {
                this.hidePresentation();
            } else if (e.key === 'f' || e.key === 'F') {
                this.toggleFullscreen();
                e.preventDefault();
            }
        });

        document.getElementById('generate-btn')?.addEventListener('click', () => {
            this.generatePresentation();
        });
    }

    setupZoomControls() {
        const zoomIn = document.getElementById('zoom-in');
        const zoomOut = document.getElementById('zoom-out');

        zoomIn?.addEventListener('click', () => {
            this.zoomLevel = Math.min(2, this.zoomLevel + 0.1);
            this.updateZoom();
        });

        zoomOut?.addEventListener('click', () => {
            this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.1);
            this.updateZoom();
        });
    }

    updateZoom() {
        const wrapper = document.getElementById('slides-wrapper');
        if (wrapper) {
            wrapper.style.transform = `scale(${this.zoomLevel})`;
        }
        document.getElementById('zoom-level').textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }

    toggleFullscreen() {
        const container = document.getElementById('presentation-mode');
        if (!document.fullscreenElement) {
            container?.requestFullscreen?.();
            this.isFullscreen = true;
        } else {
            document.exitFullscreen?.();
            this.isFullscreen = false;
        }
    }

    generatePresentation() {
        const state = this.stateManager.getState();
        
        if (!state.uploadedData) {
            this.showNotification('⚠️ Сначала загрузите файл или введите данные!', 'error');
            return;
        }

        if (!state.currentTemplate) {
            this.showNotification('⚠️ Выберите шаблон!', 'error');
            return;
        }

        try {
            // Парсим данные с учетом шаблона
            const parsedData = TemplateParser.parse(
                state.uploadedData,
                state.currentTemplate.id
            );

            this.presentation = this.generator.generate(
                parsedData,
                state.currentTemplate
            );
            
            StorageManager.save(StorageManager.KEYS.LAST_PRESENTATION, {
                presentation: this.presentation,
                currentIndex: 0
            });

            this.currentSlideIndex = 0;
            this.zoomLevel = 1;
            this.showPresentation();
            this.showNotification('🎉 Презентация создана!', 'success');
        } catch (error) {
            this.showNotification('❌ Ошибка генерации: ' + error.message, 'error');
        }
    }

    showPresentation() {
        if (!this.presentation) return;

        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('presentation-mode').style.display = 'flex';
        document.body.style.overflow = 'hidden';

        this.renderSlides();
        this.updateSlide();
        this.updateProgress();
        this.updateZoom();
    }

    hidePresentation() {
        document.getElementById('presentation-mode').style.display = 'none';
        document.getElementById('main-screen').style.display = 'block';
        document.body.style.overflow = 'auto';
    }

    renderSlides() {
        const container = document.getElementById('slides-container');
        container.innerHTML = '';

        this.presentation.slides.forEach((slide, index) => {
            const slideElement = SlideRenderer.render(slide, index);
            container.appendChild(slideElement);
        });

        document.getElementById('total-slides').textContent = this.presentation.slides.length;
    }

    navigateSlide(direction) {
        const total = this.presentation.slides.length;
        this.currentSlideIndex = Math.max(0, Math.min(total - 1, this.currentSlideIndex + direction));
        
        this.updateSlide();
        this.updateProgress();
        
        StorageManager.save(StorageManager.KEYS.LAST_PRESENTATION, {
            presentation: this.presentation,
            currentIndex: this.currentSlideIndex
        });
    }

    updateSlide() {
        const container = document.getElementById('slides-container');
        const slideWidth = container.parentElement.clientWidth;
        container.style.transform = `translateX(-${this.currentSlideIndex * slideWidth}px)`;

        document.getElementById('current-slide-num').textContent = this.currentSlideIndex + 1;
    }

    updateProgress() {
        const container = document.getElementById('progress-indicators');
        container.innerHTML = '';

        this.presentation.slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `progress-dot ${index === this.currentSlideIndex ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                this.currentSlideIndex = index;
                this.updateSlide();
                this.updateProgress();
            });
            container.appendChild(dot);
        });
    }

    setupExport() {
        document.getElementById('export-btn')?.addEventListener('click', () => {
            this.exportPresentation();
        });
    }

    exportPresentation() {
        if (!this.presentation) {
            this.showNotification('⚠️ Нет презентации для экспорта!', 'error');
            return;
        }

        try {
            const html = ExportHelper.exportToHTML(this.presentation);
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.presentation.title || 'presentation'}.html`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showNotification('💾 Презентация сохранена!', 'success');
        } catch (error) {
            this.showNotification('❌ Ошибка экспорта: ' + error.message, 'error');
        }
    }

    updateUI(state) {
        if (state.uploadedData && state.currentTemplate) {
            const generateBtn = document.getElementById('generate-btn');
            if (generateBtn) {
                generateBtn.style.display = 'block';
                generateBtn.textContent = '🚀 Сгенерировать презентацию';
            }
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

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    window.app = app;
});