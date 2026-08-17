import { Component } from '../core/Component.js';

export class Header extends Component {
    render() {
        this.container.innerHTML = `
            <div class="container header-content">
                <a href="/" class="logo">
                    🎯 <span>Presentation</span>Foundation
                </a>
                <nav>
                    <ul class="nav-links">
                        <li><a href="#templates">Шаблоны</a></li>
                        <li><a href="#about">О проекте</a></li>
                        <li><a href="#support">Поддержка</a></li>
                    </ul>
                </nav>
            </div>
        `;
    }
}