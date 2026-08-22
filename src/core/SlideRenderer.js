/**
 * Рендеринг слайдов
 */
 export class SlideRenderer {
    static render(slide, index, animation = 'fade') {
        const wrapper = document.createElement('div');
        wrapper.className = `slide-wrapper slide-animation-${animation}`;
        wrapper.dataset.index = index;

        const content = document.createElement('div');
        content.className = `slide-content ${slide.layout.titleClass}`;
        content.style.background = slide.style?.background || slide.layout.background;
        content.style.color = slide.style?.textColor || '#FFFFFE';

        // Заголовок
        const title = document.createElement('h2');
        title.textContent = slide.title;
        title.style.color = slide.style?.accentColor || '#6C63FF';
        content.appendChild(title);

        // Изображение если есть
        if (slide.image) {
            const imgContainer = document.createElement('div');
            imgContainer.style.cssText = `
                margin: 16px 0;
                border-radius: 8px;
                overflow: hidden;
                max-height: 300px;
            `;
            const img = document.createElement('img');
            img.src = slide.image;
            img.alt = slide.title;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
            `;
            imgContainer.appendChild(img);
            content.appendChild(imgContainer);
        }

        // Контент в зависимости от типа
        if (slide.type === 'list' && slide.content) {
            const list = document.createElement('ul');
            const items = slide.content.split('\n- ').filter(item => item.trim());
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.replace(/^-\s*/, '');
                li.style.color = slide.style?.textColor || '#A7A9BE';
                list.appendChild(li);
            });
            content.appendChild(list);
        } else if (slide.type === 'heading') {
            const heading = document.createElement('h1');
            heading.textContent = slide.content.replace(/^#+\s*/, '');
            heading.style.cssText = `
                font-size: 48px;
                color: ${slide.style?.accentColor || '#6C63FF'};
                text-align: center;
            `;
            content.appendChild(heading);
        } else if (slide.type === 'code') {
            const code = document.createElement('pre');
            code.style.cssText = `
                background: rgba(0,0,0,0.3);
                padding: 16px;
                border-radius: 8px;
                overflow-x: auto;
                font-family: var(--font-mono);
                font-size: 14px;
                color: #F8F8F2;
            `;
            const codeContent = document.createElement('code');
            codeContent.textContent = slide.content.replace(/```/g, '').trim();
            code.appendChild(codeContent);
            content.appendChild(code);
        } else if (slide.type === 'numbered') {
            const list = document.createElement('ol');
            const items = slide.content.split('\n').filter(item => item.match(/^\d+\.\s/));
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.replace(/^\d+\.\s*/, '');
                li.style.color = slide.style?.textColor || '#A7A9BE';
                list.appendChild(li);
            });
            content.appendChild(list);
        } else if (slide.content) {
            const paragraph = document.createElement('p');
            paragraph.textContent = slide.content;
            paragraph.style.color = slide.style?.textColor || '#A7A9BE';
            content.appendChild(paragraph);
        }

        // Добавляем возможность редактирования
        content.addEventListener('dblclick', () => {
            this.enableEditing(content, slide);
        });

        wrapper.appendChild(content);
        return wrapper;
    }

    static enableEditing(container, slide) {
        const editor = document.createElement('div');
        editor.className = 'slide-editor';
        
        const textarea = document.createElement('textarea');
        textarea.value = slide.content || '';
        textarea.style.cssText = `
            width: 100%;
            min-height: 120px;
            background: var(--bg-primary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 12px;
            font-size: 16px;
            font-family: inherit;
            resize: vertical;
        `;
        
        const actions = document.createElement('div');
        actions.className = 'editor-actions';
        actions.style.cssText = `
            display: flex;
            gap: 12px;
            margin-top: 12px;
        `;
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn-primary';
        saveBtn.textContent = '💾 Сохранить';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-secondary';
        cancelBtn.textContent = '✖ Отмена';
        
        actions.appendChild(saveBtn);
        actions.appendChild(cancelBtn);
        editor.appendChild(textarea);
        editor.appendChild(actions);
        
        container.innerHTML = '';
        container.appendChild(editor);
        
        saveBtn.addEventListener('click', () => {
            slide.content = textarea.value;
            // Определяем тип заново
            if (slide.content.includes('\n- ')) {
                slide.type = 'list';
            } else {
                slide.type = 'text';
            }
            SlideRenderer.renderContent(container, slide);
        });
        
        cancelBtn.addEventListener('click', () => {
            SlideRenderer.renderContent(container, slide);
        });
    }

    static renderContent(container, slide) {
        container.innerHTML = '';
        
        const title = document.createElement('h2');
        title.textContent = slide.title;
        title.style.color = slide.style?.accentColor || '#6C63FF';
        container.appendChild(title);
        
        if (slide.image) {
            const imgContainer = document.createElement('div');
            imgContainer.style.cssText = `
                margin: 16px 0;
                border-radius: 8px;
                overflow: hidden;
                max-height: 300px;
            `;
            const img = document.createElement('img');
            img.src = slide.image;
            img.alt = slide.title;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
            `;
            imgContainer.appendChild(img);
            container.appendChild(imgContainer);
        }
        
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