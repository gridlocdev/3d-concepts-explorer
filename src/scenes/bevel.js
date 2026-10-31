// Scenes for bevel.html. start() builds them; the returned stop() tears them down.
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

        // Sharp cube (left)
        const sharpGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const sharpMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            metalness: 0.3,
            roughness: 0.4
        });
        const sharpCube = new THREE.Mesh(sharpGeometry, sharpMaterial);
        sharpCube.position.x = -2;
        scene.add(sharpCube);

        // Beveled cube (right)
        const roundedShape = new THREE.Shape();
        const radius = 0.15;
        const size = 1.5;
        const half = size / 2;

        roundedShape.moveTo(-half + radius, -half);
        roundedShape.lineTo(half - radius, -half);
        roundedShape.quadraticCurveTo(half, -half, half, -half + radius);
        roundedShape.lineTo(half, half - radius);
        roundedShape.quadraticCurveTo(half, half, half - radius, half);
        roundedShape.lineTo(-half + radius, half);
        roundedShape.quadraticCurveTo(-half, half, -half, half - radius);
        roundedShape.lineTo(-half, -half + radius);
        roundedShape.quadraticCurveTo(-half, -half, -half + radius, -half);

        const beveledGeometry = new THREE.ExtrudeGeometry(roundedShape, {
            depth: size,
            bevelEnabled: true,
            bevelThickness: radius,
            bevelSize: radius,
            bevelSegments: 5
        });

        const beveledMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            metalness: 0.3,
            roughness: 0.4
        });
        const beveledCube = new THREE.Mesh(beveledGeometry, beveledMaterial);
        beveledCube.position.set(2, 0, -size / 2);
        scene.add(beveledCube);

        const light1 = new THREE.DirectionalLight(0xffffff, 1);
        light1.position.set(5, 5, 5);
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
        light2.position.set(-5, 3, -5);
        scene.add(light2);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            sharpCube.rotation.x += 0.008;
            sharpCube.rotation.y += 0.012;
            beveledCube.rotation.x += 0.008;
            beveledCube.rotation.y += 0.012;
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

        // Small bevel (left)
        const smallShape = new THREE.Shape();
        const smallRadius = 0.05;
        const size = 1.2;
        const half = size / 2;

        smallShape.moveTo(-half + smallRadius, -half);
        smallShape.lineTo(half - smallRadius, -half);
        smallShape.quadraticCurveTo(half, -half, half, -half + smallRadius);
        smallShape.lineTo(half, half - smallRadius);
        smallShape.quadraticCurveTo(half, half, half - smallRadius, half);
        smallShape.lineTo(-half + smallRadius, half);
        smallShape.quadraticCurveTo(-half, half, -half, half - smallRadius);
        smallShape.lineTo(-half, -half + smallRadius);
        smallShape.quadraticCurveTo(-half, -half, -half + smallRadius, -half);

        const smallBevelGeometry = new THREE.ExtrudeGeometry(smallShape, {
            depth: size,
            bevelEnabled: true,
            bevelThickness: smallRadius,
            bevelSize: smallRadius,
            bevelSegments: 2
        });

        const smallBevelMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            metalness: 0.3,
            roughness: 0.4
        });
        const smallBevelCube = new THREE.Mesh(smallBevelGeometry, smallBevelMaterial);
        smallBevelCube.position.set(-2.5, 0, -size / 2);
        scene.add(smallBevelCube);

        // Medium bevel (center)
        const mediumShape = new THREE.Shape();
        const mediumRadius = 0.12;

        mediumShape.moveTo(-half + mediumRadius, -half);
        mediumShape.lineTo(half - mediumRadius, -half);
        mediumShape.quadraticCurveTo(half, -half, half, -half + mediumRadius);
        mediumShape.lineTo(half, half - mediumRadius);
        mediumShape.quadraticCurveTo(half, half, half - mediumRadius, half);
        mediumShape.lineTo(-half + mediumRadius, half);
        mediumShape.quadraticCurveTo(-half, half, -half, half - mediumRadius);
        mediumShape.lineTo(-half, -half + mediumRadius);
        mediumShape.quadraticCurveTo(-half, -half, -half + mediumRadius, -half);

        const mediumBevelGeometry = new THREE.ExtrudeGeometry(mediumShape, {
            depth: size,
            bevelEnabled: true,
            bevelThickness: mediumRadius,
            bevelSize: mediumRadius,
            bevelSegments: 3
        });

        const mediumBevelMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            metalness: 0.3,
            roughness: 0.4
        });
        const mediumBevelCube = new THREE.Mesh(mediumBevelGeometry, mediumBevelMaterial);
        mediumBevelCube.position.set(0, 0, -size / 2);
        scene.add(mediumBevelCube);

        // Large bevel (right)
        const largeShape = new THREE.Shape();
        const largeRadius = 0.2;

        largeShape.moveTo(-half + largeRadius, -half);
        largeShape.lineTo(half - largeRadius, -half);
        largeShape.quadraticCurveTo(half, -half, half, -half + largeRadius);
        largeShape.lineTo(half, half - largeRadius);
        largeShape.quadraticCurveTo(half, half, half - largeRadius, half);
        largeShape.lineTo(-half + largeRadius, half);
        largeShape.quadraticCurveTo(-half, half, -half, half - largeRadius);
        largeShape.lineTo(-half, -half + largeRadius);
        largeShape.quadraticCurveTo(-half, -half, -half + largeRadius, -half);

        const largeBevelGeometry = new THREE.ExtrudeGeometry(largeShape, {
            depth: size,
            bevelEnabled: true,
            bevelThickness: largeRadius,
            bevelSize: largeRadius,
            bevelSegments: 5
        });

        const largeBevelMaterial = new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            metalness: 0.3,
            roughness: 0.4
        });
        const largeBevelCube = new THREE.Mesh(largeBevelGeometry, largeBevelMaterial);
        largeBevelCube.position.set(2.5, 0, -size / 2);
        scene.add(largeBevelCube);

        const light1 = new THREE.DirectionalLight(0xffffff, 1);
        light1.position.set(5, 5, 5);
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
        light2.position.set(-5, 3, -5);
        scene.add(light2);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            smallBevelCube.rotation.x += 0.008;
            smallBevelCube.rotation.y += 0.012;
            mediumBevelCube.rotation.x += 0.008;
            mediumBevelCube.rotation.y += 0.012;
            largeBevelCube.rotation.x += 0.008;
            largeBevelCube.rotation.y += 0.012;
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
