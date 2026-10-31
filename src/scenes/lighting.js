// Scenes for lighting.html. start() builds them; the returned stop() tears them down.
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

        const geometry = new THREE.TorusKnotGeometry(1.2, 0.4, 100, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            roughness: 0.5,
            metalness: 0.3
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const lights = [];

        const pointLight = new THREE.PointLight(0xffaa00, 2, 100);
        pointLight.position.set(3, 3, 3);
        lights.push(pointLight);

        const dirLight = new THREE.DirectionalLight(0x00aaff, 1.5);
        dirLight.position.set(-5, 5, 2);
        lights.push(dirLight);

        const hemiLight = new THREE.HemisphereLight(0xff00ff, 0x00ffff, 1.5);
        lights.push(hemiLight);

        const ambientLight = new THREE.AmbientLight(0x222222);
        scene.add(ambientLight);

        let currentLightIndex = 0;
        scene.add(lights[0]);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        let lightChangeTimer = 0;
        function animate() {
            scope.raf(animate);
            mesh.rotation.x += 0.005;
            mesh.rotation.y += 0.01;

            lightChangeTimer += 0.016;
            if (lightChangeTimer > 3) {
                lightChangeTimer = 0;
                scene.remove(lights[currentLightIndex]);
                currentLightIndex = (currentLightIndex + 1) % lights.length;
                scene.add(lights[currentLightIndex]);
            }

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

        const geometry = new THREE.SphereGeometry(1.5, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.7,
            metalness: 0.1
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Key Light - main light (bright, from upper right)
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
        keyLight.position.set(5, 5, 3);
        scene.add(keyLight);

        // Fill Light - softer, fills shadows (dimmer, from left)
        const fillLight = new THREE.DirectionalLight(0xaaccff, 0.5);
        fillLight.position.set(-3, 2, 3);
        scene.add(fillLight);

        // Rim/Back Light - creates edge highlight (from behind)
        const rimLight = new THREE.DirectionalLight(0xffffaa, 0.8);
        rimLight.position.set(-2, 1, -4);
        scene.add(rimLight);

        // Minimal ambient to prevent pure black
        const ambientLight = new THREE.AmbientLight(0x202020);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            sphere.rotation.y += 0.003;
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
