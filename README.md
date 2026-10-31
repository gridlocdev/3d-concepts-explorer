# 3D Concepts Explorer

I wanted a visual explanation of how 3D concepts work, so I built this to help me match each
term with what it actually does.

![The Materials page: the sidebar lists every concept by group, and the page shows a row of blue spheres going from glossy to matte as roughness rises from 0 to 1, an orange sphere as non-metal and as metal, and more spheres below for color, glass and emission](docs/images/materials.webp)

Each page covers one concept, like loop cuts or normals, with a small live model for each part
of it. The ideas are the same in every modeling tool, so the pages explain the concept rather
than one tool's buttons.

## What it covers

The pages follow the order you work in: build a shape, refine it, give it a surface, then
light and frame the scene.

- **Basics**: meshes (vertices, edges and faces) and transformations (move, rotate, scale and
  pivots).
- **Modeling**: extrude, loop cuts and bevel.
- **Smoothing**: normals, and subdivision surfaces that smooth a blocky cage.
- **Surface**: materials, UV maps and shaders.
- **Scene**: lighting, and cameras with their lenses and projections.

Every page is a spread of small models, one per idea, each with a short caption. Drag a model
to turn it.

## For developers

Running it locally, the code layout, building and adding a concept are covered in the
[developer guide](docs/Developer-Guide.md).

## License

[MIT](LICENSE)
