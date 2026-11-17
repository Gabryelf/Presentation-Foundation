import { BannerTemplates } from '../utils/BannerTemplates.js';
import { BannerExporter } from '../utils/BannerExporter.js';

export class BannerBuilder {
    constructor() {
        this.layouts = BannerTemplates.getLayouts();
        this.backgrounds = BannerTemplates.getBackgrounds();
        this.accentColors = BannerTemplates.getAccentColors();
        this.fonts = BannerTemplates.getFonts();
        this.decor = BannerTemplates.getDecor();

        this.state = {
            layout: this.layouts[0],
            background: this.backgrounds[0],
            accent: this.accentColors[0],
            font: 'inter',
            decor: 'none',
            format: '16:9',
            blocks: this.cloneBlocks(this.layouts[0])
        };

        this.container = null;
        this.canvas = null;
    }

    mount(containerEl) {
        this.container = containerEl;
        this.canvas = this.container.querySelector('#banner-canvas');
        this.renderPanel();
        this.renderCanvas();
        this.bindEvents();
    }

    cloneBlocks(layout) {
        return layout.blocks.map(b => ({
            id: b.id,
            title: b.title || '',
            text: b.text || ''
        }));
    }

    // ---------- ПАНЕЛЬ ----------
    renderPanel() {
        // Сетки
        const layoutsEl = this.container.querySelector('#banner-layouts');
        layoutsEl.innerHTML = this.layouts.map(l => `
            <button class="banner-layout-btn ${this.state.layout.id === l.id ? 'active' : ''}" data-id="${l.id}" title="${l.name}">
                <div class="banner-layout-mini" style="grid-template-columns:${l.grid.columns};grid-template-rows:${l.grid.rows};grid-template-areas:${l.areas.map(r => `"${r.join(' ')}"`).join(' ')};">
                    ${l.blocks.map(b => `<span style="grid-area:${b.id};"></span>`).join('')}
                </div>
            </button>
        `).join('');

        // Фоны
        const bgEl = this.container.querySelector('#banner-bg-picker');
        bgEl.innerHTML = this.backgrounds.map(bg => `
            <div class="banner-bg-swatch ${this.state.background.id === bg.id ? 'active' : ''}"
                 data-id="${bg.id}" title="${bg.name}"
                 style="background:${bg.css};${bg.dark === false ? 'border:2px solid #ddd;' : ''}"></div>
        `).join('');

        // Акцент
        const colorEl = this.container.querySelector('#banner-color-picker');
        colorEl.innerHTML = this.accentColors.map(c => `
            <div class="banner-color-swatch ${this.state.accent === c ? 'active' : ''}"
                 data-color="${c}" style="background:${c};${c === '#FFFFFF' ? 'border:2px solid #ddd;' : ''}"></div>
        `).join('');

        // Декор
        const decorEl = this.container.querySelector('#banner-decor');
        decorEl.innerHTML = this.decor.map(d => `
            <button class="banner-decor-btn ${this.state.decor === d.id ? 'active' : ''}" data-id="${d.id}">
                ${d.name}
            </button>
        `).join('');
    }

    // ---------- КАНВАС ----------
    renderCanvas() {
        const c = this.canvas;
        const s = this.state;
        c.dataset.format = s.format;
        c.style.background = s.background.css;
        c.style.gridTemplateColumns = s.layout.grid.columns;
        c.style.gridTemplateRows = s.layout.grid.rows;
        c.style.gridTemplateAreas = s.layout.areas.map(r => `"${r.join(' ')}"`).join(' ');
        c.style.fontFamily = this.fonts[s.font];
        c.className = `banner-canvas decor-${s.decor}`;

        c.innerHTML = s.blocks.map(b => `
            <div class="banner-block" data-block-id="${b.id}" style="grid-area:${b.id};">
                ${b.title ? `<div class="banner-block-title">${this.escapeHTML(b.title)}</div>` : ''}
                ${b.text ? `<div class="banner-block-text">${this.escapeHTML(b.text).replace(/\n/g, '<br>')}</div>` : ''}
                ${!b.title && !b.text ? `<div class="banner-block-text" style="opacity:.4;">Кликните для ввода текста</div>` : ''}
            </div>
        `).join('');

        // Применяем акцентный цвет для заголовков
        c.querySelectorAll('.banner-block-title').forEach(el => {
            el.style.color = s.accent;
        });
    }

    // ---------- СОБЫТИЯ ----------
    bindEvents() {
        // Делегирование на весь контейнер
        this.container.addEventListener('click', (e) => {
            const layoutBtn = e.target.closest('.banner-layout-btn');
            if (layoutBtn) return this.setLayout(layoutBtn.dataset.id);

            const bgSwatch = e.target.closest('.banner-bg-swatch');
            if (bgSwatch) return this.setBackground(bgSwatch.dataset.id);

            const colorSwatch = e.target.closest('.banner-color-swatch');
            if (colorSwatch) return this.setAccent(colorSwatch.dataset.color);

            const decorBtn = e.target.closest('.banner-decor-btn');
            if (decorBtn) return this.setDecor(decorBtn.dataset.id);

            const block = e.target.closest('.banner-block');
            if (block && !e.target.closest('input, textarea')) {
                return this.startEdit(block);
            }
        });

        this.container.querySelector('#banner-format').addEventListener('change', (e) => {
            this.state.format = e.target.value;
            this.renderCanvas();
        });

        this.container.querySelector('#banner-font').addEventListener('change', (e) => {
            this.state.font = e.target.value;
            this.renderCanvas();
        });

        this.container.querySelector('#banner-apply').addEventListener('click', () => {
            this.renderCanvas();
            this.toast('✅ Баннер применён', 'success');
        });

        this.container.querySelector('#banner-export').addEventListener('click', () => {
            this.exportHTML();
        });
    }

    setLayout(id) {
        const layout = this.layouts.find(l => l.id === id);
        if (!layout) return;
        // Сохраняем тексты, если id блоков совпадают
        const oldMap = Object.fromEntries(this.state.blocks.map(b => [b.id, b]));
        this.state.layout = layout;
        this.state.blocks = layout.blocks.map(b => {
            if (oldMap[b.id]) return { ...oldMap[b.id] };
            return { id: b.id, title: b.title || '', text: b.text || '' };
        });
        this.renderPanel();
        this.renderCanvas();
    }

    setBackground(id) {
        const bg = this.backgrounds.find(b => b.id === id);
        if (!bg) return;
        this.state.background = bg;
        this.renderPanel();
        this.renderCanvas();
    }

    setAccent(color) {
        this.state.accent = color;
        this.renderPanel();
        this.renderCanvas();
    }

    setDecor(id) {
        this.state.decor = id;
        this.renderPanel();
        this.renderCanvas();
    }

    startEdit(blockEl) {
        const blockId = blockEl.dataset.blockId;
        const block = this.state.blocks.find(b => b.id === blockId);
        if (!block) return;

        // Если уже редактируется — игнорируем
        if (blockEl.classList.contains('editing')) return;
        blockEl.classList.add('editing');

        // Сохраняем оригинальный HTML
        const originalHTML = blockEl.innerHTML;
        blockEl.innerHTML = '';

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'banner-block-input';
        titleInput.value = block.title || '';
        titleInput.placeholder = 'Заголовок';

        const textInput = document.createElement('textarea');
        textInput.className = 'banner-block-textarea';
        textInput.value = block.text || '';
        textInput.placeholder = 'Текст';
        textInput.rows = 2;

        blockEl.appendChild(titleInput);
        blockEl.appendChild(textInput);
        titleInput.focus();

        const finish = (save) => {
            if (save) {
                block.title = titleInput.value;
                block.text = textInput.value;
            }
            blockEl.classList.remove('editing');
            this.renderCanvas();
        };

        titleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); textInput.focus(); }
            if (e.key === 'Escape') finish(false);
        });
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') finish(false);
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); finish(true); }
        });

        // Клик мимо — сохранить
        const outsideHandler = (ev) => {
            if (!blockEl.contains(ev.target)) {
                document.removeEventListener('mousedown', outsideHandler);
                finish(true);
            }
        };
        setTimeout(() => document.addEventListener('mousedown', outsideHandler), 0);
    }

    // ---------- ЭКСПОРТ ----------
    exportHTML() {
        try {
            const html = BannerExporter.exportToHTML(this.state);
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `banner-${Date.now()}.html`;
            a.click();
            URL.revokeObjectURL(url);
            this.toast('💾 Баннер сохранён!', 'success');
        } catch (err) {
            console.error(err);
            this.toast('❌ Ошибка экспорта: ' + err.message, 'error');
        }
    }

    // ---------- УТИЛИТЫ ----------
    escapeHTML(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    toast(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        const n = document.createElement('div');
        n.className = `notification ${type}`;
        n.textContent = message;
        document.body.appendChild(n);
        setTimeout(() => {
            n.classList.add('fade-out');
            setTimeout(() => n.remove(), 500);
        }, 2600);
    }
}