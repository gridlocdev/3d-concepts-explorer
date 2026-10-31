// Panels for materials.html. Every panel lights its objects with the same
// soft studio reflection (brochure.js environment) so metals and glossy
// surfaces have something to reflect.
import * as THREE from 'three';
import { createBrochure, label, checkerTexture } from '../components/brochure.js';

const sphere = new THREE.SphereGeometry(0.42, 64, 32);

// A row of spheres, each with a label under it.
function row(p, items, gap = 1.05) {
    p.scene.environment = p.environment();
    items.forEach(([params, text], i) => {
        const ball = new THREE.Mesh(sphere, new THREE.MeshPhysicalMaterial(params));
        ball.position.x = (i - (items.length - 1) / 2) * gap;
        p.root.add(ball);
        if (text) {
            const tag = label(text, { size: 0.18 });
            tag.position.set(ball.position.x, -0.68, 0);
            p.root.add(tag);
        }
    });
}

export function start() {
    const b = createBrochure();
    const flat = { spin: 0, cam: [0, 0.35, 3.6], target: [0, -0.1, 0] };
    const wide = { spin: 0, cam: [0, 0.35, 4.4], target: [0, -0.1, 0] };

    b.panel('roughness', p => {
        row(p, [0, 0.25, 0.5, 0.75, 1].map(r => [{ color: 0x2a5aa8, roughness: r }, String(r)]));
    }, wide);

    b.panel('metallic', p => {
        row(p, [
            [{ color: 0xd9822b, roughness: 0.3, metalness: 0 }, 'Metallic 0'],
            [{ color: 0xd9822b, roughness: 0.3, metalness: 1 }, 'Metallic 1'],
        ], 1.2);
    }, flat);

    b.panel('base-color', p => {
        row(p, [
            [{ color: 0xc8372d, roughness: 0.5 }],
            [{ color: 0xe8b82a, roughness: 0.5 }],
            [{ color: 0x2f6fd0, roughness: 0.5 }],
        ], 0.95);
    }, flat);

    b.panel('glass', p => {
        p.scene.environment = p.environment();
        // A checker wall behind shows the glass bending what's behind it.
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), new THREE.MeshBasicMaterial({ map: checkerTexture(10) }));
        wall.position.z = -1.2;
        p.scene.add(wall);
        p.root.add(new THREE.Mesh(new THREE.SphereGeometry(0.65, 64, 32), new THREE.MeshPhysicalMaterial({
            color: 0xffffff, roughness: 0.02, transmission: 1, thickness: 1.2, ior: 1.5,
        })));
    }, { spin: 0, cam: [0, 0, 3.4] });

    b.panel('emission', p => {
        row(p, [
            [{ color: 0x222222, emissive: 0xff6a10, emissiveIntensity: 1.2, roughness: 0.6 }, 'Emissive'],
            [{ color: 0x222222, roughness: 0.6 }, 'Not emissive'],
        ], 1.2);
    }, flat);

    b.panel('real', p => {
        row(p, [
            [{ color: 0x1c1c1c, roughness: 0.9 }, 'Rubber'],
            [{ color: 0xffc356, roughness: 0.25, metalness: 1 }, 'Gold'],
            [{ color: 0xffffff, roughness: 0.04, metalness: 1 }, 'Chrome'],
            [{ color: 0xb5603a, roughness: 1 }, 'Clay'],
        ], 1.15);
    }, wide);

    return b.stop;
}
