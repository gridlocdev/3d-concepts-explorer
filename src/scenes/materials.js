// Scenes for materials.html. start() builds them; the returned stop() tears them down.
import * as THREE from 'three';
import { createScope } from '../components/scene-scope.js';

export function start() {
    const scope = createScope();

    function initScene() {
        const canvas = document.getElementById('three-canvas');
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a);

        const camera = new THREE.PerspectiveCamera(
            50,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000
        );

        const renderer = scope.renderer({ canvas, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);

        const materials = [
            new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.1, metalness: 0.9 }),
            new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.8, metalness: 0.2 }),
            new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.3, metalness: 0.0, transparent: true, opacity: 0.6 })
        ];

        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const spheres = [];

        materials.forEach((material, index) => {
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.x = (index - 1) * 2.5;
            scene.add(sphere);
            spheres.push(sphere);
        });

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x606060);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            spheres.forEach(sphere => {
                sphere.rotation.y += 0.01;
            });
            renderer.render(scene, camera);
        }

        scope.on(window, 'resize', () => {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });

        animate();
    }

    function initScene2() {
        const canvas = document.getElementById('three-canvas-2');
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a);

        const camera = new THREE.PerspectiveCamera(
            50,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000
        );

        const renderer = scope.renderer({ canvas, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);

        const geometry = new THREE.SphereGeometry(1, 32, 32);

        // Left: Rough plastic (matte, non-metallic)
        const plasticMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.9,
            metalness: 0.0
        });
        const plasticSphere = new THREE.Mesh(geometry, plasticMaterial);
        plasticSphere.position.x = -2.5;
        scene.add(plasticSphere);

        // Middle: Polished metal (reflective, metallic)
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.1,
            metalness: 1.0
        });
        const metalSphere = new THREE.Mesh(geometry, metalMaterial);
        metalSphere.position.x = 0;
        scene.add(metalSphere);

        // Right: Glossy plastic (smooth, non-metallic)
        const glossyMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.2,
            metalness: 0.0
        });
        const glossySphere = new THREE.Mesh(geometry, glossyMaterial);
        glossySphere.position.x = 2.5;
        scene.add(glossySphere);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x606060);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            plasticSphere.rotation.y += 0.01;
            metalSphere.rotation.y += 0.01;
            glossySphere.rotation.y += 0.01;
            renderer.render(scene, camera);
        }

        scope.on(window, 'resize', () => {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });

        animate();
    }

    initScene();
    initScene2();
    return scope.stop;
}
