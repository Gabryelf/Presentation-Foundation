/**
 * Управление сохранением данных в localStorage
 */
 export class StorageManager {
    static PREFIX = 'pf_';
    static KEYS = {
        SETTINGS: 'settings',
        LAST_PRESENTATION: 'last_presentation',
        TEMPLATES: 'templates',
        USER_STYLES: 'user_styles',
        COLLECTIONS: 'collections'
    };

    /**
     * Сохранить данные
     */
    static save(key, data) {
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    }

    /**
     * Получить данные
     */
    static load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this.PREFIX + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Storage load error:', error);
            return defaultValue;
        }
    }

    /**
     * Удалить данные
     */
    static remove(key) {
        localStorage.removeItem(this.PREFIX + key);
    }

    /**
     * Очистить все данные
     */
    static clear() {
        Object.keys(this.KEYS).forEach(key => {
            this.remove(this.KEYS[key]);
        });
    }
}