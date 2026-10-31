// Scenes for extrude.html. start() builds them; the returned stop() tears them down.
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

        const extrudeSteps = 3;

        // Create a stepped extrusion demonstration
        const baseGeometry = new THREE.BoxGeometry(1.5, 0.5, 1.5);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            flatShading: false
        });

        const baseMesh = new THREE.Mesh(baseGeometry, material);
        baseMesh.position.y = 0;
        scene.add(baseMesh);

        // Create extruded steps
        for (let i = 0; i < extrudeSteps; i++) {
            const size = 1.5 - (i + 1) * 0.3;
            const stepGeometry = new THREE.BoxGeometry(size, 0.5, size);
            const stepMaterial = new THREE.MeshStandardMaterial({
                color: 0x00ff88 - (i * 0x001100),
                flatShading: false
            });
            const stepMesh = new THREE.Mesh(stepGeometry, stepMaterial);
            stepMesh.position.y = (i + 1) * 0.5;
            scene.add(stepMesh);
        }

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x606060);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        let rotationAngle = 0;
        function animate() {
            scope.raf(animate);
            rotationAngle += 0.005;
            scene.rotation.y = rotationAngle;
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

        // Left: Face Extrude - cube with extruded top face
        const faceGroup = new THREE.Group();
        const baseCube1 = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 1.2, 1.2),
            new THREE.MeshStandardMaterial({ color: 0xff6600 })
        );
        faceGroup.add(baseCube1);

        const extrudedFace = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.8, 0.6),
            new THREE.MeshStandardMaterial({ color: 0xff8833 })
        );
        extrudedFace.position.y = 1;
        faceGroup.add(extrudedFace);
        faceGroup.position.x = -2.5;
        scene.add(faceGroup);

        // Middle: Edge Extrude - cube with extruded edge creating a fin
        const edgeGroup = new THREE.Group();
        const baseCube2 = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 1.2, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x00ff88 })
        );
        edgeGroup.add(baseCube2);

        // Create a fin-like extrusion from an edge
        const finGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.1);
        const fin = new THREE.Mesh(
            finGeometry,
            new THREE.MeshStandardMaterial({ color: 0x33ffaa })
        );
        fin.position.set(0, 0.6, 0.65);
        edgeGroup.add(fin);
        edgeGroup.position.x = 0;
        scene.add(edgeGroup);

        // Right: Vertex Extrude - cube with vertices extruded upward
        const vertexGroup = new THREE.Group();
        const baseCube3 = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 1.2, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x4488ff })
        );
        vertexGroup.add(baseCube3);

        // Create spike-like extrusions from vertices
        const spikeGeometry = new THREE.ConeGeometry(0.1, 0.8, 8);
        const spikeMaterial = new THREE.MeshStandardMaterial({ color: 0x66aaff });

        const corners = [
            [-0.6, 0.6, -0.6],
            [0.6, 0.6, -0.6],
            [-0.6, 0.6, 0.6],
            [0.6, 0.6, 0.6]
        ];

        corners.forEach(([x, y, z]) => {
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(x, y + 0.4, z);
            vertexGroup.add(spike);
        });
        vertexGroup.position.x = 2.5;
        scene.add(vertexGroup);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x606060);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        let rotationAngle = 0;
        function animate() {
            scope.raf(animate);
            rotationAngle += 0.005;

            faceGroup.rotation.y = rotationAngle;
            edgeGroup.rotation.y = rotationAngle;
            vertexGroup.rotation.y = rotationAngle;

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
