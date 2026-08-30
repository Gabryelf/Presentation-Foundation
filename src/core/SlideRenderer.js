/**
 * Рендеринг слайдов с адаптивными изображениями
 */
 export class SlideRenderer {
    static render(slide, index, animation = 'fade') {
        const wrapper = document.createElement('div');
        wrapper.className = `slide-wrapper slide-animation-${animation}`;
        wrapper.dataset.index = index;

        const content = document.createElement('div');
        content.className = `slide-content ${slide.layout?.titleClass || ''}`;
        content.style.background = slide.style?.background || slide.layout?.background || 'var(--bg-secondary)';
        content.style.color = slide.style?.textColor || 'var(--text-primary)';

        // Заголовок
        const title = document.createElement('h2');
        title.textContent = slide.title;
        title.style.color = slide.style?.accentColor || 'var(--primary-color)';
        content.appendChild(title);

        // Изображение с адаптацией
        if (slide.image) {
            const imgContainer = document.createElement('div');
            imgContainer.style.cssText = `
                margin: 12px 0;
                border-radius: var(--radius-sm);
                overflow: hidden;
                position: relative;
                width: 100%;
                max-height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--bg-primary);
            `;
            
            const img = document.createElement('img');
            img.src = slide.image;
            img.alt = slide.title;
            img.style.cssText = `
                width: 100%;
                height: auto;
                max-height: 300px;
                object-fit: contain;
            `;
            
            // Адаптация под стиль шаблона
            if (slide.layout?.id === 'creative') {
                img.style.cssText += `
                    border-radius: 50%;
                    max-height: 200px;
                    width: 200px;
                    object-fit: cover;
                `;
                imgContainer.style.cssText += `
                    justify-content: center;
                    padding: 12px 0;
                `;
            } else if (slide.layout?.id === 'minimal') {
                img.style.cssText += `
                    filter: grayscale(100%);
                    max-height: 250px;
                `;
            } else if (slide.layout?.id === 'corporate') {
                img.style.cssText += `
                    border-radius: 4px;
                    max-height: 250px;
                `;
            }
            
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
                li.style.color = slide.style?.textColor || 'var(--text-secondary)';
                list.appendChild(li);
            });
            content.appendChild(list);
        } else if (slide.type === 'heading') {
            const heading = document.createElement('h1');
            heading.textContent = slide.content.replace(/^#+\s*/, '');
            heading.style.cssText = `
                font-size: 42px;
                color: ${slide.style?.accentColor || 'var(--primary-color)'};
                text-align: center;
                font-family: var(--font-heading);
            `;
            content.appendChild(heading);
        } else if (slide.type === 'code') {
            const code = document.createElement('pre');
            code.style.cssText = `
                background: rgba(0,0,0,0.3);
                padding: 16px;
                border-radius: var(--radius-sm);
                overflow-x: auto;
                font-family: var(--font-mono);
                font-size: 13px;
                color: #F8F8F2;
                max-height: 200px;
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
                li.style.color = slide.style?.textColor || 'var(--text-secondary)';
                list.appendChild(li);
            });
            content.appendChild(list);
        } else if (slide.content) {
            const paragraph = document.createElement('p');
            paragraph.textContent = slide.content;
            paragraph.style.color = slide.style?.textColor || 'var(--text-secondary)';
            content.appendChild(paragraph);
        }

        // Двойной клик для редактирования
        content.addEventListener('dblclick', () => {
            this.enableEditing(content, slide);
        });

        wrapper.appendChild(content);
        return wrapper;
    }

    static enableEditing(container, slide) {
        const editor = document.createElement('div');
        editor.className = 'slide-editor';
        editor.style.cssText = 'width: 100%;';

        const textarea = document.createElement('textarea');
        textarea.value = slide.content || '';
        textarea.style.cssText = `
            width: 100%;
            min-height: 80px;
            background: var(--bg-primary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            padding: 10px;
            font-size: 14px;
            font-family: inherit;
            resize: vertical;
        `;

        const actions = document.createElement('div');
        actions.style.cssText = `
            display: flex;
            gap: 8px;
            margin-top: 8px;
        `;

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn-primary';
        saveBtn.textContent = '💾 Сохранить';
        saveBtn.style.cssText = 'padding: 4px 16px; font-size: 12px;';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-secondary';
        cancelBtn.textContent = '✖ Отмена';
        cancelBtn.style.cssText = 'padding: 4px 16px; font-size: 12px;';

        actions.appendChild(saveBtn);
        actions.appendChild(cancelBtn);
        editor.appendChild(textarea);
        editor.appendChild(actions);

        container.innerHTML = '';
        container.appendChild(editor);

        saveBtn.addEventListener('click', () => {
            slide.content = textarea.value;
            if (slide.content.includes('\n- ')) {
                slide.type = 'list';
            } else {
                slide.type = 'text';
            }
            const newContent = this.renderContent(container, slide);
            container.innerHTML = '';
            container.appendChild(newContent);
        });

        cancelBtn.addEventListener('click', () => {
            const newContent = this.renderContent(container, slide);
            container.innerHTML = '';
            container.appendChild(newContent);
        });
    }

    static renderContent(container, slide) {
        const content = document.createElement('div');
        content.className = 'slide-content';

        const title = document.createElement('h2');
        title.textContent = slide.title;
        title.style.color = slide.style?.accentColor || 'var(--primary-color)';
        content.appendChild(title);

        if (slide.image) {
            const imgContainer = document.createElement('div');
            imgContainer.style.cssText = `
                margin: 12px 0;
                border-radius: var(--radius-sm);
                overflow: hidden;
                max-height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            const img = document.createElement('img');
            img.src = slide.image;
            img.alt = slide.title;
            img.style.cssText = `
                width: 100%;
                height: auto;
                max-height: 300px;
                object-fit: contain;
            `;
            imgContainer.appendChild(img);
            content.appendChild(imgContainer);
        }

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

        return content;
    }
}