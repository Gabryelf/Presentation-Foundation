/**
 * Шаблоны сеток баннера, фоны, цвета, декор.
 * Все блоки описаны в терминах grid-template-areas, чтобы
 * канвас адаптировался сам без скроллов.
 */
 export class BannerTemplates {
    static getLayouts() {
        return [
            {
                id: 'hero',
                name: 'Hero',
                grid: { columns: '1fr', rows: '1fr' },
                areas: [['a']],
                blocks: [{ id: 'a', title: 'Заголовок', text: 'Краткое описание' }]
            },
            {
                id: 'hero-sub',
                name: 'Hero + sub',
                grid: { columns: '1fr', rows: '2fr 1fr' },
                areas: [['a'], ['b']],
                blocks: [
                    { id: 'a', title: 'Большой заголовок', text: '' },
                    { id: 'b', title: '', text: 'Подзаголовок или короткое описание' }
                ]
            },
            {
                id: 'split',
                name: 'Split',
                grid: { columns: '1fr 1fr', rows: '1fr' },
                areas: [['a', 'b']],
                blocks: [
                    { id: 'a', title: 'Заголовок', text: 'Текст слева' },
                    { id: 'b', title: '', text: 'Текст справа' }
                ]
            },
            {
                id: 'sidebar',
                name: 'Sidebar',
                grid: { columns: '1fr 2fr', rows: '1fr' },
                areas: [['a', 'b']],
                blocks: [
                    { id: 'a', title: 'Боковая', text: 'панель' },
                    { id: 'b', title: 'Основной контент', text: 'Описание' }
                ]
            },
            {
                id: 'grid-2x2',
                name: 'Сетка 2×2',
                grid: { columns: '1fr 1fr', rows: '1fr 1fr' },
                areas: [['a', 'b'], ['c', 'd']],
                blocks: [
                    { id: 'a', title: '01', text: 'Первый пункт' },
                    { id: 'b', title: '02', text: 'Второй пункт' },
                    { id: 'c', title: '03', text: 'Третий пункт' },
                    { id: 'd', title: '04', text: 'Четвёртый пункт' }
                ]
            },
            {
                id: 'hero-strip',
                name: 'Hero + полоса',
                grid: { columns: '1fr', rows: '2fr 1fr' },
                areas: [['a'], ['b']],
                blocks: [
                    { id: 'a', title: 'Заголовок', text: 'Описание' },
                    { id: 'b', title: '', text: 'Контактная полоса · +7 000 000-00-00' }
                ]
            },
            {
                id: 'three-cols',
                name: '3 колонки',
                grid: { columns: '1fr 1fr 1fr', rows: '1fr' },
                areas: [['a', 'b', 'c']],
                blocks: [
                    { id: 'a', title: '01', text: 'Первый' },
                    { id: 'b', title: '02', text: 'Второй' },
                    { id: 'c', title: '03', text: 'Третий' }
                ]
            },
            {
                id: 'feature-top',
                name: 'Фича сверху',
                grid: { columns: '1fr 1fr', rows: '1fr 1fr' },
                areas: [['a', 'a'], ['b', 'c']],
                blocks: [
                    { id: 'a', title: 'Большой заголовок', text: 'Описание сверху на всю ширину' },
                    { id: 'b', title: '01', text: 'Пункт' },
                    { id: 'c', title: '02', text: 'Пункт' }
                ]
            },
            {
                id: 'corner',
                name: 'Угловой',
                grid: { columns: '1fr 1fr', rows: '1fr 1fr' },
                areas: [['a', 'a'], ['a', 'b']],
                blocks: [
                    { id: 'a', title: 'Крупный блок', text: 'Основной контент' },
                    { id: 'b', title: '', text: 'Дополнительный' }
                ]
            }
        ];
    }

    static getBackgrounds() {
        return [
            { id: 'grad-indigo', name: 'Индиго', css: 'linear-gradient(135deg,#6C63FF 0%,#3A1C71 100%)' },
            { id: 'grad-sunset', name: 'Закат', css: 'linear-gradient(135deg,#FF6B6B 0%,#FFD93D 100%)' },
            { id: 'grad-ocean', name: 'Океан', css: 'linear-gradient(135deg,#4D96FF 0%,#00D2FF 100%)' },
            { id: 'grad-forest', name: 'Лес', css: 'linear-gradient(135deg,#11998e 0%,#38ef7d 100%)' },
            { id: 'grad-mono', name: 'Графит', css: 'linear-gradient(135deg,#232146 0%,#0F0E17 100%)' },
            { id: 'grad-berry', name: 'Ягода', css: 'linear-gradient(135deg,#8E2DE2 0%,#4A00E0 100%)' },
            { id: 'grad-peach', name: 'Персик', css: 'linear-gradient(135deg,#FF9F43 0%,#FF6B6B 100%)' },
            { id: 'solid-dark', name: 'Тёмный', css: '#1A1932' },
            { id: 'solid-light', name: 'Светлый', css: '#F5F5F5', dark: false }
        ];
    }

    static getAccentColors() {
        return ['#6C63FF', '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6BD6', '#00D2FF', '#FF9F43', '#FFFFFF', '#0F0E17'];
    }

    static getFonts() {
        return {
            inter: "'Inter', sans-serif",
            playfair: "'Playfair Display', serif",
            space: "'Space Grotesk', sans-serif",
            jetbrains: "'JetBrains Mono', monospace"
        };
    }

    static getDecor() {
        return [
            { id: 'none', name: 'Нет' },
            { id: 'glow', name: 'Свечение' },
            { id: 'grid', name: 'Сетка' },
            { id: 'dots', name: 'Точки' },
            { id: 'noise', name: 'Шум' }
        ];
    }
}