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
import { BannerBuilder } from '../ui/BannerBuilder.js';

class App {
    constructor() {
        if (App.instance) return App.instance;
        App.instance = this;

        this.stateManager = new StateManager();
        this.generator = new PresentationGenerator(this.stateManager);
        this.currentSlideIndex = 0;
        this.presentation = null;
        this.zoomLevel = 1;
        this.isFullscreen = false;
        this.uploadedImages = [];
        this.fileData = null;
        this.bannerBuilder = null;
        this.currentMode = 'select';

        this.loadSettings();
        this.init();
    }

    init() {
        console.log('🚀 Presentation-Foundation v3.1.0');

        // Сразу скрываем все экраны, кроме выбора режима
        this.switchMode('select');

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

        this.setupModeSwitching();
        this.setupTabs();
        this.setupFileUpload();
        this.setupDataInput();
        this.setupPresentationControls();
        this.setupExport();
        this.setupZoomControls();
        this.setupImageUpload();
        this.setupFullscreen();

        this.stateManager.subscribe((state) => this.updateUI(state));

        this.restoreLastPresentation();
        this.checkSavedData();
    }

    // =====================================================
    // ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ
    // =====================================================
    setupModeSwitching() {
        // Кнопки выбора режима
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => this.switchMode(card.dataset.mode));
        });

        // Кнопки «назад»
        document.getElementById('back-from-presentation')
            ?.addEventListener('click', () => this.switchMode('select'));

        document.getElementById('back-from-banner')
            ?.addEventListener('click', () => this.switchMode('select'));
    }

    switchMode(mode) {
        // Безопасно скрываем всё
        const screens = {
            select: document.getElementById('mode-select-screen'),
            presentation: document.getElementById('main-screen'),
            banner: document.getElementById('banner-screen'),
            play: document.getElementById('presentation-mode')
        };

        Object.values(screens).forEach(el => {
            if (el) el.style.display = 'none';
        });

        this.currentMode = mode;

        if (mode === 'select' && screens.select) {
            screens.select.style.display = 'flex';
            document.body.style.overflow = 'auto';
        } else if (mode === 'presentation' && screens.presentation) {
            screens.presentation.style.display = 'block';
            document.body.style.overflow = 'auto';
        } else if (mode === 'banner' && screens.banner) {
            screens.banner.style.display = 'block';
            document.body.style.overflow = 'auto';
            this.initBannerBuilder();
        }
    }

    initBannerBuilder() {
        if (this.bannerBuilder) return;
        const screen = document.getElementById('banner-screen');
        if (!screen) return;
        this.bannerBuilder = new BannerBuilder();
        this.bannerBuilder.mount(screen);
    }

    // =====================================================
    // ПРЕЗЕНТАЦИЯ
    // =====================================================
    loadSettings() {
        this.settings = StorageManager.load(StorageManager.KEYS.SETTINGS, {});
    }

    checkSavedData() {
        const savedData = StorageManager.load('uploaded_data');
        if (savedData && savedData.slides) {
            this.fileData = savedData;
            this.stateManager.setState({ uploadedData: savedData, isLoading: false });
            document.getElementById('generate-btn')?.classList.add('visible');
            this.showFileInfoFromData(savedData);
        }
    }

    showFileInfoFromData(data) {
        const infoContainer = document.getElementById('upload-file-info');
        if (!infoContainer || !data) return;
        infoContainer.classList.add('active');
        const nameSpan = infoContainer.querySelector('.file-name');
        const sizeSpan = infoContainer.querySelector('.file-size');
        if (nameSpan) nameSpan.textContent = '📄 ' + (data.filename || 'Данные');
        if (sizeSpan) sizeSpan.textContent = `${data.slides?.length || 0} слайдов`;
        const removeBtn = infoContainer.querySelector('.file-remove');
        if (removeBtn) {
            removeBtn.onclick = () => {
                infoContainer.classList.remove('active');
                this.fileData = null;
                this.stateManager.setState({ uploadedData: null });
                document.getElementById('generate-btn')?.classList.remove('visible');
                StorageManager.remove('uploaded_data');
            };
        }
    }

    restoreLastPresentation() {
        try {
            const last = StorageManager.load(StorageManager.KEYS.LAST_PRESENTATION);
            if (last?.presentation?.slides) {
                this.presentation = last.presentation;
                this.currentSlideIndex = last.currentIndex || 0;
            }
        } catch (e) {
            console.warn('restoreLastPresentation:', e);
        }
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.content-tab');
        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                tabs.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.content-panel').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`panel-${btn.dataset.tab}`)?.classList.add('active');
            });
        });
    }

    setupDataInput() {
        const applyBtn = document.getElementById('apply-data-btn');
        const titleInput = document.getElementById('presentation-title');
        const slidesInput = document.getElementById('slides-input');
        if (!applyBtn) return;
        applyBtn.addEventListener('click', () => {
            const title = titleInput?.value || 'Моя презентация';
            const slidesText = slidesInput?.value || '';
            if (!slidesText.trim()) {
                this.showNotification('⚠️ Введите хотя бы один слайд!', 'error');
                return;
            }
            const lines = slidesText.split('\n').filter(l => l.trim());
            const slides = lines.map((text, i) => ({
                id: i + 1,
                title: this.extractTitle(text, i),
                content: text
            }));
            const data = { title, slides, filename: 'Ручной ввод' };
            this.fileData = data;
            this.stateManager.setState({ uploadedData: data, isLoading: false, error: null });
            document.getElementById('generate-btn')?.classList.add('visible');
            this.showFileInfoFromData(data);
            this.showNotification('✅ Данные применены!', 'success');
            StorageManager.save('uploaded_data', data);
        });
    }

    setupFileUpload() {
        const uploadBtn = document.getElementById('file-input');
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
            uploadArea.addEventListener('click', () => uploadBtn?.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file) this.handleFileUpload(file);
            });
        }
        if (uploadBtn) {
            uploadBtn.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.handleFileUpload(file);
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
            if (!data.slides || !Array.isArray(data.slides) || !data.slides.length) {
                const lines = content.split('\n').filter(l => l.trim());
                data.slides = lines.map((text, i) => ({
                    id: i + 1,
                    title: this.extractTitle(text, i),
                    content: text
                }));
                data.title = data.title || lines[0] || 'Презентация';
            }
            data.slides = data.slides.map((slide, i) => {
                if (typeof slide === 'string') {
                    return { id: i + 1, title: this.extractTitle(slide, i), content: slide };
                }
                return {
                    id: i + 1,
                    title: slide.title || `Слайд ${i + 1}`,
                    content: slide.content || slide.text || ''
                };
            });
            this.fileData = data;
            this.stateManager.setState({ uploadedData: data, isLoading: false, error: null });
            document.getElementById('generate-btn')?.classList.add('visible');
            this.showFileInfoFromData(data);
            this.showNotification(`✅ Файл "${file.name}" загружен! (${data.slides.length} слайдов)`, 'success');
            StorageManager.save('uploaded_data', data);
        } catch (error) {
            console.error(error);
            this.stateManager.setState({ isLoading: false, error: error.message });
            this.showNotification('❌ Ошибка: ' + error.message, 'error');
        }
    }

    parseFileByFormat(content, fileName) {
        if (fileName.toLowerCase().includes('training') || fileName.toLowerCase().includes('data')) {
            return this.parseTrainingFormat(content);
        }
        if (fileName.endsWith('.md')) return this.parseMarkdown(content);
        return this.parseTextContent(content);
    }

    parseTrainingFormat(content) {
        const lines = content.split('\n').filter(l => l.trim());
        let title = 'Тренинговая презентация';
        const slides = [];
        let current = null;
        let isList = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            if (i === 0 && !line.startsWith('#') && !line.startsWith('-')) {
                title = line;
                continue;
            }
            if (/^#{1,3}\s/.test(line)) {
                if (current) slides.push(current);
                current = { title: line.replace(/^#+\s*/, ''), content: '', type: 'text' };
                isList = false;
                continue;
            }
            if (/^[-*]\s/.test(line)) {
                if (!current) current = { title: `Слайд ${slides.length + 1}`, content: '', type: 'list' };
                if (!isList) { isList = true; current.type = 'list'; }
                current.content += '\n- ' + line.replace(/^[-*]\s*/, '');
                continue;
            }
            if (current) current.content = current.content ? current.content + '\n' + line : line;
        }
        if (current) slides.push(current);
        if (!slides.length) {
            slides.push(...lines.slice(1).map((text, i) => ({
                id: i + 1, title: `Слайд ${i + 1}`, content: text, type: 'text'
            })));
        }
        return { title, slides };
    }

    parseMarkdown(content) {
        const lines = content.split('\n');
        let title = 'Markdown Презентация';
        const slides = [];
        let current = null;
        let isCode = false;
        let code = '';
        for (const line of lines) {
            if (line.trim().startsWith('```')) {
                if (isCode) {
                    if (current) { current.content = code.trim(); current.type = 'code'; }
                    isCode = false; code = '';
                    continue;
                }
                isCode = true; continue;
            }
            if (isCode) { code += line + '\n'; continue; }
            if (line.startsWith('# ')) { title = line.slice(2); continue; }
            if (line.startsWith('## ')) {
                if (current) slides.push(current);
                current = { title: line.slice(3), content: '', type: 'text' };
                continue;
            }
            if (line.trim() === '---' || line.trim() === '***') {
                if (current) { slides.push(current); current = null; }
                continue;
            }
            if (/^[-*]\s/.test(line.trim())) {
                if (current) {
                    if (current.type !== 'list') { current.type = 'list'; current.content = ''; }
                    current.content += '\n- ' + line.trim().replace(/^[-*]\s*/, '');
                }
                continue;
            }
            if (/^\d+\.\s/.test(line.trim())) {
                if (current) {
                    if (current.type !== 'numbered') { current.type = 'numbered'; current.content = ''; }
                    current.content += '\n' + line.trim();
                }
                continue;
            }
            if (current && line.trim()) {
                current.content = current.content ? current.content + '\n' + line.trim() : line.trim();
            }
        }
        if (current) slides.push(current);
        if (!slides.length) {
            slides.push({ title: 'Слайд 1', content: content.replace(/^# .*\n/, ''), type: 'text' });
        }
        return { title, slides };
    }

    parseTextContent(content) {
        const lines = content.split('\n').filter(l => l.trim());
        return {
            title: lines[0] || 'Моя презентация',
            slides: lines.slice(1).filter(l => l.trim()).map((text, i) => ({
                id: i + 1, title: this.extractTitle(text, i), content: text
            }))
        };
    }

    extractTitle(text, index) {
        if (!text) return `Слайд ${index + 1}`;
        const m = text.match(/^#+\s*(.+)/);
        if (m) return m[1];
        const words = text.split(' ');
        if (words.length > 10) return words.slice(0, 8).join(' ') + '...';
        return text.length > 50 ? text.slice(0, 50) + '...' : text || `Слайд ${index + 1}`;
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = (e) => resolve(e.target.result);
            r.onerror = () => reject(new Error('Ошибка чтения файла'));
            r.readAsText(file);
        });
    }

    setupPresentationControls() {
        document.getElementById('prev-slide')?.addEventListener('click', () => this.navigateSlide(-1));
        document.getElementById('next-slide')?.addEventListener('click', () => this.navigateSlide(1));
        document.getElementById('back-to-main')?.addEventListener('click', () => this.hidePresentation());

        document.addEventListener('keydown', (e) => {
            const pm = document.getElementById('presentation-mode');
            if (!pm || pm.style.display === 'none') return;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { this.navigateSlide(-1); e.preventDefault(); }
            else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { this.navigateSlide(1); e.preventDefault(); }
            else if (e.key === 'Escape') this.hidePresentation();
            else if (e.key === 'f' || e.key === 'F') { this.toggleFullscreen(); e.preventDefault(); }
        });

        document.getElementById('generate-btn')?.addEventListener('click', () => this.generatePresentation());
    }

    setupFullscreen() {
        document.getElementById('fullscreen-btn')?.addEventListener('click', () => this.toggleFullscreen());
    }

    generatePresentation() {
        const state = this.stateManager.getState();
        if (!state.uploadedData?.slides) {
            this.showNotification('⚠️ Сначала загрузите файл или введите данные!', 'error');
            return;
        }
        if (!state.currentTemplate) {
            this.showNotification('⚠️ Выберите шаблон!', 'error');
            return;
        }
        try {
            const parsed = TemplateParser.parse(state.uploadedData, state.currentTemplate.id);
            if (!parsed.slides?.length) throw new Error('Нет слайдов для генерации');

            this.presentation = this.generator.generate(parsed, state.currentTemplate);

            if (this.uploadedImages.length) {
                this.uploadedImages.forEach((img, i) => {
                    if (this.presentation.slides[i]) this.presentation.slides[i].image = img;
                });
            }
            if (state.styleSettings) {
                this.presentation.slides.forEach(s => {
                    s.style = { ...s.style, ...state.styleSettings };
                });
            }
            StorageManager.save(StorageManager.KEYS.LAST_PRESENTATION, {
                presentation: this.presentation, currentIndex: 0
            });
            this.currentSlideIndex = 0;
            this.zoomLevel = 1;
            this.showPresentation();
            this.showNotification('🎉 Презентация создана!', 'success');
        } catch (e) {
            console.error(e);
            this.showNotification('❌ Ошибка генерации: ' + e.message, 'error');
        }
    }

    setupZoomControls() {
        document.getElementById('zoom-in')?.addEventListener('click', () => {
            this.zoomLevel = Math.min(2, this.zoomLevel + 0.1);
            this.updateZoom();
        });
        document.getElementById('zoom-out')?.addEventListener('click', () => {
            this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.1);
            this.updateZoom();
        });
    }

    updateZoom() {
        const w = document.getElementById('slides-wrapper');
        if (w) w.style.transform = `scale(${this.zoomLevel})`;
        const z = document.getElementById('zoom-level');
        if (z) z.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }

    toggleFullscreen() {
        const c = document.getElementById('presentation-mode');
        if (!document.fullscreenElement) { c?.requestFullscreen?.(); this.isFullscreen = true; }
        else { document.exitFullscreen?.(); this.isFullscreen = false; }
    }

    showPresentation() {
        if (!this.presentation?.slides) return;
        this.switchMode('play');
        const pm = document.getElementById('presentation-mode');
        if (pm) pm.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.renderSlides();
        this.updateSlide();
        this.updateProgress();
        this.updateZoom();
    }

    hidePresentation() {
        const pm = document.getElementById('presentation-mode');
        if (pm) pm.style.display = 'none';
        this.switchMode('presentation');
    }

    renderSlides() {
        const c = document.getElementById('slides-container');
        if (!c) return;
        c.innerHTML = '';
        const state = this.stateManager.getState();
        const anim = state.styleSettings?.slideAnimation || 'fade';
        this.presentation.slides.forEach((slide, i) => {
            c.appendChild(SlideRenderer.render(slide, i, anim));
        });
        const total = document.getElementById('total-slides');
        if (total) total.textContent = this.presentation.slides.length;
    }

    navigateSlide(d) {
        if (!this.presentation?.slides) return;
        const total = this.presentation.slides.length;
        this.currentSlideIndex = Math.max(0, Math.min(total - 1, this.currentSlideIndex + d));
        this.updateSlide();
        this.updateProgress();
        StorageManager.save(StorageManager.KEYS.LAST_PRESENTATION, {
            presentation: this.presentation, currentIndex: this.currentSlideIndex
        });
    }

    updateSlide() {
        const c = document.getElementById('slides-container');
        if (!c) return;
        const w = c.parentElement?.clientWidth || c.clientWidth;
        c.style.transform = `translateX(-${this.currentSlideIndex * w}px)`;
        const n = document.getElementById('current-slide-num');
        if (n) n.textContent = this.currentSlideIndex + 1;
    }

    updateProgress() {
        const c = document.getElementById('progress-indicators');
        if (!c || !this.presentation?.slides) return;
        c.innerHTML = '';
        this.presentation.slides.forEach((_, i) => {
            const d = document.createElement('button');
            d.className = `progress-dot ${i === this.currentSlideIndex ? 'active' : ''}`;
            d.addEventListener('click', () => {
                this.currentSlideIndex = i;
                this.updateSlide();
                this.updateProgress();
            });
            c.appendChild(d);
        });
    }

    setupExport() {
        document.getElementById('export-btn')?.addEventListener('click', () => this.exportPresentation());
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
        } catch (e) {
            console.error(e);
            this.showNotification('❌ Ошибка экспорта: ' + e.message, 'error');
        }
    }

    setupImageUpload() {
        const btn = document.getElementById('image-upload-btn');
        const input = document.getElementById('image-input');
        const grid = document.getElementById('image-grid');
        if (btn && input) {
            btn.addEventListener('click', () => input.click());
            input.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                files.forEach(f => {
                    const r = new FileReader();
                    r.onload = (ev) => this.addImageToGrid(ev.target.result, f.name, grid);
                    r.readAsDataURL(f);
                });
                this.showNotification(`✅ Загружено ${files.length} изображений`, 'success');
                input.value = '';
            });
        }
    }

    addImageToGrid(data, name, grid) {
        if (!grid) return;
        const item = document.createElement('div');
        item.className = 'image-item';
        const img = document.createElement('img');
        img.src = data; img.alt = name;
        const rm = document.createElement('button');
        rm.className = 'image-remove';
        rm.textContent = '×';
        rm.addEventListener('click', (e) => {
            e.stopPropagation();
            const i = this.uploadedImages.indexOf(data);
            if (i > -1) this.uploadedImages.splice(i, 1);
            item.remove();
        });
        item.appendChild(img);
        item.appendChild(rm);
        this.uploadedImages.push(data);
        const m = name.match(/^(\d+)/);
        if (m) {
            const idx = parseInt(m[1]) - 1;
            item.title = `Клик → слайд ${idx + 1}`;
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                if (this.presentation?.slides[idx]) {
                    this.presentation.slides[idx].image = data;
                    this.showNotification(`🖼️ Изображение → слайд ${idx + 1}`, 'info');
                    if (document.getElementById('presentation-mode').style.display !== 'none') {
                        this.renderSlides(); this.updateSlide();
                    }
                }
            });
        }
        grid.appendChild(item);
    }

    updateUI(state) {
        if (state.uploadedData?.slides && state.currentTemplate) {
            document.getElementById('generate-btn')?.classList.add('visible');
        }
    }

    showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        const n = document.createElement('div');
        n.className = `notification ${type}`;
        n.textContent = message;
        document.body.appendChild(n);
        setTimeout(() => {
            n.classList.add('fade-out');
            setTimeout(() => n.remove(), 500);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});