// Panels for camera.html.
import * as THREE from 'three';
import { createBrochure, COLORS, solid } from '../components/brochure.js';

// Vertical field of view of a lens on a full-frame (24mm tall) sensor.
const fovFor = mm => THREE.MathUtils.radToDeg(2 * Math.atan(12 / mm));

// A subject in front of a row of pillars going back into the distance.
function street(root) {
    const floor = new THREE.GridHelper(30, 30, 0x3a3a3a, 0x2a2a2a);
    floor.position.set(0, -0.5, -8);
    root.add(floor);
    root.add(solid(new THREE.SphereGeometry(0.5, 48, 24), COLORS.hi));
    for (let i = 0; i < 6; i++) {
        const pillar = solid(new THREE.BoxGeometry(0.4, 2, 0.4), COLORS.body);
        pillar.position.set(i % 2 ? 1.1 : -1.1, 0.5, -2 - i * 2);
        root.add(pillar);
    }
}

export function start() {
    const b = createBrochure();

    b.panel('frustum', p => {
        const subject = solid(new THREE.TorusKnotGeometry(0.35, 0.12, 100, 16), COLORS.hi);
        p.root.add(subject);
        for (const [x, z] of [[-1.6, -0.8], [1.8, -1.2], [-0.4, 1.8]]) {
            const box = solid(new THREE.BoxGeometry(0.4, 0.4, 0.4), COLORS.body);
            box.position.set(x, 0, z);
            p.root.add(box);
        }
        // The camera being shown: a body, a lens, and its frustum.
        const shot = new THREE.PerspectiveCamera(30, 4 / 3, 0.3, 4);
        const rig = new THREE.Group();
        const body = solid(new THREE.BoxGeometry(0.3, 0.22, 0.35), 0x777777);
        const lens = solid(new THREE.CylinderGeometry(0.08, 0.1, 0.15, 20), 0x444444);
        lens.rotation.x = Math.PI / 2;
        lens.position.z = -0.24;
        rig.add(body, lens, shot);
        p.root.add(rig);
        const helper = new THREE.CameraHelper(shot);
        p.scene.add(helper);
        return t => {
            const a = t * 0.3;
            rig.position.set(Math.sin(a) * 2.6, 0.9, Math.cos(a) * 2.6);
            rig.lookAt(p.root.localToWorld(new THREE.Vector3()));
            rig.updateMatrixWorld();
            helper.update();
        };
    }, { spin: 0, cam: [5.5, 4, 6], target: [0, 0, 0] });

    b.panel('perspective', p => {
        street(p.root);
        p.camera.position.set(2.4, 1.3, 3.5);
        p.camera.lookAt(0, 0.4, -5);
    }, { spin: 0, drag: false, fov: 40 });

    b.panel('orthographic', p => {
        street(p.root);
        const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
        ortho.userData.size = 6;
        ortho.position.set(2.4, 1.3, 3.5).multiplyScalar(4);
        ortho.lookAt(0, 0.4, -5);
        p.camera = ortho;
    }, { spin: 0, drag: false });

    // The same framing of the subject through three lenses: the camera backs
    // off as the lens gets longer, so the subject stays the same size.
    for (const [id, mm] of [['wide', 18], ['normal', 50], ['tele', 135]]) {
        b.panel(id, p => {
            street(p.root);
            const fov = fovFor(mm);
            const distance = 1.7 / Math.tan(THREE.MathUtils.degToRad(fov / 2));
            p.camera.fov = fov;
            p.camera.far = 200;
            p.camera.position.set(0.25, 0.1, distance);
            p.camera.lookAt(0, 0.25, 0);
            p.camera.updateProjectionMatrix();
        }, { spin: 0, drag: false });
    }

    return b.stop;
}
