# Developer guide

3D Concepts Explorer is plain HTML, CSS and ES modules with [three.js](https://threejs.org/).
There's no npm install and no bundler: what's in `src/` is what the web server serves. The rules
in `AGENTS.md` at the repository root apply to everyone working on it.

## Getting set up

You need Python 3 and [just](https://github.com/casey/just).

```bash
just serve                 # serve src/ at http://localhost:5180/ with live reload
just build                 # write dist/, the files to upload to a web server
just preview               # build, then serve dist/ to check it before deploying
just vendor-three 0.182.0  # re-vendor three.js at a version
```

`just serve` runs `tools/serve.py`, a small static server with caching off and live reload:
CSS edits swap in place so the 3D models keep running, and any other edit reloads the page.
You can also run it directly: `python3 tools/serve.py [port] [folder]` (the folder defaults to
`src`).

Pages must be served over HTTP, not opened as files, because they load ES modules.

## Layout

Everything the web server serves lives in `src/`. `tools/`, `docs/` and the `justfile` are for
development.

```
src/<page>.html              one page per concept, plus index.html
src/scenes/<page>.js         the 3D models for <page>.html
src/components/              code shared by every page
src/styles/main.css          shared styles for all pages
src/static/                  icons and other static assets
src/vendor/three/            three.js (version in VERSION)
tools/serve.py               the local dev server
```

### Components

- `components/app.js` is loaded by every page. It starts the page's scenes, then swaps pages in
  place when you click a link to another page: it fetches the page, replaces `<main>` and
  restarts the scenes. The sidebar and three.js stay loaded, so pages switch instantly without
  a blank flash. If anything goes wrong it falls back to a normal page load.
- `components/wiki-sidebar.js` is the navigation sidebar, a Web Component. Its list of groups
  and pages sets the order of the whole site.
- `components/brochure.js` draws every 3D panel on a page with one WebGL renderer. Each visible
  panel renders into the shared canvas, then is copied into the panel's own 2D canvas. This
  stays under the browser's limit on WebGL contexts and skips panels that are off screen. It
  also has shared colors and helpers (labels, dots, lines, arrows and checker textures).
- `components/scene-scope.js` tracks a page's animation frames, window listeners and WebGL
  renderers so they can be stopped and freed on a page swap.
- `components/mesh-kit.js` is a small polygon mesh (`{ v, f }`) with box grids, tubes, face
  extrusion and Catmull-Clark subdivision, used to show real modeling operations.

three.js is loaded through an import map in each page's `<head>`, so modules import it as
`three`.

### A concept page

Each concept page has:

- A title and a one-line summary (`p.lede`) under it.
- A grid of 3D panels: `.spread` holding `figure.panel[data-panel="<id>"]`, each with a
  `.view` and a `figcaption`. `.panel.wide` spans two columns.
- For some concepts, short steps for doing it in a modeling tool.
- Previous and next links in sidebar order.

Its `scenes/<page>.js` exports `start()`, which calls `createBrochure()`, adds one
`b.panel(id, setup, opts)` per `data-panel` figure, and returns `b.stop`. `setup(p)` builds the
model into `p.root` (or `p.scene`) and may return `update(t, dt)` to animate it.

## Contributing

Keep the concepts tool-neutral: explain the idea, not one tool's menus. Captions are short and
say what the model shows.

### Adding a concept

1. Copy an existing page, such as `src/bevel.html`, to `src/<page>.html`. Change the title, the
   summary and the panels.
2. Write `src/scenes/<page>.js` with one `b.panel()` for each `data-panel` on the page.
3. Add the page to the groups in `src/components/wiki-sidebar.js`.
4. Add it to the list on `src/index.html`.
5. Update the previous and next links on the new page and on the pages either side of it.
6. Run `just serve` and check the page, including at phone width.

## Building and deploying

`just build` writes `dist/`: a copy of `src/` without three.js's `LICENSE` and `VERSION`, which
the pages don't load (the minified files carry their own license header). Upload the contents of
`dist/` to any static web server. `just preview` builds and serves `dist/` at
http://localhost:5180/ so you can check it first. `dist/` is ignored by git.
