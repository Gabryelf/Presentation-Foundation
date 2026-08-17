import { Component } from '../core/Component.js';

export class Footer extends Component {
    render() {
        this.container.innerHTML = `
            <div class="container">
                <p>© 2026 Presentation-Foundation. Сделано с ❤️ для создания крутых презентаций</p>
            </div>
        `;
    }
}