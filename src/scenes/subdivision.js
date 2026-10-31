// Panels for subdivision.html. Real Catmull-Clark subdivision
// (components/mesh-kit.js) of a cube cage.
import * as THREE from 'three';
import { createBrochure, COLORS, lines, solid, dots } from '../components/brochure.js';
import { cube, boxGrid, clone, subdivideTimes, toGeometry, toEdges, toPoints, setGeometry } from '../components/mesh-kit.js';

function smoothView(root, m, levels, { cage = true } = {}) {
    const s = subdivideTimes(m, levels);
    root.add(solid(toGeometry(s, { smooth: levels > 0 }), COLORS.body, { flatShading: levels === 0 }));
    root.add(lines(toEdges(s), 0x000000, 0.35));
    if (cage && levels > 0) root.add(lines(toEdges(m), COLORS.hi, 0.7));
}

export function start() {
    const b = createBrochure();
    const base = cube(1.1);

    for (const level of [0, 1, 2, 3]) {
        b.panel(`level-${level}`, p => {
            smoothView(p.root, base, level);
            p.root.rotation.x = 0.35;
        });
    }

    b.panel('cage', p => {
        const corner = base.v.findIndex(v => v.every(c => c > 0));
        const body = solid(new THREE.BufferGeometry(), COLORS.body);
        const edges = lines(new THREE.BufferGeometry(), COLORS.hi);
        const point = dots(new THREE.BufferGeometry(), COLORS.hi, 11);
        p.root.add(body, edges, point);
        p.root.rotation.x = 0.3;
        return t => {
            const m = clone(base);
            const k = 1 + 0.9 * (0.5 - 0.5 * Math.cos(t * 1.3));
            m.v[corner] = m.v[corner].map(c => c * k);
            setGeometry(body, toGeometry(subdivideTimes(m, 3), { smooth: true }));
            setGeometry(edges, toEdges(m));
            setGeometry(point, toPoints({ v: [m.v[corner]], f: [] }));
        };
    }, { cam: [0, 1.2, 4.6], spin: 0.15 });

    const near = [-0.55, -0.45, 0.45, 0.55];
    const far = [-0.55, 0.55];
    b.panel('support', p => {
        smoothView(p.root, boxGrid(near, near, near), 2);
        p.root.rotation.x = 0.35;
    });

    b.panel('partial', p => {
        smoothView(p.root, boxGrid(far, near, far), 2);
        p.root.rotation.x = 0.35;
    });

    return b.stop;
}
