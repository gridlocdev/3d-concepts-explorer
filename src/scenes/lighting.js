// Panels for lighting.html. Each panel has only the lights it describes.
import * as THREE from 'three';
import { createBrochure, arrow } from '../components/brochure.js';

// A ball and a block on a floor, all casting and receiving shadows.
function set(p) {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.4, 48, 24), new THREE.MeshStandardMaterial({ color: 0xd8d0c4, roughness: 0.5 }));
    ball.position.set(-0.45, 0.4, 0.1);
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.8, 0.55), new THREE.MeshStandardMaterial({ color: 0x4a7fd6, roughness: 0.5 }));
    block.position.set(0.45, 0.4, -0.15);
    block.rotation.y = 0.5;
    for (const o of [ball, block]) {
        o.castShadow = true;
        o.receiveShadow = true;
    }
    p.root.add(floor, ball, block);
}

function shadows(light, radius = 2) {
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    light.shadow.radius = radius;
    light.shadow.bias = -0.0005;
    return light;
}

// A small glowing ball that shows where a light is.
function bulb(color = 0xffffff) {
    return new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 8), new THREE.MeshBasicMaterial({ color }));
}

export function start() {
    const b = createBrochure();
    const view = { lights: false, cam: [0, 2.2, 3.6], target: [0, 0.3, 0], spin: 0.15 };
    const portrait = { lights: false, cam: [0, 0.2, 3.4], target: [0, 0, 0], spin: 0 };

    b.panel('point', p => {
        set(p);
        const light = shadows(new THREE.PointLight(0xffd9a0, 6, 0, 1.5));
        light.position.set(0.1, 1.3, 0.6);
        light.add(bulb(0xffd9a0));
        p.scene.add(light, new THREE.HemisphereLight(0xffffff, 0x000000, 0.08));
    }, view);

    b.panel('directional', p => {
        set(p);
        const dir = new THREE.Vector3(-2, -2.4, -0.4).normalize();
        const light = shadows(new THREE.DirectionalLight(0xffffff, 2.5));
        light.position.copy(dir.clone().multiplyScalar(-4));
        Object.assign(light.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 });
        p.scene.add(light, new THREE.HemisphereLight(0xffffff, 0x000000, 0.08));
        // Parallel arrows: every ray comes from the same direction.
        for (const x of [-0.9, 0, 0.9]) {
            p.scene.add(arrow(new THREE.Vector3(x + 0.9, 1.45, 0.3), dir, 0.55, 0xffe08a));
        }
    }, view);

    b.panel('spot', p => {
        set(p);
        const light = shadows(new THREE.SpotLight(0xffffff, 18, 0, 0.42, 0.25, 1.5));
        light.position.set(1.1, 2.3, 1);
        light.add(bulb());
        p.scene.add(light, light.target, new THREE.HemisphereLight(0xffffff, 0x000000, 0.06));
    }, view);

    b.panel('hemisphere', p => {
        set(p);
        p.scene.add(new THREE.HemisphereLight(0x9cc4ff, 0x7a4a26, 1.5));
    }, view);

    for (const [id, radius, size] of [['hard', 1, 2048], ['soft', 10, 512]]) {
        b.panel(id, p => {
            set(p);
            const light = shadows(new THREE.SpotLight(0xffffff, 16, 0, 0.6, 0.4, 1.5), radius);
            light.shadow.mapSize.set(size, size);
            light.position.set(1.2, 2.4, 0.9);
            p.scene.add(light, light.target, new THREE.HemisphereLight(0xffffff, 0x000000, 0.12));
        }, view);
    }

    // Three-point lighting on one bust, adding a light per panel.
    const lights = {
        key: () => { const l = new THREE.DirectionalLight(0xfff1e0, 3); l.position.set(2.5, 1.5, 1.5); return l; },
        fill: () => { const l = new THREE.DirectionalLight(0xdfe8ff, 0.8); l.position.set(-2.5, 0.5, 2); return l; },
        rim: () => { const l = new THREE.DirectionalLight(0xd6e4ff, 14); l.position.set(-3, 1.8, -1.6); return l; },
    };
    const order = ['key', 'fill', 'rim'];
    order.forEach((id, i) => {
        b.panel(id, p => {
            p.scene.background = new THREE.Color(0x0c0c0c);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 64, 32), new THREE.MeshStandardMaterial({ color: 0xc9a68a, roughness: 0.55 }));
            const nose = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 24), head.material);
            nose.rotation.x = Math.PI / 2;
            nose.position.set(0, -0.05, 0.75);
            p.root.add(head, nose);
            p.root.rotation.y = -0.35;
            for (const name of order.slice(0, i + 1)) p.scene.add(lights[name]());
        }, portrait);
    });

    return b.stop;
}
