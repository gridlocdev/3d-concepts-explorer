# 3D Concepts Explorer

An interactive learning guide for fundamental 3D modeling concepts that apply in any modeling tool, featuring live Three.js visualizations.

## Structure

A multi-page wiki-style site. Everything the web server serves lives in `src/` (paths below are relative to it); `tools/` and the `justfile` are for development and builds.

### Main Pages
- `index.html` - Landing page with every concept, grouped in learning order

In sidebar order:
- Basics: `meshes.html` (vertices, edges, faces), `transformations.html` (move, rotate, scale, pivots)
- Modeling: `extrude.html`, `loop-cuts.html`, `bevel.html`
- Smoothing: `normals.html`, `subdivision.html`
- Surface: `materials.html`, `uv-maps.html`, `shaders.html`
- Scene: `lighting.html`, `camera.html`

### Components
- `components/wiki-sidebar.js` - Shared Web Component for navigation sidebar
- `components/app.js` - Loaded by every page. Starts the page's scenes, then swaps pages in place when you click a link to another page (fetches it, replaces `<main>`, restarts scenes). The sidebar and three.js stay loaded, so pages switch instantly without a blank flash. Falls back to a normal page load if anything goes wrong.
- `components/scene-scope.js` - Tracks a page's animation frames, window listeners and WebGL renderers so they can be stopped and freed on a page swap
- `components/brochure.js` - Draws every 3D panel on a page with one WebGL renderer: each visible panel renders into the shared canvas, then is copied into the panel's own 2D canvas. This stays under the browser's limit on WebGL contexts and skips panels that are off screen. Also has shared colors and helpers (labels, dots, lines, arrows, checker textures).
- `components/mesh-kit.js` - A small polygon mesh (`{ v, f }`) with box grids, tubes, face extrusion and Catmull-Clark subdivision, used to show real modeling operations

### Scenes
- `scenes/<page>.js` - The 3D panels for `<page>.html`. Each exports `start()`, which calls `createBrochure()`, adds one `b.panel(id, setup, opts)` per `[data-panel="id"]` figure, and returns `b.stop`. `setup(p)` builds into `p.root` (or `p.scene`) and may return `update(t, dt)` to animate.

### Styles
- `styles/main.css` - Shared styles for all pages

### Assets
- `static/` - Icons and other static assets
- `vendor/three/` - three.js (version in `VERSION`), loaded through an import map in each page's `<head>`, so pages import it as `three` with no bundler

## Features

- **Wiki-style navigation** - Persistent sidebar on every page
- **Interactive 3D visualizations** - Each concept is a spread of small live models, one per idea; drag a model to turn it
- **Educational tone** - Clear explanations that balance accessibility with technical accuracy
- **Responsive design** - Works on desktop and mobile devices
- **Consistent styling** - Shared design system across all pages

## Development

No npm install or bundler: the site is plain HTML, CSS and ES modules in `src/`.

1. Run `just serve` (or `python3 tools/serve.py`), which serves `src/` with caching off and live reload (CSS edits swap in place; other edits reload the page)
2. Open http://localhost:5180/

Pages must be served over HTTP, not opened as files, because they load ES modules.

To update three.js, run `just vendor-three <version>` (for example `just vendor-three 0.182.0`).

## Building

`just build` writes `dist/`: a copy of `src/` without the archived `index-old.html`. Upload the contents of `dist/` to any static web server. `just preview` builds and serves `dist/` at http://localhost:5180/ so you can check it first. `dist/` is ignored by git.

### Tools
- `tools/serve.py` - Local static server with caching off and live reload: `python3 tools/serve.py [port] [folder]` (folder defaults to `src`)

## Navigation

Each concept page includes:
- A one-line summary under the title
- A grid of 3D panels (`.spread` > `figure.panel[data-panel]` with a `.view` and a `figcaption`); `.panel.wide` spans two columns
- For some concepts, short steps for doing it in a modeling tool
- Previous/next links in sidebar order, and the sidebar with every concept

## Original Version

The original single-page application is preserved as `index-old.html`.
