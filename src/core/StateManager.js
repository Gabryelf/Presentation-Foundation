/**
 * Класс для управления глобальным состоянием приложения
 * Паттерн Observer
 */
 export class StateManager {
    constructor() {
        this.state = {
            currentTemplate: null,
            uploadedData: null,
            selectedImages: [],
            presentation: null,
            isLoading: false,
            error: null
        };
        this.listeners = [];
    }

    /**
     * Получить текущее состояние
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Обновить состояние
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    /**
     * Подписаться на изменения
     */
    subscribe(listener) {
        this.listeners.push(listener);
        return () => this.unsubscribe(listener);
    }

    /**
     * Отписаться от изменений
     */
    unsubscribe(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    /**
     * Уведомить подписчиков
     */
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}