// Scenes for camera.html. start() builds them; the returned stop() tears them down.
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

        const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
        const torusMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            roughness: 0.3,
            metalness: 0.7
        });
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        scene.add(torus);

        const cameraHelper = new THREE.CameraHelper(
            new THREE.PerspectiveCamera(50, 1, 0.1, 10)
        );
        cameraHelper.position.set(2, 1.5, 3);
        cameraHelper.lookAt(0, 0, 0);
        scene.add(cameraHelper);

        const cameraBoxGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.2);
        const cameraBoxMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 });
        const cameraBox = new THREE.Mesh(cameraBoxGeometry, cameraBoxMaterial);
        cameraBox.position.copy(cameraHelper.position);
        scene.add(cameraBox);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x505050);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        let angle = 0;
        function animate() {
            scope.raf(animate);
            torus.rotation.x += 0.01;
            torus.rotation.y += 0.005;

            angle += 0.005;
            cameraHelper.position.x = Math.cos(angle) * 3;
            cameraHelper.position.z = Math.sin(angle) * 3;
            cameraHelper.lookAt(0, 0, 0);
            cameraBox.position.copy(cameraHelper.position);
            cameraHelper.update();

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

        // Create a ground plane for reference
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = Math.PI / 2;
        ground.position.y = -1.5;
        scene.add(ground);

        // Create foreground object (sphere)
        const foregroundGeometry = new THREE.SphereGeometry(0.6, 32, 32);
        const foregroundMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
        const foregroundSphere = new THREE.Mesh(foregroundGeometry, foregroundMaterial);
        foregroundSphere.position.set(0, 0, 0);
        scene.add(foregroundSphere);

        // Create background objects (cubes at different distances)
        for (let i = 0; i < 3; i++) {
            const bgGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const bgMaterial = new THREE.MeshStandardMaterial({ color: 0xff6600 });
            const bgCube = new THREE.Mesh(bgGeometry, bgMaterial);
            bgCube.position.set((i - 1) * 2, 0, -4 - i * 2);
            scene.add(bgCube);
        }

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x505050);
        scene.add(ambientLight);

        // We'll cycle through three different FOV values
        const fovValues = [
            { fov: 90, name: '18mm (Wide)', distance: 2.5 },      // Wide angle
            { fov: 45, name: '50mm (Normal)', distance: 4 },    // Normal
            { fov: 20, name: '135mm (Tele)', distance: 6.5 }     // Telephoto
        ];

        let currentFovIndex = 0;
        let transitionTime = 0;
        const transitionDuration = 3; // seconds

        camera.position.set(0, 1, fovValues[0].distance);
        camera.lookAt(0, 0, 0);
        camera.fov = fovValues[0].fov;
        camera.updateProjectionMatrix();

        function animate() {
            scope.raf(animate);

            transitionTime += 0.016; // ~60fps

            if (transitionTime >= transitionDuration) {
                transitionTime = 0;
                currentFovIndex = (currentFovIndex + 1) % fovValues.length;

                camera.fov = fovValues[currentFovIndex].fov;
                camera.position.z = fovValues[currentFovIndex].distance;
                camera.updateProjectionMatrix();
            }

            foregroundSphere.rotation.y += 0.01;

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
