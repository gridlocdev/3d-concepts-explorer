// Scenes for normals.html. start() builds them; the returned stop() tears them down.
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

        const geometry = new THREE.BoxGeometry(2, 2, 2);

        // Left: Correct normals (normal rendering)
        const correctMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            side: THREE.FrontSide
        });
        const correctMesh = new THREE.Mesh(geometry, correctMaterial);
        correctMesh.position.x = -2.5;
        scene.add(correctMesh);

        // Right: Flipped normals (back faces only)
        const flippedMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            side: THREE.BackSide
        });
        const flippedMesh = new THREE.Mesh(geometry, flippedMaterial);
        flippedMesh.position.x = 2.5;
        scene.add(flippedMesh);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            correctMesh.rotation.y += 0.01;
            flippedMesh.rotation.y += 0.01;
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

        // Left: Flat shading (faceted appearance)
        const flatGeometry = new THREE.IcosahedronGeometry(1.5, 1);
        const flatMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            flatShading: true
        });
        const flatMesh = new THREE.Mesh(flatGeometry, flatMaterial);
        flatMesh.position.x = -2;
        scene.add(flatMesh);

        // Right: Smooth shading (interpolated normals)
        const smoothGeometry = new THREE.IcosahedronGeometry(1.5, 1);
        const smoothMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            flatShading: false
        });
        const smoothMesh = new THREE.Mesh(smoothGeometry, smoothMaterial);
        smoothMesh.position.x = 2;
        scene.add(smoothMesh);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            flatMesh.rotation.y += 0.01;
            flatMesh.rotation.x += 0.005;
            smoothMesh.rotation.y += 0.01;
            smoothMesh.rotation.x += 0.005;
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
