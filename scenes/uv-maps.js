// Scenes for uv-maps.html. start() builds them; the returned stop() tears them down.
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

        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = 512;
        textureCanvas.height = 512;
        const ctx = textureCanvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        for (let i = 0; i <= 8; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 64, 0);
            ctx.lineTo(i * 64, 512);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * 64);
            ctx.lineTo(512, i * 64);
            ctx.stroke();
        }

        ctx.fillStyle = '#ff0000';
        ctx.font = '24px Arial';
        ctx.fillText('U →', 230, 30);
        ctx.save();
        ctx.translate(30, 280);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('V →', 0, 0);
        ctx.restore();

        const texture = new THREE.CanvasTexture(textureCanvas);
        const geometry = new THREE.SphereGeometry(2, 32, 32);
        const material = new THREE.MeshStandardMaterial({ map: texture });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x606060);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            sphere.rotation.y += 0.005;
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

        // Create checkerboard texture
        const checkerCanvas = document.createElement('canvas');
        checkerCanvas.width = 512;
        checkerCanvas.height = 512;
        const ctx = checkerCanvas.getContext('2d');

        const squareSize = 64;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#000000';
                ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
            }
        }

        const checkerTexture = new THREE.CanvasTexture(checkerCanvas);
        checkerTexture.wrapS = THREE.RepeatWrapping;
        checkerTexture.wrapT = THREE.RepeatWrapping;

        // Left: Good UV unwrapping (proper box unwrap)
        const goodGeometry = new THREE.BoxGeometry(2, 2, 2);
        const goodMaterial = new THREE.MeshStandardMaterial({ map: checkerTexture.clone() });
        const goodCube = new THREE.Mesh(goodGeometry, goodMaterial);
        goodCube.position.x = -2;
        scene.add(goodCube);

        // Right: Poor UV unwrapping (distorted UVs)
        const poorGeometry = new THREE.BoxGeometry(2, 2, 2);
        // Distort the UVs to simulate poor unwrapping
        const uvAttribute = poorGeometry.attributes.uv;
        for (let i = 0; i < uvAttribute.count; i++) {
            const u = uvAttribute.getX(i);
            const v = uvAttribute.getY(i);
            // Apply distortion
            uvAttribute.setXY(
                i,
                u * (0.5 + Math.random() * 0.8),
                v * (0.5 + Math.random() * 0.8)
            );
        }

        const poorMaterial = new THREE.MeshStandardMaterial({ map: checkerTexture.clone() });
        const poorCube = new THREE.Mesh(poorGeometry, poorMaterial);
        poorCube.position.x = 2;
        scene.add(poorCube);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x606060);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            goodCube.rotation.x += 0.008;
            goodCube.rotation.y += 0.012;
            poorCube.rotation.x += 0.008;
            poorCube.rotation.y += 0.012;
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
