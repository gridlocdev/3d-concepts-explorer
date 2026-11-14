# 3D Concepts Explorer

I wanted a visual explanation of how 3D concepts work, so I built this to help me match each term with what it actually does. Each page covers one idea of 3D modeling, like loop cuts or normals, and shows it with small live models you can turn.

![The Materials page: the sidebar lists every concept by group, and the page shows a row of blue spheres going from glossy to matte as roughness rises from 0 to 1, an orange sphere as non-metal and as metal, and more spheres below for color, glass and emission](docs/images/materials.webp)

- **Twelve concepts in working order.** The pages go from meshes and transformations through modeling, smoothing and surfaces to lighting and cameras.
- **A live model for every idea.** Each page is a spread of small 3D models with a short caption each; drag a model to turn it, or **Expand** it to see it large.
- **Not tied to one tool.** The pages explain the concept rather than one modeling tool's buttons.

## Getting started

Open it at [gridloc.dev](https://gridloc.dev/apps/3d-concepts-explorer/), or run it from source:

```bash
just serve   # serve on http://localhost:5180/ with live reload
```

See [Getting started](docs/getting-started.md) for requirements and other ways to run it.

## Learn more

- [Features](docs/features.md) · [Controls](docs/controls.md) · [Credits](docs/credits.md)
- [All documentation](docs/README.md) · [Working on the code](docs/development.md)

## License

[MIT](LICENSE)
