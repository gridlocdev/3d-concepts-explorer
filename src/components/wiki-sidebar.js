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

        const concepts = [
            { name: 'Meshes', file: 'meshes.html' },
            { name: 'Normals', file: 'normals.html' },
            { name: 'Transformations', file: 'transformations.html' },
            { name: 'Extrude', file: 'extrude.html' },
            { name: 'Loop Cuts', file: 'loop-cuts.html' },
            { name: 'Bevel', file: 'bevel.html' },
            { name: 'Subdivision Surface', file: 'subdivision.html' },
            { name: 'Materials', file: 'materials.html' },
            { name: 'UV Maps', file: 'uv-maps.html' },
            { name: 'Lighting', file: 'lighting.html' },
            { name: 'Camera', file: 'camera.html' },
            { name: 'Shaders', file: 'shaders.html' }
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
                ${concepts.map(concept => `
                    <a href="${concept.file}" class="nav-link ${currentPage === concept.file ? 'active' : ''}">${concept.name}</a>
                `).join('')}
            </nav>
        `;
    }
}

customElements.define('wiki-sidebar', WikiSidebar);
