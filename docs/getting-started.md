# Getting started

You can use 3D Concepts Explorer online or run it from source on your own machine.

## What you need

- A browser with WebGL, on a computer or a phone.
- Only for running from source: Python 3 and [just](https://github.com/casey/just).

## Use it online

Open [gridloc.dev/apps/3d-concepts-explorer](https://gridloc.dev/apps/3d-concepts-explorer/). Nothing needs installing.

## Run it from source

```bash
git clone https://github.com/gridlocdev/3d-concepts-explorer.git
cd 3d-concepts-explorer
just serve   # serve src/ on http://localhost:5180/ with live reload
```

Then open http://localhost:5180/. Without just, run `python3 tools/serve.py 5180 src`. The pages must be served over HTTP, not opened as files, because they load ES modules. There's no install step: three.js is already in `src/vendor/three/`.

## First run

The front page lists every concept in order, and the sidebar on the left (at the top on a phone) has the same list in five groups. Start with **Meshes** and use the next link at the bottom of each page to go through them in order. The site saves nothing.
