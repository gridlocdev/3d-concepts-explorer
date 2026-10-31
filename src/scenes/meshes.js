// Scenes for meshes.html. start() builds them; the returned stop() tears them down.
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

        // Setup scene
        const geometry = new THREE.IcosahedronGeometry(1.2, 1);

        // Left: Solid mesh (the finished object)
        const solidMaterial = new THREE.MeshStandardMaterial({ color: 0x4488ff });
        const solidMesh = new THREE.Mesh(geometry, solidMaterial);
        solidMesh.position.x = -3;
        scene.add(solidMesh);

        // Middle: Wireframe (showing edges)
        const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
        wireframeMesh.position.x = 0;
        scene.add(wireframeMesh);

        // Right: Vertices (the points)
        const vertices = geometry.attributes.position;
        const pointsGeometry = new THREE.BufferGeometry();
        pointsGeometry.setAttribute('position', vertices);
        const pointsMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 0.15 });
        const points = new THREE.Points(pointsGeometry, pointsMaterial);
        points.position.x = 3;
        scene.add(points);

        // Also show wireframe faintly on the points view for context
        const contextWire = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
            color: 0x444444,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        }));
        contextWire.position.x = 3;
        scene.add(contextWire);

        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        // Animation
        function animate() {
            scope.raf(animate);

            solidMesh.rotation.x += 0.01;
            solidMesh.rotation.y += 0.01;
            wireframeMesh.rotation.x += 0.01;
            wireframeMesh.rotation.y += 0.01;
            points.rotation.x += 0.01;
            points.rotation.y += 0.01;
            contextWire.rotation.x += 0.01;
            contextWire.rotation.y += 0.01;

            renderer.render(scene, camera);
        }

        // Handle resize
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

        // Left: Low-poly sphere
        const lowPolyGeometry = new THREE.SphereGeometry(1.3, 8, 8);
        const lowPolyMaterial = new THREE.MeshStandardMaterial({ color: 0xff6600 });
        const lowPolySphere = new THREE.Mesh(lowPolyGeometry, lowPolyMaterial);
        lowPolySphere.position.x = -2;
        scene.add(lowPolySphere);

        // Wireframe for low-poly to show structure
        const lowPolyWireGeometry = lowPolyGeometry.clone();
        const lowPolyWireMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const lowPolyWire = new THREE.Mesh(lowPolyWireGeometry, lowPolyWireMaterial);
        lowPolyWire.position.x = -2;
        scene.add(lowPolyWire);

        // Right: High-poly sphere
        const highPolyGeometry = new THREE.SphereGeometry(1.3, 32, 32);
        const highPolyMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
        const highPolySphere = new THREE.Mesh(highPolyGeometry, highPolyMaterial);
        highPolySphere.position.x = 2;
        scene.add(highPolySphere);

        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            lowPolySphere.rotation.x += 0.01;
            lowPolySphere.rotation.y += 0.01;
            lowPolyWire.rotation.x += 0.01;
            lowPolyWire.rotation.y += 0.01;
            highPolySphere.rotation.x += 0.01;
            highPolySphere.rotation.y += 0.01;
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
