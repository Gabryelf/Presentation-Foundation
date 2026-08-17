import { StateManager } from './StateManager.js';
import { Header } from '../ui/Header.js';
import { Footer } from '../ui/Footer.js';
import { Templates } from '../ui/Templates.js';

/**
 * Главный класс приложения
 * Синглтон
 */
class App {
    constructor() {
        if (App.instance) {
            return App.instance;
        }
        App.instance = this;

        this.stateManager = new StateManager();
        this.components = [];
        this.init();
    }

    /**
     * Инициализация приложения
     */
    init() {
        console.log('🚀 Presentation-Foundation v0.1.0');
        
        // Инициализируем компоненты
        this.components = [
            new Header('app-header'),
            new Footer('app-footer'),
            new Templates('templates-grid', this.stateManager)
        ];

        // Настраиваем загрузку файлов
        this.setupFileUpload();

        // Подписываемся на изменения состояния
        this.stateManager.subscribe((state) => {
            console.log('📊 State updated:', state);
        });
    }

    /**
     * Настройка загрузки файлов
     */
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
    }

    /**
     * Обработка загруженного файла
     */
    async handleFileUpload(file) {
        this.stateManager.setState({ isLoading: true, error: null });

        try {
            const content = await this.readFile(file);
            
            // Парсим контент в зависимости от типа файла
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

            console.log('📄 File uploaded successfully:', data);
            this.showNotification('Файл успешно загружен!', 'success');
        } catch (error) {
            this.stateManager.setState({
                isLoading: false,
                error: error.message
            });
            this.showNotification('Ошибка загрузки файла: ' + error.message, 'error');
        }
    }

    /**
     * Чтение файла
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    }

    /**
     * Парсинг текстового контента
     */
    parseTextContent(content) {
        // Простой парсер для демонстрации
        const lines = content.split('\n').filter(line => line.trim());
        const title = lines[0] || 'Без названия';
        const slides = lines.slice(1).filter(line => line.trim());
        
        return {
            title,
            slides: slides.map((text, index) => ({
                id: index + 1,
                title: text.length > 50 ? text.slice(0, 50) + '...' : text,
                content: text
            }))
        };
    }

    /**
     * Показать уведомление
     */
    showNotification(message, type = 'info') {
        // Временная реализация через alert
        // В будущем заменим на красивый компонент
        alert(message);
    }
}

// Создаем экземпляр приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    window.app = app; // Для отладки
});