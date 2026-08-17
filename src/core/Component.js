/**
 * @abstract
 * Базовый класс для всех компонентов UI
 */
 export class Component {
    constructor(containerId) {
        if (this.constructor === Component) {
            throw new Error('Component is an abstract class');
        }
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }
        this.state = {};
    }

    /**
     * @abstract
     * Рендерит компонент
     */
    render() {
        throw new Error('Method render() must be implemented');
    }

    /**
     * Обновляет состояние компонента
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }

    /**
     * Уничтожает компонент
     */
    destroy() {
        this.container.innerHTML = '';
    }
}