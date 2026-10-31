# 3D Concepts Explorer

An interactive learning guide for fundamental 3D modeling concepts that apply in any modeling tool, featuring live Three.js visualizations.

## Structure

This is now a multi-page wiki-style application with the following structure:

### Main Pages
- `index.html` - Landing page with overview and links to all concepts
- `meshes.html` - Understanding vertices, edges, and faces
- `normals.html` - Surface orientation and lighting
- `transformations.html` - Move, Rotate, and Scale operations
- `extrude.html` - Creating new geometry
- `loop-cuts.html` - Adding edge loops for detail
- `bevel.html` - Rounding edges for realism
- `subdivision.html` - Smoothing geometry
- `materials.html` - Surface appearance and properties
- `uv-maps.html` - Texture mapping
- `lighting.html` - Light types and setup
- `camera.html` - Framing and composition
- `shaders.html` - Custom visual effects

### Components
- `components/wiki-sidebar.js` - Shared Web Component for navigation sidebar
- `components/app.js` - Loaded by every page. Starts the page's scenes, then swaps pages in place when you click a link to another page (fetches it, replaces `<main>`, restarts scenes). The sidebar and three.js stay loaded, so pages switch instantly without a blank flash. Falls back to a normal page load if anything goes wrong.
- `components/scene-scope.js` - Tracks a page's animation frames, window listeners and WebGL renderers so they can be stopped and freed on a page swap

### Scenes
- `scenes/<page>.js` - The three.js demos for `<page>.html`. Each exports `start()`, which builds the scenes and returns a `stop()` function. Use `scope.raf`, `scope.on(window, ...)` and `scope.renderer(...)` instead of `requestAnimationFrame`, `window.addEventListener` and `new THREE.WebGLRenderer` so `stop()` can clean them up.

### Styles
- `styles/main.css` - Shared styles for all pages

### Assets
- `static/` - Icons and other static assets
- `node_modules/` - Three.js library

## Features

- **Wiki-style navigation** - Persistent sidebar on every page
- **Interactive 3D visualizations** - Each concept has a live Three.js demo
- **Educational tone** - Clear explanations that balance accessibility with technical accuracy
- **Responsive design** - Works on desktop and mobile devices
- **Consistent styling** - Shared design system across all pages

## Development

To run locally:
1. Ensure Three.js is installed: `pnpm install`
2. Open `index.html` in a web browser
3. Use a local server for best results (e.g., `python -m http.server` or VSCode Live Server)

## Navigation

Each concept page includes:
- A TL;DR box with a quick summary
- Detailed explanation with technical depth
- Live 3D visualization demonstrating the concept
- Navigation links to previous/next concepts
- Sidebar with links to all concepts

## Original Version

The original single-page application is preserved as `index-old.html`.
