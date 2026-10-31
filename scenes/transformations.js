// Scenes for transformations.html. start() builds them; the returned stop() tears them down.
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

        const geometry = new THREE.BoxGeometry(1, 1, 1);

        // Left: Move transformation
        const moveMaterial = new THREE.MeshStandardMaterial({ color: 0xff6600 });
        const moveCube = new THREE.Mesh(geometry, moveMaterial);
        moveCube.position.x = -3;
        scene.add(moveCube);

        // Middle: Rotation transformation
        const rotateMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
        const rotateCube = new THREE.Mesh(geometry, rotateMaterial);
        rotateCube.position.x = 0;
        scene.add(rotateCube);

        // Right: Scale transformation
        const scaleMaterial = new THREE.MeshStandardMaterial({ color: 0x4488ff });
        const scaleCube = new THREE.Mesh(geometry, scaleMaterial);
        scaleCube.position.x = 3;
        scene.add(scaleCube);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x606060);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        let time = 0;
        function animate() {
            scope.raf(animate);
            time += 0.02;

            // Animate movement (G)
            moveCube.position.y = Math.sin(time) * 0.5;

            // Animate rotation (R)
            rotateCube.rotation.x += 0.01;
            rotateCube.rotation.y += 0.02;

            // Animate scale (S)
            const scale = 1 + Math.sin(time) * 0.3;
            scaleCube.scale.set(scale, scale, scale);

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

        const geometry = new THREE.BoxGeometry(1, 1, 1);

        // Left: Free rotation (unconstrained)
        const freeMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa00 }); // Yellow-orange
        const freeCube = new THREE.Mesh(geometry, freeMaterial);
        freeCube.position.x = -3;
        scene.add(freeCube);

        // Middle: Y-axis constrained rotation
        const yAxisMaterial = new THREE.MeshStandardMaterial({ color: 0x00dddd }); // Cyan
        const yAxisCube = new THREE.Mesh(geometry, yAxisMaterial);
        yAxisCube.position.x = 0;
        scene.add(yAxisCube);

        // Right: Z-axis constrained movement
        const zAxisMaterial = new THREE.MeshStandardMaterial({ color: 0xff00ff }); // Magenta
        const zAxisCube = new THREE.Mesh(geometry, zAxisMaterial);
        zAxisCube.position.x = 3;
        scene.add(zAxisCube);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x606060);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        let time = 0;
        function animate() {
            scope.raf(animate);
            time += 0.02;

            // Free rotation - rotates on multiple axes
            freeCube.rotation.x += 0.01;
            freeCube.rotation.y += 0.015;
            freeCube.rotation.z += 0.008;

            // Y-axis constrained - only rotates around Y
            yAxisCube.rotation.y += 0.02;

            // Z-axis constrained movement - only moves up/down
            zAxisCube.position.y = Math.sin(time) * 0.8;

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
