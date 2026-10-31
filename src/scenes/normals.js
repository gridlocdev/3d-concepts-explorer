// Panels for normals.html.
import * as THREE from 'three';
import { createBrochure, COLORS, lines, solid, arrow } from '../components/brochure.js';
import { cube, faceCenter, faceNormal, toGeometry, toEdges } from '../components/mesh-kit.js';

// Short lines from each vertex along its normal.
function normalLines(geo, length, color) {
    const pos = geo.attributes.position, nor = geo.attributes.normal, out = [];
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        out.push(x, y, z, x + nor.getX(i) * length, y + nor.getY(i) * length, z + nor.getZ(i) * length);
    }
    return lines(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(out, 3)), color);
}

function faceArrows(m, flipped = -1) {
    const g = new THREE.Group();
    m.f.forEach((_, fi) => {
        const c = new THREE.Vector3(...faceCenter(m, fi));
        const n = new THREE.Vector3(...faceNormal(m, fi));
        g.add(arrow(c, n, 0.45, fi === flipped ? COLORS.hi : COLORS.good));
    });
    return g;
}

export function start() {
    const b = createBrochure();

    b.panel('face-normals', p => {
        const m = cube(0.9);
        p.root.add(solid(toGeometry(m), COLORS.body, { flatShading: true }), lines(toEdges(m), 0x000000, 0.4));
        p.root.add(faceArrows(m));
    }, { cam: [0, 1.5, 3.8] });

    b.panel('vertex-normals', p => {
        const geo = new THREE.SphereGeometry(0.75, 14, 10);
        p.root.add(solid(geo, COLORS.body), normalLines(geo, 0.3, COLORS.good));
    });

    b.panel('backface', p => {
        const geo = new THREE.PlaneGeometry(1.3, 1.3);
        p.root.add(solid(geo, COLORS.body, { side: THREE.FrontSide }));
        p.root.add(lines(new THREE.EdgesGeometry(geo), COLORS.faint));
        p.root.add(arrow(new THREE.Vector3(), new THREE.Vector3(0, 0, 1), 0.6, COLORS.good));
    }, { spin: 0.9, cam: [0, 0.6, 3.6] });

    b.panel('flipped', p => {
        const m = cube(0.9);
        const FRONT = 5; // +Z
        m.f[FRONT].reverse();
        const geo = toGeometry(m, { color: COLORS.body, faceColors: {} });
        // Front sides in blue; the insides (back sides) in dark gray, as
        // many tools show them, so the inside-out face reads as a hole.
        p.root.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: COLORS.body, flatShading: true })));
        p.root.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.BackSide })));
        p.root.add(lines(toEdges(m), 0x000000, 0.4), faceArrows(m, FRONT));
        p.root.rotation.y = -0.5;
    }, { cam: [0, 1.4, 3.8], spin: 0.2 });

    b.panel('flat', p => {
        p.root.add(solid(new THREE.SphereGeometry(0.85, 12, 8), COLORS.body, { flatShading: true }));
    });

    b.panel('smooth', p => {
        p.root.add(solid(new THREE.SphereGeometry(0.85, 12, 8), COLORS.body));
    });

    b.panel('mixed', p => {
        // CylinderGeometry gives the caps their own normals: smooth sides,
        // sharp rims.
        const geo = new THREE.CylinderGeometry(0.6, 0.6, 1, 16);
        p.root.add(solid(geo, COLORS.body), lines(new THREE.EdgesGeometry(geo, 30), 0x000000, 0.5));
        p.root.rotation.x = 0.35;
    });

    return b.stop;
}
