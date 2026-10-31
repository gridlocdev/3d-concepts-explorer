import * as THREE from 'three';
import { createScope } from './scene-scope.js';

// Brochure pages: many small panels, each its own scene, drawn by one shared
// WebGL renderer. Each frame a visible panel renders into the shared canvas,
// then gets copied into the panel's own 2D canvas. One WebGL context per page
// (browsers cap them near 16), and panels scroll natively with no lag.
//
// Usage, in scenes/<page>.js:
//   const b = createBrochure();
//   b.panel('vertices', p => { p.root.add(mesh); return (t, dt) => { ... }; });
//   return b.stop;
// Each panel matches an element with data-panel="<id>" holding a .view.

export const COLORS = {
    stage: 0x1a1a1a,
    body: 0x4a7fd6,
    hi: 0xffa94d,
    edge: 0xe6e6e6,
    faint: 0x555555,
    vert: 0xff6b6b,
    good: 0x3ddc84,
    bad: 0xff6b6b,
    x: 0xff5c5c,
    y: 0x5ad16a,
    z: 0x4d8dff,
};

export const dpr = () => Math.min(window.devicePixelRatio, 2);

export function createBrochure() {
    const scope = createScope();
    const renderer = scope.renderer({ antialias: true });
    renderer.setPixelRatio(1); // buffers are sized in device pixels below
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    let bufW = 0, bufH = 0;
    let env = null;
    const panels = [];

    const visibility = new IntersectionObserver(entries => {
        for (const entry of entries) {
            const p = panels.find(p => p.el === entry.target);
            if (p) p.visible = entry.isIntersecting;
        }
    }, { rootMargin: '100px' });
    scope.add(() => visibility.disconnect());

    function environment() {
        if (!env) env = makeEnvironment(renderer);
        return env;
    }

    // The expanded view: one <dialog> per page. Expanding a panel moves its
    // canvas into the dialog, so the scene keeps its spin, drag and timing.
    let lightbox = null;
    let expanded = null;

    function makeLightbox() {
        const d = document.createElement('dialog');
        d.className = 'lightbox';
        d.innerHTML = `
            <div class="lightbox-bar">
                <h2 class="lightbox-title"></h2>
                <span class="lightbox-count"></span>
                <button type="button" class="icon-btn" data-step="-1" aria-label="Previous model" title="Previous (←)">${ICONS.prev}</button>
                <button type="button" class="icon-btn" data-step="1" aria-label="Next model" title="Next (→)">${ICONS.next}</button>
                <button type="button" class="icon-btn" data-close autofocus aria-label="Close" title="Close (Esc)">${ICONS.close}</button>
            </div>
            <div class="lightbox-stage"></div>
            <p class="lightbox-caption"></p>`;
        d.addEventListener('click', e => {
            if (e.target === d) return d.close(); // the backdrop
            const btn = e.target.closest('button');
            if (btn?.dataset.step) step(Number(btn.dataset.step));
            else if (btn?.hasAttribute('data-close')) d.close();
        });
        d.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') step(-1);
            else if (e.key === 'ArrowRight') step(1);
        });
        d.addEventListener('close', () => {
            const p = collapse();
            // After the dialog's own focus restore, which picks the button
            // that opened it, not the panel the user stepped to.
            setTimeout(() => p?.el.querySelector('.expand').focus());
        });
        document.body.append(d);
        scope.add(() => d.remove());
        return d;
    }

    function expand(p) {
        lightbox ??= makeLightbox();
        collapse();
        expanded = p;
        const view = p.el.querySelector('.view');
        lightbox.style.setProperty('--aspect', view.clientWidth / view.clientHeight);
        lightbox.querySelector('.lightbox-stage').append(p.canvas);

        const caption = p.el.querySelector('figcaption')?.cloneNode(true);
        const title = caption?.querySelector('b');
        title?.remove();
        lightbox.querySelector('.lightbox-title').textContent = title?.textContent ?? '';
        lightbox.querySelector('.lightbox-caption').innerHTML = caption?.innerHTML ?? '';
        const order = ordered();
        lightbox.querySelector('.lightbox-count').textContent = `${order.indexOf(p) + 1} / ${order.length}`;
        for (const btn of lightbox.querySelectorAll('[data-step]')) btn.hidden = order.length < 2;
        if (!lightbox.open) lightbox.showModal();
    }

    function collapse() {
        const p = expanded;
        if (!p) return null;
        expanded = null;
        p.dragging = null;
        p.el.querySelector('.view').prepend(p.canvas);
        return p;
    }

    function step(by) {
        const order = ordered();
        const i = order.indexOf(expanded);
        expand(order[(i + by + order.length) % order.length]);
    }

    // Panels in page order, which can differ from the order scenes add them.
    function ordered() {
        return panels.slice().sort((a, b) => a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    }

    // opts: cam [x,y,z], target [x,y,z], fov, spin (rad/s, 0 for none),
    // drag (false to lock), lights (false for none)
    function panel(id, setup, opts = {}) {
        const el = document.querySelector(`[data-panel="${id}"]`);
        if (!el) {
            console.warn(`No panel "${id}" on this page`);
            return;
        }
        const canvas = document.createElement('canvas');
        const expandBtn = document.createElement('button');
        expandBtn.type = 'button';
        expandBtn.className = 'icon-btn expand';
        expandBtn.title = 'Expand';
        expandBtn.setAttribute('aria-label', `Expand ${el.querySelector('figcaption b')?.textContent ?? 'model'}`);
        expandBtn.innerHTML = ICONS.expand;
        el.querySelector('.view').append(canvas, expandBtn);
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(COLORS.stage);
        const root = new THREE.Group();
        scene.add(root);
        if (opts.lights !== false) addLights(scene);
        const camera = new THREE.PerspectiveCamera(opts.fov ?? 35, 4 / 3, 0.1, 200);
        camera.position.set(...(opts.cam ?? [0, 1.3, 3.8]));
        camera.lookAt(...(opts.target ?? [0, 0, 0]));

        const p = {
            el, canvas, ctx: canvas.getContext('2d'), scene, root, camera,
            renderer, environment,
            spin: opts.spin ?? 0.25,
            visible: false,
            dragging: null,
            update: null,
        };
        p.update = setup(p) || null;
        expandBtn.addEventListener('click', () => expand(p));

        if (opts.drag !== false) {
            canvas.classList.add('draggable');
            canvas.addEventListener('pointerdown', e => {
                p.dragging = { x: e.clientX, y: e.clientY };
                canvas.setPointerCapture(e.pointerId);
            });
            canvas.addEventListener('pointermove', e => {
                if (!p.dragging) return;
                root.rotation.y += (e.clientX - p.dragging.x) * 0.01;
                root.rotation.x = THREE.MathUtils.clamp(root.rotation.x + (e.clientY - p.dragging.y) * 0.01, -1.3, 1.3);
                p.dragging = { x: e.clientX, y: e.clientY };
            });
            const end = () => { p.dragging = null; };
            canvas.addEventListener('pointerup', end);
            canvas.addEventListener('pointercancel', end);
        }

        panels.push(p);
        visibility.observe(el);
        return p;
    }

    let last = performance.now();
    function frame(now) {
        scope.raf(frame);
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        const t = now / 1000;
        renderer.setScissorTest(true);

        for (const p of panels) {
            // While one panel is expanded, it is the only one on screen.
            if (expanded ? p !== expanded : !p.visible) continue;
            const w = Math.max(1, Math.round(p.canvas.clientWidth * dpr()));
            const h = Math.max(1, Math.round(p.canvas.clientHeight * dpr()));
            if (p.canvas.width !== w || p.canvas.height !== h) {
                p.canvas.width = w;
                p.canvas.height = h;
            }
            if (w > bufW || h > bufH) {
                bufW = Math.max(bufW, w);
                bufH = Math.max(bufH, h);
                renderer.setSize(bufW, bufH, false);
            }
            fitCamera(p.camera, w / h);

            if (!p.dragging && p.spin) p.root.rotation.y += p.spin * dt;
            p.update?.(t, dt);

            renderer.setViewport(0, bufH - h, w, h);
            renderer.setScissor(0, bufH - h, w, h);
            renderer.render(p.scene, p.camera);
            p.ctx.drawImage(renderer.domElement, 0, 0, w, h, 0, 0, w, h);
        }
    }
    scope.raf(frame);

    return { panel, stop: scope.stop };
}

const icon = path => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const ICONS = {
    expand: icon('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>'),
    close: icon('<path d="M18 6 6 18M6 6l12 12"/>'),
    prev: icon('<path d="m15 18-6-6 6-6"/>'),
    next: icon('<path d="m9 18 6-6-6-6"/>'),
};

function fitCamera(camera, aspect) {
    if (camera.isPerspectiveCamera) {
        if (camera.aspect === aspect) return;
        camera.aspect = aspect;
    } else {
        // Orthographic cameras keep their height (camera.userData.size).
        const half = camera.userData.size / 2;
        if (camera.right === half * aspect) return;
        camera.left = -half * aspect;
        camera.right = half * aspect;
        camera.top = half;
        camera.bottom = -half;
    }
    camera.updateProjectionMatrix();
}

function addLights(scene) {
    scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2a35, 1.4));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(3, 5, 4);
    scene.add(sun);
}

// A soft studio for reflections: a gray gradient dome with a few bright
// panels, so metals and glossy surfaces have something to reflect.
function makeEnvironment(renderer) {
    const studio = new THREE.Scene();
    const dome = new THREE.SphereGeometry(10, 32, 16);
    const pos = dome.attributes.position;
    const colors = [];
    const low = new THREE.Color(0x151515), high = new THREE.Color(0x8c96a3), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
        c.lerpColors(low, high, (pos.getY(i) / 10 + 1) / 2);
        colors.push(c.r, c.g, c.b);
    }
    dome.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    studio.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })));
    const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 5, 5), side: THREE.DoubleSide });
    for (const [x, y, z, w, h] of [[5, 4, 3, 4, 2], [-6, 3, -2, 2, 5], [0, 8, -4, 6, 1]]) {
        const light = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glow);
        light.position.set(x, y, z);
        light.lookAt(0, 0, 0);
        studio.add(light);
    }
    const pmrem = new THREE.PMREMGenerator(renderer);
    const texture = pmrem.fromScene(studio, 0.02).texture;
    pmrem.dispose();
    return texture;
}

// Text that always faces the camera.
export function label(text, { color = '#f2f2f2', size = 0.3 } = {}) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const font = '600 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    ctx.font = font;
    canvas.width = Math.ceil(ctx.measureText(text).width) + 16;
    canvas.height = 88;
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 8, 46);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, depthTest: false, transparent: true }));
    sprite.scale.set(size * canvas.width / canvas.height, size, 1);
    sprite.renderOrder = 10;
    return sprite;
}

let dotTexture = null;

// Round, screen-sized dots for vertices.
export function dots(geometry, color = COLORS.vert, size = 9) {
    if (!dotTexture) {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(32, 32, 30, 0, Math.PI * 2);
        ctx.fill();
        dotTexture = new THREE.CanvasTexture(c);
    }
    return new THREE.Points(geometry, new THREE.PointsMaterial({
        color, size: size * dpr(), sizeAttenuation: false, map: dotTexture, alphaTest: 0.5,
    }));
}

export function lines(geometry, color = COLORS.edge, opacity = 1) {
    return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
        color, transparent: opacity < 1, opacity,
    }));
}

export function solid(geometry, color = COLORS.body, params = {}) {
    return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.55, ...params }));
}

// An arrow from `from` along `dir` (THREE.Vector3s), `length` long.
export function arrow(from, dir, length, color) {
    return new THREE.ArrowHelper(dir.clone().normalize(), from, length, color, Math.min(0.25, length * 0.3), Math.min(0.12, length * 0.15));
}

// Smooth back-and-forth between 0 and 1, `period` seconds per round trip.
export function pingPong(t, period = 4) {
    return 0.5 - 0.5 * Math.cos((t / period) * Math.PI * 2);
}

// 0..1 that holds at each end: rises, holds, falls, holds.
export function holdPingPong(t, period = 5) {
    const x = (t / period) % 1;
    const ramp = v => THREE.MathUtils.smoothstep(v, 0, 1);
    if (x < 0.3) return ramp(x / 0.3);
    if (x < 0.5) return 1;
    if (x < 0.8) return 1 - ramp((x - 0.5) / 0.3);
    return 0;
}

export function checkerTexture(cells = 8, a = '#e8e8e8', b = '#2b2b2b') {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const s = 256 / cells;
    for (let i = 0; i < cells; i++) {
        for (let j = 0; j < cells; j++) {
            ctx.fillStyle = (i + j) % 2 ? b : a;
            ctx.fillRect(i * s, j * s, s, s);
        }
    }
    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    return map;
}
