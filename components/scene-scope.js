import * as THREE from 'three';

// Tracks what a page's scenes start (animation frames, window listeners,
// WebGL renderers) so the router can stop them all when it swaps pages.
// Browsers cap live WebGL contexts at about 16, so renderers must be freed.
export function createScope() {
    const frames = new Set();
    const cleanups = [];
    let stopped = false;

    return {
        raf(fn) {
            if (stopped) return;
            const id = requestAnimationFrame(time => {
                frames.delete(id);
                fn(time);
            });
            frames.add(id);
        },

        on(target, type, fn, options) {
            target.addEventListener(type, fn, options);
            cleanups.push(() => target.removeEventListener(type, fn, options));
        },

        renderer(params) {
            const renderer = new THREE.WebGLRenderer(params);
            cleanups.push(() => {
                renderer.dispose();
                renderer.forceContextLoss();
            });
            return renderer;
        },

        stop() {
            stopped = true;
            frames.forEach(cancelAnimationFrame);
            frames.clear();
            cleanups.splice(0).forEach(cleanup => cleanup());
        },
    };
}
