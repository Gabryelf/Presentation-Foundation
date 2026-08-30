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
        this.uploadedImages = [];
        this.fileData = null;
        
        this.loadSettings();
        this.init();
    }

    init() {
        console.log('🚀 Presentation-Foundation v3.1.0');
        
        this.components = {
            header: new Header('app-header'),
            footer: new Footer('app-footer'),
            templates: new Templates('templates-grid', this.stateManager)
        };

        setTimeout(() => {
            const styleContainer = document.getElementById('style-editor-container');
            if (styleContainer) {
                this.components.styleEditor = new StyleEditor('style-editor-container', this.stateManager);
            }
        }, 100);

        this.setupTabs();
        this.setupFileUpload();
        this.setupDataInput();
        this.setupPresentationControls();
        this.setupExport();
        this.setupZoomControls();
        this.setupImageUpload();
        this.setupFullscreen();

        this.stateManager.subscribe((state) => {
            console.log('📊 State updated:', state);
            this.updateUI(state);
        });

        this.restoreLastPresentation();
        this.checkSavedData();
    }

    loadSettings() {
        const settings = StorageManager.load(StorageManager.KEYS.SETTINGS, {});
        this.settings = settings;
    }

    checkSavedData() {
        const savedData = StorageManager.load('uploaded_data');
        if (savedData && savedData.slides) {
            this.fileData = savedData;
            this.stateManager.setState({
                uploadedData: savedData,
                isLoading: false
            });
            const generateBtn = document.getElementById('generate-btn');
            if (generateBtn) {
                generateBtn.classList.add('visible');
            }
            // Показываем информацию о файле
            this.showFileInfoFromData(savedData);
        }
    }

    showFileInfoFromData(data) {
        const infoContainer = document.getElementById('upload-file-info');
        if (infoContainer && data) {
            infoContainer.classList.add('active');
            const nameSpan = infoContainer.querySelector('.file-name');
            const sizeSpan = infoContainer.querySelector('.file-size');
            if (nameSpan) nameSpan.textContent = '📄 ' + (data.filename || 'Данные');
            if (sizeSpan) sizeSpan.textContent = `${data.slides ? data.slides.length : 0} слайдов`;
            
            const removeBtn = infoContainer.querySelector('.file-remove');
            if (removeBtn) {
                removeBtn.onclick = () => {
                    infoContainer.classList.remove('active');
                    this.fileData = null;
                    this.stateManager.setState({ uploadedData: null });
                    const generateBtn = document.getElementById('generate-btn');
                    if (generateBtn) generateBtn.classList.remove('visible');
                    StorageManager.remove('uploaded_data');
                };
            }
        }
    }

    restoreLastPresentation() {
        try {
            const last = StorageManager.load(StorageManager.KEYS.LAST_PRESENTATION);
            if (last && last.presentation && last.presentation.slides) {
                this.presentation = last.presentation;
                this.currentSlideIndex = last.currentIndex || 0;
                this.showPresentation();
            }
        } catch (error) {
            console.warn('Could not restore last presentation:', error);
        }
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.content-tab');
        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                tabs.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.content-panel').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const tabId = btn.dataset.tab;
                const targetPanel = document.getElementById(`panel-${tabId}`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
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

                const data = { title, slides, filename: 'Ручной ввод' };
                this.fileData = data;
                this.stateManager.setState({
                    uploadedData: data,
                    isLoading: false,
                    error: null
                });

                const generateBtn = document.getElementById('generate-btn');
                if (generateBtn) {
                    generateBtn.classList.add('visible');
                }

                this.showFileInfoFromData(data);
                this.showNotification('✅ Данные применены!', 'success');
                StorageManager.save('uploaded_data', data);
            });
        }
    }

    setupFileUpload() {
        const uploadBtn = document.getElementById('file-input');
        const uploadArea = document.getElementById('upload-area');

        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                uploadBtn?.click();
            });

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleFileUpload(file);
                }
            });
        }

        if (uploadBtn) {
            uploadBtn.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleFileUpload(file);
                }
                uploadBtn.value = '';
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
                data.filename = file.name;
            } else {
                data = this.parseFileByFormat(content, file.name);
                data.filename = file.name;
            }

            // Убеждаемся, что данные имеют правильную структуру
            if (!data.slides || !Array.isArray(data.slides) || data.slides.length === 0) {
                // Если слайдов нет, создаем из контента
                const lines = content.split('\n').filter(l => l.trim());
                data.slides = lines.map((text, index) => ({
                    id: index + 1,
                    title: this.extractTitle(text, index),
                    content: text
                }));
                data.title = data.title || lines[0] || 'Презентация';
            }

            // Нормализуем слайды
            data.slides = data.slides.map((slide, index) => {
                if (typeof slide === 'string') {
                    return {
                        id: index + 1,
                        title: this.extractTitle(slide, index),
                        content: slide
                    };
                }
                return {
                    id: index + 1,
                    title: slide.title || `Слайд ${index + 1}`,
                    content: slide.content || slide.text || ''
                };
            });

            this.fileData = data;
            this.stateManager.setState({
                uploadedData: data,
                isLoading: false,
                error: null
            });

            const generateBtn = document.getElementById('generate-btn');
            if (generateBtn) {
                generateBtn.classList.add('visible');
            }

            this.showFileInfoFromData(data);
            this.showNotification(`✅ Файл "${file.name}" загружен! (${data.slides.length} слайдов)`, 'success');
            StorageManager.save('uploaded_data', data);
        } catch (error) {
            console.error('File upload error:', error);
            this.stateManager.setState({
                isLoading: false,
                error: error.message
            });
            this.showNotification('❌ Ошибка: ' + error.message, 'error');
        }
    }

    parseFileByFormat(content, fileName) {
        // Пробуем распарсить в зависимости от формата
        if (fileName.toLowerCase().includes('training') || fileName.toLowerCase().includes('data')) {
            return this.parseTrainingFormat(content);
        }
        if (fileName.endsWith('.md')) {
            return this.parseMarkdown(content);
        }
        return this.parseTextContent(content);
    }

    parseTrainingFormat(content) {
        const lines = content.split('\n').filter(line => line.trim());
        let title = 'Тренинговая презентация';
        let slides = [];
        let currentSlide = null;
        let isList = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            if (i === 0 && !line.startsWith('#') && !line.startsWith('-')) {
                title = line;
                continue;
            }

            if (line.startsWith('## ') || line.startsWith('### ') || line.startsWith('# ')) {
                if (currentSlide) {
                    slides.push(currentSlide);
                }
                currentSlide = {
                    title: line.replace(/^#+\s*/, ''),
                    content: '',
                    type: 'text'
                };
                isList = false;
                continue;
            }

            if (line.startsWith('- ') || line.startsWith('* ')) {
                if (!currentSlide) {
                    currentSlide = {
                        title: `Слайд ${slides.length + 1}`,
                        content: '',
                        type: 'list'
                    };
                }
                if (!isList) {
                    isList = true;
                    currentSlide.type = 'list';
                }
                currentSlide.content += '\n- ' + line.replace(/^[-*]\s*/, '');
                continue;
            }

            if (currentSlide) {
                if (currentSlide.content) {
                    currentSlide.content += '\n' + line;
                } else {
                    currentSlide.content = line;
                }
            }
        }

        if (currentSlide) {
            slides.push(currentSlide);
        }

        if (slides.length === 0) {
            slides = lines.slice(1).filter(l => l.trim()).map((text, index) => ({
                id: index + 1,
                title: `Слайд ${index + 1}`,
                content: text,
                type: 'text'
            }));
        }

        return { title, slides };
    }

    parseMarkdown(content) {
        const lines = content.split('\n');
        let title = 'Markdown Презентация';
        let slides = [];
        let currentSlide = null;
        let isCodeBlock = false;
        let codeContent = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.trim().startsWith('```')) {
                if (isCodeBlock) {
                    if (currentSlide) {
                        currentSlide.content = codeContent.trim();
                        currentSlide.type = 'code';
                    }
                    isCodeBlock = false;
                    codeContent = '';
                    continue;
                } else {
                    isCodeBlock = true;
                    continue;
                }
            }

            if (isCodeBlock) {
                codeContent += line + '\n';
                continue;
            }

            if (line.startsWith('# ')) {
                title = line.replace('# ', '');
                continue;
            }

            if (line.startsWith('## ')) {
                if (currentSlide) {
                    slides.push(currentSlide);
                }
                currentSlide = {
                    title: line.replace('## ', ''),
                    content: '',
                    type: 'text'
                };
                continue;
            }

            if (line.trim() === '---' || line.trim() === '***') {
                if (currentSlide) {
                    slides.push(currentSlide);
                    currentSlide = null;
                }
                continue;
            }

            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                if (currentSlide) {
                    if (currentSlide.type !== 'list') {
                        currentSlide.type = 'list';
                        currentSlide.content = '';
                    }
                    currentSlide.content += '\n- ' + line.trim().replace(/^[-*]\s*/, '');
                }
                continue;
            }

            if (line.trim().match(/^\d+\.\s/)) {
                if (currentSlide) {
                    if (currentSlide.type !== 'numbered') {
                        currentSlide.type = 'numbered';
                        currentSlide.content = '';
                    }
                    currentSlide.content += '\n' + line.trim();
                }
                continue;
            }

            if (currentSlide && line.trim()) {
                if (currentSlide.content) {
                    currentSlide.content += '\n' + line.trim();
                } else {
                    currentSlide.content = line.trim();
                }
            }
        }

        if (currentSlide) {
            slides.push(currentSlide);
        }

        if (slides.length === 0) {
            slides = [{ 
                title: 'Слайд 1', 
                content: content.replace(/^# .*\n/, ''), 
                type: 'text' 
            }];
        }

        return { title, slides };
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
        if (!text) return `Слайд ${index + 1}`;
        const titleMatch = text.match(/^#+\s*(.+)/);
        if (titleMatch) return titleMatch[1];
        const words = text.split(' ');
        if (words.length > 10) {
            return words.slice(0, 8).join(' ') + '...';
        }
        return text.length > 50 ? text.substring(0, 50) + '...' : text || `Слайд ${index + 1}`;
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    }

    showFileInfoFromData(data) {
        const infoContainer = document.getElementById('upload-file-info');
        if (infoContainer && data) {
            infoContainer.classList.add('active');
            const nameSpan = infoContainer.querySelector('.file-name');
            const sizeSpan = infoContainer.querySelector('.file-size');
            if (nameSpan) nameSpan.textContent = '📄 ' + (data.filename || 'Данные');
            if (sizeSpan) sizeSpan.textContent = `${data.slides ? data.slides.length : 0} слайдов`;
            
            const removeBtn = infoContainer.querySelector('.file-remove');
            if (removeBtn) {
                removeBtn.onclick = () => {
                    infoContainer.classList.remove('active');
                    this.fileData = null;
                    this.stateManager.setState({ uploadedData: null });
                    const generateBtn = document.getElementById('generate-btn');
                    if (generateBtn) generateBtn.classList.remove('visible');
                    StorageManager.remove('uploaded_data');
                };
            }
        }
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
            if (!presentationMode || presentationMode.style.display === 'none') return;

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

    setupFullscreen() {
        document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    generatePresentation() {
        const state = this.stateManager.getState();
        
        if (!state.uploadedData || !state.uploadedData.slides) {
            this.showNotification('⚠️ Сначала загрузите файл или введите данные!', 'error');
            return;
        }

        if (!state.currentTemplate) {
            this.showNotification('⚠️ Выберите шаблон!', 'error');
            return;
        }

        try {
            // Передаем данные в парсер
            const parsedData = TemplateParser.parse(
                state.uploadedData,
                state.currentTemplate.id
            );

            // Убеждаемся, что данные валидны
            if (!parsedData.slides || parsedData.slides.length === 0) {
                throw new Error('Нет слайдов для генерации');
            }

            this.presentation = this.generator.generate(
                parsedData,
                state.currentTemplate
            );

            // Добавляем изображения к слайдам
            if (this.uploadedImages.length > 0) {
                this.uploadedImages.forEach((img, index) => {
                    if (this.presentation.slides[index]) {
                        this.presentation.slides[index].image = img;
                    }
                });
            }

            // Применяем стили
            if (state.styleSettings) {
                this.presentation.slides.forEach(slide => {
                    slide.style = {
                        ...slide.style,
                        ...state.styleSettings
                    };
                });
            }

            StorageManager.save(StorageManager.KEYS.LAST_PRESENTATION, {
                presentation: this.presentation,
                currentIndex: 0
            });

            this.currentSlideIndex = 0;
            this.zoomLevel = 1;
            this.showPresentation();
            this.showNotification('🎉 Презентация создана!', 'success');
        } catch (error) {
            console.error('Generation error:', error);
            this.showNotification('❌ Ошибка генерации: ' + error.message, 'error');
        }
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
        const zoomLevel = document.getElementById('zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
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

    showPresentation() {
        if (!this.presentation || !this.presentation.slides) {
            console.warn('No presentation to show');
            return;
        }

        const mainScreen = document.getElementById('main-screen');
        const presentationMode = document.getElementById('presentation-mode');
        
        if (mainScreen) mainScreen.style.display = 'none';
        if (presentationMode) {
            presentationMode.style.display = 'flex';
        }

        document.body.style.overflow = 'hidden';
        this.renderSlides();
        this.updateSlide();
        this.updateProgress();
        this.updateZoom();
    }

    hidePresentation() {
        const mainScreen = document.getElementById('main-screen');
        const presentationMode = document.getElementById('presentation-mode');
        
        if (presentationMode) presentationMode.style.display = 'none';
        if (mainScreen) mainScreen.style.display = 'block';
        document.body.style.overflow = 'auto';
    }

    renderSlides() {
        const container = document.getElementById('slides-container');
        if (!container) return;

        container.innerHTML = '';
        const state = this.stateManager.getState();
        const animation = state.styleSettings?.slideAnimation || 'fade';

        this.presentation.slides.forEach((slide, index) => {
            const slideElement = SlideRenderer.render(slide, index, animation);
            container.appendChild(slideElement);
        });

        const totalSlides = document.getElementById('total-slides');
        if (totalSlides) {
            totalSlides.textContent = this.presentation.slides.length;
        }
    }

    navigateSlide(direction) {
        if (!this.presentation || !this.presentation.slides) return;
        
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
        if (!container) return;

        const slideWidth = container.parentElement?.clientWidth || container.clientWidth;
        container.style.transform = `translateX(-${this.currentSlideIndex * slideWidth}px)`;

        const currentNum = document.getElementById('current-slide-num');
        if (currentNum) {
            currentNum.textContent = this.currentSlideIndex + 1;
        }
    }

    updateProgress() {
        const container = document.getElementById('progress-indicators');
        if (!container || !this.presentation || !this.presentation.slides) return;

        container.innerHTML = '';
        this.presentation.slides.forEach((_, index) => {
            const dot = document.createElement('button');
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
            console.error('Export error:', error);
            this.showNotification('❌ Ошибка экспорта: ' + error.message, 'error');
        }
    }

    setupImageUpload() {
        const uploadBtn = document.getElementById('image-upload-btn');
        const imageInput = document.getElementById('image-input');
        const imageGrid = document.getElementById('image-grid');

        if (uploadBtn && imageInput) {
            uploadBtn.addEventListener('click', () => {
                imageInput.click();
            });

            imageInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.addImageToGrid(event.target.result, file.name, imageGrid);
                    };
                    reader.readAsDataURL(file);
                });
                this.showNotification(`✅ Загружено ${files.length} изображений`, 'success');
                imageInput.value = '';
            });
        }
    }

    addImageToGrid(imageData, fileName, grid) {
        if (!grid) return;

        const item = document.createElement('div');
        item.className = 'image-item';

        const img = document.createElement('img');
        img.src = imageData;
        img.alt = fileName;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'image-remove';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = this.uploadedImages.indexOf(imageData);
            if (index > -1) {
                this.uploadedImages.splice(index, 1);
            }
            item.remove();
        });

        item.appendChild(img);
        item.appendChild(removeBtn);
        
        this.uploadedImages.push(imageData);
        
        const match = fileName.match(/^(\d+)/);
        if (match) {
            const slideIndex = parseInt(match[1]) - 1;
            item.dataset.slideIndex = slideIndex;
            item.title = `Кликните чтобы привязать к слайду ${slideIndex + 1}`;
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                if (this.presentation && this.presentation.slides[slideIndex]) {
                    this.presentation.slides[slideIndex].image = imageData;
                    this.showNotification(`🖼️ Изображение добавлено к слайду ${slideIndex + 1}`, 'info');
                    if (document.getElementById('presentation-mode').style.display !== 'none') {
                        this.renderSlides();
                        this.updateSlide();
                    }
                }
            });
        }

        grid.appendChild(item);
    }

    updateUI(state) {
        if (state.uploadedData && state.uploadedData.slides && state.currentTemplate) {
            const generateBtn = document.getElementById('generate-btn');
            if (generateBtn) {
                generateBtn.classList.add('visible');
            }
        }
    }

    showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

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