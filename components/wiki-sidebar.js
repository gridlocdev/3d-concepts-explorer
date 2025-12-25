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
                    background: #0f0f0f;
                    border-right: 2px solid #333;
                }

                .sidebar-header {
                    padding: 20px;
                    background: #1a1a1a;
                    border-bottom: 2px solid #333;
                }

                .sidebar-title {
                    margin: 0;
                    font-size: 20px;
                    color: #00ff88;
                    font-weight: bold;
                }

                .sidebar-subtitle {
                    margin: 5px 0 0 0;
                    font-size: 12px;
                    color: #888;
                }

                nav {
                    padding: 10px 0;
                }

                .nav-section {
                    margin-bottom: 20px;
                }

                .nav-section-title {
                    padding: 10px 20px;
                    font-size: 11px;
                    font-weight: bold;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .nav-link {
                    display: block;
                    padding: 12px 20px;
                    color: #ccc;
                    text-decoration: none;
                    font-size: 14px;
                    transition: all 0.2s;
                    border-left: 3px solid transparent;
                }

                .nav-link:hover {
                    background: #1a1a1a;
                    color: #00ff88;
                    border-left-color: #00ff88;
                }

                .nav-link.active {
                    background: #1a1a1a;
                    color: #00ff88;
                    border-left-color: #00ff88;
                    font-weight: bold;
                }

                .home-link {
                    padding: 15px 20px;
                    color: #00ff88;
                    text-decoration: none;
                    font-size: 14px;
                    display: block;
                    border-bottom: 1px solid #333;
                    transition: background 0.2s;
                }

                .home-link:hover {
                    background: #1a1a1a;
                }
            </style>

            <div class="sidebar-header">
                <h1 class="sidebar-title">Blender Concepts</h1>
                <p class="sidebar-subtitle">Interactive Learning Guide</p>
            </div>

            <a href="index.html" class="home-link">← Home</a>

            <nav>
                <div class="nav-section">
                    <div class="nav-section-title">Core Concepts</div>
                    ${concepts.map(concept => `
                        <a href="${concept.file}" class="nav-link ${currentPage === concept.file ? 'active' : ''}">
                            ${concept.name}
                        </a>
                    `).join('')}
                </div>
            </nav>
        `;
    }
}

customElements.define('wiki-sidebar', WikiSidebar);
