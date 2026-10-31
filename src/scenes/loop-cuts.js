// Scenes for loop-cuts.html. start() builds them; the returned stop() tears them down.
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

        // Create cylinder with visible loop cuts
        const geometry = new THREE.CylinderGeometry(1, 1, 3, 16, 6);

        const material = new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            flatShading: false,
            wireframe: false
        });

        const cylinder = new THREE.Mesh(geometry, material);
        scene.add(cylinder);

        // Add wireframe to show the loops
        const wireframeGeometry = geometry.clone();
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        scene.add(wireframe);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x505050);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            cylinder.rotation.y += 0.008;
            wireframe.rotation.y += 0.008;
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

        // Left: Good topology with proper loop cuts
        const goodGeometry = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 12, 6);
        const goodMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff88, wireframe: false });
        const goodWireMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true, transparent: true, opacity: 0.8 });
        const goodCylinder = new THREE.Mesh(goodGeometry, goodMaterial);
        const goodWire = new THREE.Mesh(goodGeometry.clone(), goodWireMaterial);
        goodCylinder.position.x = -2.5;
        goodWire.position.x = -2.5;
        scene.add(goodCylinder);
        scene.add(goodWire);

        // Middle: Poor topology with random edges (simulated with irregular geometry)
        const poorGeometry = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 7, 3);
        // Make it irregular
        const positions = poorGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            positions.setXYZ(
                i,
                x + (Math.random() - 0.5) * 0.15,
                y,
                z + (Math.random() - 0.5) * 0.15
            );
        }
        poorGeometry.computeVertexNormals();

        const poorMaterial = new THREE.MeshStandardMaterial({ color: 0xff6600, wireframe: false, flatShading: true });
        const poorWireMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600, wireframe: true, transparent: true, opacity: 0.8 });
        const poorCylinder = new THREE.Mesh(poorGeometry, poorMaterial);
        const poorWire = new THREE.Mesh(poorGeometry.clone(), poorWireMaterial);
        poorCylinder.position.x = 0;
        poorWire.position.x = 0;
        scene.add(poorCylinder);
        scene.add(poorWire);

        // Right: Strategic loop cuts (more detail in specific areas)
        const strategicGeometry = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 12, 8);
        const strategicMaterial = new THREE.MeshStandardMaterial({ color: 0x4488ff, wireframe: false });
        const strategicWireMaterial = new THREE.MeshBasicMaterial({ color: 0x4488ff, wireframe: true, transparent: true, opacity: 0.8 });
        const strategicCylinder = new THREE.Mesh(strategicGeometry, strategicMaterial);
        const strategicWire = new THREE.Mesh(strategicGeometry.clone(), strategicWireMaterial);
        strategicCylinder.position.x = 2.5;
        strategicWire.position.x = 2.5;
        scene.add(strategicCylinder);
        scene.add(strategicWire);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x505050);
        scene.add(ambientLight);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            goodCylinder.rotation.y += 0.008;
            goodWire.rotation.y += 0.008;
            poorCylinder.rotation.y += 0.008;
            poorWire.rotation.y += 0.008;
            strategicCylinder.rotation.y += 0.008;
            strategicWire.rotation.y += 0.008;
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
