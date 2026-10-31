// Panels for loop-cuts.html. Loops are real cuts in a polygon mesh
// (components/mesh-kit.js); the highlighted rings are the loops in question.
import * as THREE from 'three';
import { createBrochure, COLORS, lines, solid, holdPingPong } from '../components/brochure.js';
import { boxGrid, tube, toGeometry, toEdges, setGeometry } from '../components/mesh-kit.js';

const S = 0.5; // half size of the cube

// A cube cut at the given heights, with those loops drawn in orange.
function cutCube(root) {
    const body = solid(new THREE.BufferGeometry(), COLORS.body, { flatShading: true });
    const edges = lines(new THREE.BufferGeometry(), 0x000000, 0.45);
    const loops = lines(new THREE.BufferGeometry(), COLORS.hi);
    loops.material.depthTest = false;
    loops.renderOrder = 2;
    root.add(body, edges, loops);
    return cuts => {
        const m = boxGrid([-S, S], [-S, ...cuts, S], [-S, S]);
        setGeometry(body, toGeometry(m));
        setGeometry(edges, toEdges(m));
        const ring = [];
        const e = S + 0.002;
        for (const y of cuts) {
            const c = [[-e, y, -e], [e, y, -e], [e, y, e], [-e, y, e]];
            c.forEach((q, i) => ring.push(...q, ...c[(i + 1) % 4]));
        }
        setGeometry(loops, new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(ring, 3)));
    };
}

// Bend a tube around a center off to its right; `angle` is the total bend.
function bendPoint([x, y, z], h, angle) {
    const k = Math.max(angle, 1e-4) / (2 * h);
    const r = 1 / k - x;
    const a = (y + h) * k;
    return [1 / k - r * Math.cos(a), -h + r * Math.sin(a), z];
}

function bent(heights, angle) {
    const m = tube(heights, 14, 0.28);
    const h = heights.at(-1);
    m.v = m.v.map(v => bendPoint(v, h, angle));
    return m;
}

// The center line of the bend: the curve the tube should follow.
function bendPath(h, angle) {
    const pts = [];
    for (let i = 0; i <= 40; i++) pts.push(...bendPoint([0, -h + (2 * h * i) / 40, 0], h, angle));
    return new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
}

export function start() {
    const b = createBrochure();

    b.panel('loop', p => {
        cutCube(p.root)([0]);
    });

    b.panel('count', p => {
        const draw = cutCube(p.root);
        let shown = 0;
        return t => {
            const n = 1 + (Math.floor(t / 1.2) % 4);
            if (n === shown) return;
            shown = n;
            draw([...Array(n).keys()].map(i => -S + (2 * S * (i + 1)) / (n + 1)));
        };
    });

    b.panel('slide', p => {
        const draw = cutCube(p.root);
        return t => draw([Math.sin(t * 1.2) * S * 0.75]);
    });

    for (const [id, rings] of [['bend-few', 2], ['bend-many', 10]]) {
        b.panel(id, p => {
            const heights = [...Array(rings).keys()].map(i => -0.9 + (1.8 * i) / (rings - 1));
            const body = solid(new THREE.BufferGeometry(), COLORS.body, { flatShading: true });
            const edges = lines(new THREE.BufferGeometry(), 0x000000, 0.45);
            const path = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: COLORS.hi, depthTest: false }));
            path.renderOrder = 1;
            p.root.add(body, edges, path);
            p.root.position.x = -0.3;
            return t => {
                const angle = holdPingPong(t, 5) * Math.PI * 0.6;
                const m = bent(heights, angle);
                setGeometry(body, toGeometry(m));
                setGeometry(edges, toEdges(m));
                setGeometry(path, bendPath(heights.at(-1), angle));
            };
        }, { spin: 0, cam: [0, 0.4, 4] });
    }

    return b.stop;
}
