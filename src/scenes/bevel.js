// Panels for bevel.html. Each block is a real beveled cube: a square outline
// extruded with three.js's own bevel, so every edge gets the same width and
// segment count, as a modeling tool's bevel would give it.
import * as THREE from 'three';
import { createBrochure, COLORS, lines } from '../components/brochure.js';

function beveledCube(size, width, segments) {
    if (width === 0) return new THREE.BoxGeometry(size, size, size);
    // The outline sits `width` inside the cube; the bevel grows it back out.
    // Its corners are tiny arcs, so the side edges round with the same
    // segment count as the front and back.
    const a = size / 2 - width, r = 0.001;
    const shape = new THREE.Shape();
    const corners = [[a, a, 0], [-a, a, 0.5], [-a, -a, 1], [a, -a, 1.5]];
    corners.forEach(([x, y, start], i) => {
        for (let s = 0; s <= segments; s++) {
            const ang = (start + (s / segments) * 0.5) * Math.PI;
            const px = x - r * Math.sign(x) + r * Math.cos(ang), py = y - r * Math.sign(y) + r * Math.sin(ang);
            if (i === 0 && s === 0) shape.moveTo(px, py);
            else shape.lineTo(px, py);
        }
    });
    const depth = size - 2 * width;
    const geo = new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: true, bevelThickness: width, bevelSize: width, bevelSegments: segments, curveSegments: 1,
    });
    geo.translate(0, 0, -depth / 2);
    return geo;
}

export function start() {
    const b = createBrochure();
    const blocks = {
        sharp: [0, 1],
        chamfer: [0.14, 1],
        round: [0.14, 3],
        smooth: [0.14, 8],
        narrow: [0.04, 3],
        wide: [0.3, 6],
    };

    for (const [id, [width, segments]] of Object.entries(blocks)) {
        b.panel(id, p => {
            p.scene.environment = p.environment();
            const geo = beveledCube(1.1, width, segments);
            p.root.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
                color: COLORS.body, metalness: 0.4, roughness: 0.3, flatShading: segments < 8,
            })));
            if (id === 'round') p.root.add(lines(new THREE.EdgesGeometry(geo, 1), 0x000000, 0.5));
            p.root.rotation.x = 0.45;
        }, { cam: [0, 1.1, 3.6] });
    }

    return b.stop;
}
