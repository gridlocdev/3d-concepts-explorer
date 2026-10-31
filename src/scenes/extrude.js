// Panels for extrude.html. Every shape is rebuilt with real extrusions on a
// polygon mesh (components/mesh-kit.js), the way a modeling tool does it.
import * as THREE from 'three';
import { createBrochure, COLORS, lines, solid, dots, holdPingPong } from '../components/brochure.js';
import { cube, clone, extrudeFace, faceNormal, toGeometry, toEdges, toPoints, setGeometry } from '../components/mesh-kit.js';

// boxGrid's face order for a plain cube: -X, +X, -Y, +Y, -Z, +Z.
const TOP = 3;
const RIGHT = 1;

// A mesh drawn flat-shaded, with the given faces highlighted, plus edges.
function meshView(root) {
    const body = solid(new THREE.BufferGeometry(), 0xffffff, { vertexColors: true, flatShading: true });
    const edges = lines(new THREE.BufferGeometry(), 0x000000, 0.45);
    root.add(body, edges);
    return (m, highlight = []) => {
        const faceColors = Object.fromEntries(highlight.map(fi => [fi, COLORS.hi]));
        setGeometry(body, toGeometry(m, { color: COLORS.body, faceColors }));
        setGeometry(edges, toEdges(m));
    };
}

export function start() {
    const b = createBrochure();
    const base = cube(0.9);
    if (faceNormal(base, TOP)[1] < 0.99 || faceNormal(base, RIGHT)[0] < 0.99) {
        console.warn('extrude: cube face order changed');
    }

    b.panel('face', p => {
        p.root.position.y = -0.35;
        const draw = meshView(p.root);
        return t => {
            const m = clone(base);
            extrudeFace(m, TOP, holdPingPong(t, 4) * 0.9);
            draw(m, [TOP]);
        };
    }, { cam: [0, 1.5, 3.6], target: [0, 0.1, 0] });

    b.panel('steps', p => {
        p.root.position.y = -0.7;
        const draw = meshView(p.root);
        let shown = -1;
        return t => {
            const rounds = Math.floor(t / 0.9) % 6; // 0..4 rounds, then hold
            const n = Math.min(rounds, 4);
            if (n === shown) return;
            shown = n;
            const m = clone(base);
            for (let i = 0; i < n; i++) extrudeFace(m, TOP, 0.35, 0.72);
            draw(m, [TOP]);
        };
    }, { cam: [0, 1.6, 4.2], target: [0, 0.1, 0] });

    b.panel('branch', p => {
        p.root.position.set(-0.45, -0.35, 0);
        const draw = meshView(p.root);
        return t => {
            const k = holdPingPong(t, 5);
            const m = clone(base);
            extrudeFace(m, RIGHT, Math.min(k * 2, 1) * 0.9);
            let tip = RIGHT;
            if (k > 0.5) {
                // The top of the new part: the new side quad facing +Y.
                tip = m.f.findIndex((f, fi) => fi !== TOP && faceNormal(m, fi)[1] > 0.99 && f.every(i => m.v[i][0] > 0.44));
                extrudeFace(m, tip, (k - 0.5) * 2 * 0.9);
            }
            draw(m, [tip]);
        };
    }, { cam: [0.6, 1.5, 4], target: [0.2, 0.2, 0] });

    b.panel('edge', p => {
        // A flat square; its back edge rises to make a new face.
        const plane = { v: [[-0.6, 0, 0.6], [0.6, 0, 0.6], [0.6, 0, -0.6], [-0.6, 0, -0.6]], f: [[0, 1, 2, 3]] };
        p.root.position.y = -0.3;
        const body = solid(toGeometry(plane), COLORS.body, { side: THREE.DoubleSide });
        const wall = solid(new THREE.BufferGeometry(), COLORS.hi, { side: THREE.DoubleSide });
        const edges = lines(new THREE.BufferGeometry(), COLORS.edge);
        p.root.add(body, wall, edges);
        return t => {
            const h = holdPingPong(t, 4) * 0.9;
            const m = { v: [...plane.v, [0.6, h, -0.6], [-0.6, h, -0.6]], f: [[0, 1, 2, 3], [3, 2, 4, 5]] };
            setGeometry(wall, toGeometry({ v: m.v, f: [m.f[1]] }));
            setGeometry(edges, toEdges(m));
        };
    }, { cam: [1.2, 1.6, 3.2], target: [0, 0.1, 0] });

    b.panel('vertex', p => {
        // A chain of vertices, each extruded from the last.
        const path = [[-0.9, -0.5, 0], [-0.4, -0.2, 0.2], [0, 0.3, 0], [0.5, 0.5, -0.2], [0.9, 0.2, 0]];
        const line = lines(new THREE.BufferGeometry(), COLORS.edge);
        const pts = dots(new THREE.BufferGeometry(), COLORS.vert, 10);
        p.root.add(line, pts);
        return t => {
            const grow = (t / 0.8) % (path.length + 2);
            const n = Math.min(Math.floor(grow), path.length - 1);
            const frac = Math.min(grow - Math.floor(grow), 1);
            const v = path.slice(0, n + 1).map(q => [...q]);
            if (n < path.length - 1) {
                const a = path[n], c = path[n + 1];
                v.push(a.map((x, i) => x + (c[i] - x) * frac));
            }
            const chain = { v, f: v.slice(1).map((_, i) => [i, i + 1]) };
            setGeometry(line, toEdges(chain));
            setGeometry(pts, toPoints(chain));
        };
    }, { spin: 0.15 });

    return b.stop;
}
