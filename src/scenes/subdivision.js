// Scenes for subdivision.html. start() builds them; the returned stop() tears them down.
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

        const baseGeometry = new THREE.BoxGeometry(2, 2, 2);

        const lowPolyMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            flatShading: true
        });
        const lowPolyMesh = new THREE.Mesh(baseGeometry, lowPolyMaterial);
        lowPolyMesh.position.x = -2.5;
        scene.add(lowPolyMesh);

        const subdividedGeometry = new THREE.SphereGeometry(1.4, 32, 32);
        const subdividedMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88
        });
        const subdividedMesh = new THREE.Mesh(subdividedGeometry, subdividedMaterial);
        subdividedMesh.position.x = 2.5;
        scene.add(subdividedMesh);

        const wireGeometry = subdividedGeometry.clone();
        const wireMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
        wireMesh.position.x = 2.5;
        scene.add(wireMesh);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x606060);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            lowPolyMesh.rotation.x += 0.01;
            lowPolyMesh.rotation.y += 0.01;
            subdividedMesh.rotation.x += 0.01;
            subdividedMesh.rotation.y += 0.01;
            wireMesh.rotation.x += 0.01;
            wireMesh.rotation.y += 0.01;
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

        // Left: Fully smooth subdivision (like a sphere)
        const smoothGeometry = new THREE.SphereGeometry(1, 32, 32);
        const smoothMaterial = new THREE.MeshStandardMaterial({ color: 0xff6600 });
        const smoothMesh = new THREE.Mesh(smoothGeometry, smoothMaterial);
        smoothMesh.position.x = -2.5;
        scene.add(smoothMesh);

        // Middle: Subdivided with sharp edges (using higher detail box)
        const sharpGeometry = new THREE.BoxGeometry(1.8, 1.8, 1.8, 8, 8, 8);
        const sharpMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
        const sharpMesh = new THREE.Mesh(sharpGeometry, sharpMaterial);
        sharpMesh.position.x = 0;
        scene.add(sharpMesh);

        // Right: Mixed - rounded box (using TorusBox-like shape)
        const mixedGeometry = new THREE.BoxGeometry(1.8, 1.8, 1.8, 4, 4, 4);
        // Apply some smoothing to make it partially rounded
        const positionAttribute = mixedGeometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const z = positionAttribute.getZ(i);
            const length = Math.sqrt(x * x + y * y + z * z);
            const factor = 0.3; // How much to round
            positionAttribute.setXYZ(
                i,
                x + (x / length - x) * factor,
                y + (y / length - y) * factor,
                z + (z / length - z) * factor
            );
        }
        mixedGeometry.computeVertexNormals();

        const mixedMaterial = new THREE.MeshStandardMaterial({ color: 0x4488ff });
        const mixedMesh = new THREE.Mesh(mixedGeometry, mixedMaterial);
        mixedMesh.position.x = 2.5;
        scene.add(mixedMesh);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x606060);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            smoothMesh.rotation.x += 0.01;
            smoothMesh.rotation.y += 0.01;
            sharpMesh.rotation.x += 0.01;
            sharpMesh.rotation.y += 0.01;
            mixedMesh.rotation.x += 0.01;
            mixedMesh.rotation.y += 0.01;
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
