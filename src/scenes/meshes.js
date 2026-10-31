// Panels for meshes.html.
import * as THREE from 'three';
import { createBrochure, COLORS, dots, lines, solid, label } from '../components/brochure.js';
import { toGeometry, toEdges, toPoints } from '../components/mesh-kit.js';

// A house: 10 vertices, 7 faces (two pentagons, five quads).
function house() {
    const v = [];
    for (const z of [0.5, -0.5]) {
        v.push([-0.6, -0.65, z], [0.6, -0.65, z], [0.6, 0.15, z], [0, 0.65, z], [-0.6, 0.15, z]);
    }
    const f = [
        [0, 1, 2, 3, 4], // front
        [9, 8, 7, 6, 5], // back
        [1, 6, 7, 2],    // right wall
        [5, 0, 4, 9],    // left wall
        [0, 5, 6, 1],    // floor
        [2, 7, 8, 3],    // right roof
        [3, 8, 9, 4],    // left roof
    ];
    return { v, f };
}

export function start() {
    const b = createBrochure();
    const m = house();

    b.panel('vertices', p => {
        p.root.add(lines(toEdges(m), COLORS.faint));
        p.root.add(dots(toPoints(m), COLORS.vert, 12));
    });

    b.panel('edges', p => {
        p.root.add(lines(toEdges(m), COLORS.edge));
        p.root.add(dots(toPoints(m), COLORS.faint, 7));
    });

    b.panel('faces', p => {
        const mesh = solid(toGeometry(m), 0xffffff, { vertexColors: true, flatShading: true });
        p.root.add(mesh, lines(toEdges(m), 0x000000, 0.35));
        let shown = -1;
        return t => {
            const face = Math.floor(t) % m.f.length;
            if (face === shown) return;
            shown = face;
            mesh.geometry.dispose();
            mesh.geometry = toGeometry(m, { color: COLORS.body, faceColors: { [face]: COLORS.hi } });
        };
    });

    b.panel('polygons', p => {
        const shapes = [[3, 'Triangle'], [4, 'Quad'], [6, 'N-gon']];
        shapes.forEach(([sides, name], i) => {
            const pts = [...Array(sides).keys()].map(k => {
                const a = Math.PI / 2 + (k / sides) * Math.PI * 2 + (sides === 4 ? Math.PI / 4 : 0);
                return [Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0];
            });
            const poly = { v: pts, f: [[...Array(sides).keys()]] };
            const g = new THREE.Group();
            g.add(solid(toGeometry(poly), COLORS.body, { side: THREE.DoubleSide, flatShading: true }));
            g.add(lines(toEdges(poly), COLORS.edge), dots(toPoints(poly), COLORS.vert, 7));
            const tag = label(name, { size: 0.2 });
            tag.position.y = -0.75;
            g.add(tag);
            g.position.x = (i - 1) * 1.35;
            p.root.add(g);
        });
        p.camera.position.set(0, 0.2, 4.6);
        p.camera.lookAt(0, -0.15, 0);
    }, { spin: 0 });

    for (const [id, w, h] of [['low-poly', 8, 6], ['high-poly', 32, 24]]) {
        b.panel(id, p => {
            const geo = new THREE.SphereGeometry(1, w, h);
            p.root.add(solid(geo, COLORS.body, { flatShading: true }));
            p.root.add(lines(new THREE.WireframeGeometry(geo), 0x000000, 0.3));
        });
    }

    return b.stop;
}
