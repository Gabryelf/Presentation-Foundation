/**
 * Рендеринг слайдов
 */
 export class SlideRenderer {
    /**
     * Рендеринг слайда в DOM
     */
    static render(slide, index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'slide-wrapper';
        wrapper.dataset.index = index;

        const content = document.createElement('div');
        content.className = `slide-content ${slide.layout.titleClass}`;

        // Заголовок
        const title = document.createElement('h2');
        title.textContent = slide.title;
        content.appendChild(title);

        // Контент в зависимости от типа
        if (slide.type === 'list' && slide.content) {
            const list = document.createElement('ul');
            const items = slide.content.split('\n- ').filter(item => item.trim());
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.replace(/^-\s*/, '');
                list.appendChild(li);
            });
            content.appendChild(list);
        } else if (slide.content) {
            const paragraph = document.createElement('p');
            paragraph.textContent = slide.content;
            content.appendChild(paragraph);
        }

        // Добавляем возможность редактирования
        content.addEventListener('dblclick', () => {
            this.enableEditing(content, slide);
        });

        wrapper.appendChild(content);
        return wrapper;
    }

    /**
     * Режим редактирования слайда
     */
    static enableEditing(container, slide) {
        // Сохраняем оригинальный контент
        const originalContent = container.innerHTML;
        
        // Создаем редактор
        const editor = document.createElement('div');
        editor.className = 'slide-editor';
        
        const textarea = document.createElement('textarea');
        textarea.value = slide.content || '';
        
        const actions = document.createElement('div');
        actions.className = 'editor-actions';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn-primary';
        saveBtn.textContent = 'Сохранить';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-secondary';
        cancelBtn.textContent = 'Отмена';
        
        actions.appendChild(saveBtn);
        actions.appendChild(cancelBtn);
        editor.appendChild(textarea);
        editor.appendChild(actions);
        
        container.innerHTML = '';
        container.appendChild(editor);
        
        // Обработчики
        saveBtn.addEventListener('click', () => {
            slide.content = textarea.value;
            this.renderContent(container, slide);
        });
        
        cancelBtn.addEventListener('click', () => {
            this.renderContent(container, slide);
        });
    }

    /**
     * Рендеринг контента слайда
     */
    static renderContent(container, slide) {
        container.innerHTML = '';
        
        const title = document.createElement('h2');
        title.textContent = slide.title;
        container.appendChild(title);
        
        if (slide.type === 'list' && slide.content) {
            const list = document.createElement('ul');
            const items = slide.content.split('\n- ').filter(item => item.trim());
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.replace(/^-\s*/, '');
                list.appendChild(li);
            });
            container.appendChild(list);
        } else if (slide.content) {
            const paragraph = document.createElement('p');
            paragraph.textContent = slide.content;
            container.appendChild(paragraph);
        }
    }
}