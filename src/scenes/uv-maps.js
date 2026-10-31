// Panels for uv-maps.html.
import * as THREE from 'three';
import { createBrochure, lines, checkerTexture, holdPingPong } from '../components/brochure.js';

// The cube's net laid out on a 4 x 3 grid of cells: [column, row] per face.
const NET = { top: [1, 1], east: [2, 1], bottom: [3, 1], west: [0, 1], north: [1, 0], south: [1, 2] };
const HUES = { top: 210, east: 140, bottom: 30, west: 280, north: 0, south: 55 };

// One image holding all six faces: a tinted checker and a number per cell.
function netTexture() {
    const cell = 128;
    const c = document.createElement('canvas');
    c.width = cell * 4;
    c.height = cell * 3;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, c.width, c.height);
    Object.entries(NET).forEach(([face, [col, row]], n) => {
        const s = cell / 4;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.fillStyle = `hsl(${HUES[face]} 60% ${(i + j) % 2 ? 38 : 62}%)`;
                ctx.fillRect(col * cell + i * s, row * cell + j * s, s, s);
            }
        }
        ctx.fillStyle = '#fff';
        ctx.font = '600 56px -apple-system, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(n + 1), col * cell + cell / 2, row * cell + cell / 2 + 4);
    });
    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    return map;
}

// A unit square lying flat (facing +Y) whose UVs cover one cell of the net.
function netFace(map, [col, row]) {
    const geo = new THREE.PlaneGeometry(1, 1);
    geo.rotateX(-Math.PI / 2);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, (col + uv.getX(i)) / 4, 1 - (row + 1 - uv.getY(i)) / 3);
    }
    const face = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map, side: THREE.DoubleSide, roughness: 0.8 }));
    face.add(lines(new THREE.EdgesGeometry(geo), 0x000000, 0.6));
    return face;
}

export function start() {
    const b = createBrochure();

    b.panel('unfold', p => {
        // Faces hinge off the top face and fold down into a cube under it.
        const map = netTexture();
        const net = new THREE.Group();
        net.add(netFace(map, NET.top));
        const hinge = (parent, at, face) => {
            const h = new THREE.Group();
            h.position.set(...at);
            const f = netFace(map, NET[face]);
            f.position.set(at[0] ? Math.sign(at[0]) * 0.5 : 0, 0, at[2] ? Math.sign(at[2]) * 0.5 : 0);
            h.add(f);
            parent.add(h);
            return h;
        };
        const east = hinge(net, [0.5, 0, 0], 'east');
        const west = hinge(net, [-0.5, 0, 0], 'west');
        const north = hinge(net, [0, 0, -0.5], 'north');
        const south = hinge(net, [0, 0, 0.5], 'south');
        const bottom = hinge(east, [1, 0, 0], 'bottom');
        p.root.add(net);
        return t => {
            const fold = holdPingPong(t, 7);
            const a = fold * Math.PI / 2;
            east.rotation.z = -a;
            bottom.rotation.z = -a;
            west.rotation.z = a;
            south.rotation.x = a;
            north.rotation.x = -a;
            // Centered as a flat net (shifted left) and as a cube (lifted).
            net.position.set(-0.5 * (1 - fold), 0.5 * fold, 0);
        };
    }, { cam: [0, 3.4, 3.9], target: [0, 0.3, 0], spin: 0.12 });

    b.panel('cube', p => {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        p.root.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: checkerTexture(6) })));
        p.root.rotation.x = 0.35;
    });

    b.panel('sphere', p => {
        const map = checkerTexture(8);
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(2, 1); // the UVs span twice as far around as top to bottom
        p.root.add(new THREE.Mesh(new THREE.SphereGeometry(0.85, 64, 32), new THREE.MeshStandardMaterial({ map })));
        p.root.rotation.x = 0.5;
    });

    b.panel('stretched', p => {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        // BoxGeometry's +Z face is vertices 16-19; squeeze its U range.
        const uv = geo.attributes.uv;
        for (let i = 16; i < 20; i++) uv.setX(i, uv.getX(i) * 0.25);
        p.root.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: checkerTexture(6) })));
        p.root.rotation.set(0.35, -0.5, 0);
    }, { spin: 0.15 });

    b.panel('density', p => {
        [[1, -0.65], [3, 0.65]].forEach(([repeat, x]) => {
            const map = checkerTexture(4);
            map.wrapS = map.wrapT = THREE.RepeatWrapping;
            map.repeat.set(repeat, repeat);
            const box = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), new THREE.MeshStandardMaterial({ map }));
            box.position.x = x;
            box.rotation.set(0.4, 0.6, 0);
            p.root.add(box);
        });
    }, { spin: 0, cam: [0, 0.6, 3.6] });

    return b.stop;
}
