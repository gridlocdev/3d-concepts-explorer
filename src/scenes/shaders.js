// Panels for shaders.html. Each custom shader is a few lines of GLSL.
import * as THREE from 'three';
import { createBrochure } from '../components/brochure.js';

const knot = new THREE.TorusKnotGeometry(0.55, 0.18, 160, 24);

const viewVertex = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vView;
    varying vec3 vPos;
    void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = -mv.xyz;
        vPos = position;
        gl_Position = projectionMatrix * mv;
    }
`;

export function start() {
    const b = createBrochure();

    b.panel('normal-color', p => {
        p.root.add(new THREE.Mesh(knot, new THREE.MeshNormalMaterial()));
    });

    b.panel('fresnel', p => {
        p.root.add(new THREE.Mesh(knot, new THREE.ShaderMaterial({
            vertexShader: viewVertex,
            fragmentShader: /* glsl */ `
                varying vec3 vNormal;
                varying vec3 vView;
                void main() {
                    float facing = max(dot(normalize(vNormal), normalize(vView)), 0.0);
                    float rim = pow(1.0 - facing, 2.5);
                    gl_FragColor = vec4(mix(vec3(0.03, 0.06, 0.15), vec3(0.3, 0.9, 1.0), rim), 1.0);
                }
            `,
        })));
    });

    b.panel('toon', p => {
        const steps = new Uint8Array([60, 150, 255]);
        const gradientMap = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
        gradientMap.minFilter = gradientMap.magFilter = THREE.NearestFilter;
        gradientMap.needsUpdate = true;
        p.root.add(new THREE.Mesh(knot, new THREE.MeshToonMaterial({ color: 0xff8a4c, gradientMap })));
    });

    b.panel('stripes', p => {
        const uniforms = { time: { value: 0 } };
        p.root.add(new THREE.Mesh(knot, new THREE.ShaderMaterial({
            uniforms,
            vertexShader: viewVertex,
            fragmentShader: /* glsl */ `
                uniform float time;
                varying vec3 vNormal;
                varying vec3 vPos;
                void main() {
                    float stripe = step(0.5, fract(vPos.y * 4.0 + time * 0.5));
                    vec3 color = mix(vec3(0.15, 0.35, 0.85), vec3(1.0, 0.75, 0.25), stripe);
                    float light = 0.35 + 0.65 * max(dot(normalize(vNormal), normalize(vec3(0.4, 0.8, 0.6))), 0.0);
                    gl_FragColor = vec4(color * light, 1.0);
                }
            `,
        })));
        return t => { uniforms.time.value = t; };
    });

    b.panel('waves', p => {
        const uniforms = { time: { value: 0 } };
        p.root.add(new THREE.Mesh(new THREE.SphereGeometry(0.75, 128, 64), new THREE.ShaderMaterial({
            uniforms,
            vertexShader: /* glsl */ `
                uniform float time;
                varying float vLift;
                void main() {
                    float lift = sin(position.y * 9.0 + time * 2.5) * sin(position.x * 7.0 + time * 1.7) * 0.09;
                    vLift = lift;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * lift, 1.0);
                }
            `,
            fragmentShader: /* glsl */ `
                varying float vLift;
                void main() {
                    gl_FragColor = vec4(mix(vec3(0.1, 0.2, 0.55), vec3(0.4, 0.95, 0.75), vLift / 0.18 + 0.5), 1.0);
                }
            `,
        })));
        return t => { uniforms.time.value = t; };
    }, { spin: 0.1 });

    return b.stop;
}
