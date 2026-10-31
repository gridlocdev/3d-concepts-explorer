class WikiSidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        // In the order you meet them: build a shape, refine it, give it a
        // surface, then light and frame the scene.
        const groups = [
            ['Basics', [['Meshes', 'meshes'], ['Transformations', 'transformations']]],
            ['Modeling', [['Extrude', 'extrude'], ['Loop Cuts', 'loop-cuts'], ['Bevel', 'bevel']]],
            ['Smoothing', [['Normals', 'normals'], ['Subdivision Surface', 'subdivision']]],
            ['Surface', [['Materials', 'materials'], ['UV Maps', 'uv-maps'], ['Shaders', 'shaders']]],
            ['Scene', [['Lighting', 'lighting'], ['Camera', 'camera']]],
        ];

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    background: #0d0d0d;
                    border-right: 1px solid #262626;
                    font-size: 14px;
                }

                .title {
                    display: block;
                    padding: 18px 16px 12px;
                    color: #f2f2f2;
                    font-size: 16px;
                    font-weight: 600;
                    text-decoration: none;
                }

                .title:hover,
                .title.active {
                    color: #00ff88;
                }

                .group {
                    padding: 14px 16px 4px;
                    color: #6f6f6f;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                .nav-link {
                    display: block;
                    padding: 6px 16px;
                    color: #a8a8a8;
                    text-decoration: none;
                    border-left: 2px solid transparent;
                }

                .nav-link:hover {
                    color: #f2f2f2;
                    background: #161616;
                }

                .nav-link.active {
                    color: #00ff88;
                    background: #161616;
                    border-left-color: #00ff88;
                }
            </style>

            <a href="index.html" class="title ${currentPage === 'index.html' ? 'active' : ''}">3D Concepts</a>

            <nav>
                ${groups.map(([group, pages]) => `
                    <div class="group">${group}</div>
                    ${pages.map(([name, page]) => `
                        <a href="${page}.html" class="nav-link ${currentPage === `${page}.html` ? 'active' : ''}">${name}</a>
                    `).join('')}
                `).join('')}
            </nav>
        `;
    }
}

customElements.define('wiki-sidebar', WikiSidebar);
