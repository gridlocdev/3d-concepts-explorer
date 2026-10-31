// Scenes for shaders.html. start() builds them; the returned stop() tears them down.
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

        const vertexShader = `
            varying vec3 vPosition;
            void main() {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            uniform float time;
            varying vec3 vPosition;

            void main() {
                vec3 color1 = vec3(1.0, 0.0, 0.5);
                vec3 color2 = vec3(0.0, 0.5, 1.0);

                float pattern = sin(vPosition.x * 5.0 + time) * sin(vPosition.y * 5.0 + time) * sin(vPosition.z * 5.0 + time);
                vec3 color = mix(color1, color2, pattern * 0.5 + 0.5);

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                time: { value: 0 }
            }
        });

        const geometry = new THREE.TorusKnotGeometry(1.5, 0.5, 100, 16);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        let time = 0;
        function animate() {
            scope.raf(animate);
            time += 0.01;
            material.uniforms.time.value = time;
            mesh.rotation.x += 0.005;
            mesh.rotation.y += 0.01;
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

        // Fresnel rim lighting shader
        const vertexShader = `
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `;

        const fragmentShader = `
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                vec3 viewDir = normalize(vViewPosition);
                vec3 normal = normalize(vNormal);

                // Fresnel effect
                float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 3.0);

                // Base color and rim color
                vec3 baseColor = vec3(0.1, 0.2, 0.4);
                vec3 rimColor = vec3(0.0, 0.8, 1.0);

                // Mix based on fresnel
                vec3 finalColor = mix(baseColor, rimColor, fresnel);

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader
        });

        const geometry = new THREE.SphereGeometry(2, 64, 64);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        camera.position.set(0, 2, 6);
        camera.lookAt(0, 0, 0);

        function animate() {
            scope.raf(animate);
            mesh.rotation.x += 0.003;
            mesh.rotation.y += 0.005;
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
