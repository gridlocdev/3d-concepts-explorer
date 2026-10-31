// Panels for transformations.html. Each shows a faint ghost where the cube
// started, so the change is easy to see.
import * as THREE from 'three';
import { createBrochure, COLORS, lines, solid, arrow, dots, holdPingPong } from '../components/brochure.js';

const box = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const ghost = () => lines(new THREE.EdgesGeometry(box), COLORS.faint);

function cube() {
    const g = new THREE.Group();
    g.add(solid(box, COLORS.body), lines(new THREE.EdgesGeometry(box), 0x000000, 0.4));
    return g;
}

function ring(color, axis) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.015, 8, 64), new THREE.MeshBasicMaterial({ color }));
    if (axis === 'x') r.rotation.y = Math.PI / 2;
    if (axis === 'y') r.rotation.x = Math.PI / 2;
    return r;
}

function pivotDot() {
    const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
    const d = dots(geo, COLORS.hi, 12);
    d.material.depthTest = false;
    d.renderOrder = 5;
    return d;
}

export function start() {
    const b = createBrochure();
    const view = { spin: 0, cam: [1.6, 1.5, 3.4], target: [0.3, 0, 0] };

    b.panel('move', p => {
        const c = cube();
        c.add(arrow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0), 0.9, COLORS.x));
        c.add(arrow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 0.9, COLORS.y));
        c.add(arrow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1), 0.9, COLORS.z));
        p.root.add(ghost(), c);
        return t => { c.position.x = holdPingPong(t) * 1.1; };
    }, view);

    b.panel('rotate', p => {
        const c = cube();
        p.root.add(ghost(), c, ring(COLORS.x, 'x'), ring(COLORS.y, 'y'), ring(COLORS.z, 'z'));
        return t => { c.rotation.y = holdPingPong(t) * Math.PI / 2; };
    }, { ...view, target: [0, 0, 0] });

    b.panel('scale', p => {
        const c = cube();
        p.root.add(ghost(), c);
        return t => { c.scale.setScalar(1 + holdPingPong(t) * 0.6); };
    }, { ...view, target: [0, 0, 0] });

    b.panel('scale-axis', p => {
        const c = cube();
        c.position.y = 0; // pivot at the center, so it grows both ways
        p.root.add(ghost(), c);
        p.root.add(arrow(new THREE.Vector3(0.75, 0, 0), new THREE.Vector3(0, 1, 0), 0.6, COLORS.y));
        p.root.add(arrow(new THREE.Vector3(0.75, 0, 0), new THREE.Vector3(0, -1, 0), 0.6, COLORS.y));
        return t => { c.scale.y = 1 + holdPingPong(t) * 1.2; };
    }, { ...view, target: [0, 0, 0] });

    b.panel('pivot-center', p => {
        const c = cube();
        p.root.add(ghost(), c, pivotDot());
        return t => { c.rotation.z = holdPingPong(t) * Math.PI / 2; };
    }, { spin: 0, cam: [0, 0.4, 4.2] });

    b.panel('pivot-corner', p => {
        // The cube hangs off a pivot group placed at its bottom-left corner.
        const pivot = new THREE.Group();
        pivot.position.set(-0.4, -0.4, 0);
        const c = cube();
        c.position.set(0.4, 0.4, 0);
        pivot.add(c);
        const dot = pivotDot();
        dot.position.copy(pivot.position);
        p.root.add(ghost(), pivot, dot);
        return t => { pivot.rotation.z = holdPingPong(t) * Math.PI / 2; };
    }, { spin: 0, cam: [0, 0.4, 4.2] });

    return b.stop;
}
