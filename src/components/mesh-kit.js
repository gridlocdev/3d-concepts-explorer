import * as THREE from 'three';

// A small polygon mesh like a modeling tool keeps: shared vertex positions
// and faces as loops of vertex indices (quads, triangles or n-gons, wound
// counter-clockwise seen from outside). Enough to run real modeling
// operations (extrude, loop cuts, Catmull-Clark subdivision) for the demos.
//   mesh = { v: [[x, y, z], ...], f: [[i, j, k, l], ...] }

export const clone = m => ({ v: m.v.map(p => [...p]), f: m.f.map(f => [...f]) });

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const avg = ps => mul(ps.reduce(add, [0, 0, 0]), 1 / ps.length);

export function faceCenter(m, fi) {
    return avg(m.f[fi].map(i => m.v[i]));
}

// Newell's method: works for any planar-ish polygon.
export function faceNormal(m, fi) {
    const f = m.f[fi];
    const n = [0, 0, 0];
    f.forEach((i, k) => {
        const a = m.v[i], b = m.v[f[(k + 1) % f.length]];
        n[0] += (a[1] - b[1]) * (a[2] + b[2]);
        n[1] += (a[2] - b[2]) * (a[0] + b[0]);
        n[2] += (a[0] - b[0]) * (a[1] + b[1]);
    });
    const len = Math.hypot(...n) || 1;
    return mul(n, 1 / len);
}

// A box whose surface is cut at the given coordinates on each axis, e.g.
// boxGrid([-.5, .5], [-.5, 0, .5], [-.5, .5]) is a cube with one loop cut
// around its middle.
export function boxGrid(xs, ys, zs) {
    const m = { v: [], f: [] };
    const index = new Map();
    const vertex = p => {
        const key = p.map(c => c.toFixed(5)).join();
        if (!index.has(key)) {
            index.set(key, m.v.length);
            m.v.push(p);
        }
        return index.get(key);
    };
    const sets = [xs, ys, zs];
    for (let a = 0; a < 3; a++) {
        const u = (a + 1) % 3, w = (a + 2) % 3;
        for (const side of [0, 1]) {
            const fixed = side ? sets[a].at(-1) : sets[a][0];
            for (let i = 0; i < sets[u].length - 1; i++) {
                for (let j = 0; j < sets[w].length - 1; j++) {
                    const corner = (di, dj) => {
                        const p = [0, 0, 0];
                        p[a] = fixed;
                        p[u] = sets[u][i + di];
                        p[w] = sets[w][j + dj];
                        return vertex(p);
                    };
                    const q = [corner(0, 0), corner(1, 0), corner(1, 1), corner(0, 1)];
                    m.f.push(side ? q : q.reverse());
                }
            }
        }
    }
    return m;
}

export const cube = (s = 1) => boxGrid([-s / 2, s / 2], [-s / 2, s / 2], [-s / 2, s / 2]);

// A capped cylinder with an edge loop (ring) at each height.
export function tube(heights, sides = 12, radius = 0.4) {
    const m = { v: [], f: [] };
    for (const h of heights) {
        for (let k = 0; k < sides; k++) {
            const a = (k / sides) * Math.PI * 2;
            m.v.push([radius * Math.cos(a), h, -radius * Math.sin(a)]);
        }
    }
    for (let i = 0; i < heights.length - 1; i++) {
        for (let k = 0; k < sides; k++) {
            const k2 = (k + 1) % sides;
            m.f.push([i * sides + k, i * sides + k2, (i + 1) * sides + k2, (i + 1) * sides + k]);
        }
    }
    const top = (heights.length - 1) * sides;
    m.f.push([...Array(sides).keys()].map(k => top + k));
    m.f.push([...Array(sides).keys()].map(k => sides - 1 - k));
    return m;
}

// Extrude one face along its normal by `dist`, scaling the new cap about its
// center. Adds a side quad per edge and returns the new cap's face index.
export function extrudeFace(m, fi, dist, scale = 1) {
    const f = m.f[fi];
    const n = faceNormal(m, fi);
    const c = faceCenter(m, fi);
    const cap = f.map(i => {
        m.v.push(add(add(c, mul(sub(m.v[i], c), scale)), mul(n, dist)));
        return m.v.length - 1;
    });
    f.forEach((a, k) => {
        const b = f[(k + 1) % f.length];
        m.f.push([a, b, cap[(k + 1) % f.length], cap[k]]);
    });
    m.f[fi] = cap;
    return fi;
}

// One level of Catmull-Clark subdivision on a closed mesh: every face becomes
// quads, and every point moves toward a smooth limit surface.
export function subdivide(m) {
    const V = m.v, F = m.f;
    const facePts = F.map(f => avg(f.map(i => V[i])));
    const edges = new Map();
    F.forEach((f, fi) => f.forEach((a, k) => {
        const b = f[(k + 1) % f.length];
        const key = a < b ? `${a}_${b}` : `${b}_${a}`;
        if (!edges.has(key)) edges.set(key, { a, b, faces: [] });
        edges.get(key).faces.push(fi);
    }));
    const vFaces = V.map(() => []), vEdges = V.map(() => []);
    F.forEach((f, fi) => f.forEach(i => vFaces[i].push(fi)));

    const out = { v: [], f: [] };
    for (const e of edges.values()) {
        vEdges[e.a].push(e);
        vEdges[e.b].push(e);
        const pts = [V[e.a], V[e.b], ...e.faces.map(fi => facePts[fi])];
        e.index = out.v.length + V.length + F.length;
        out.v.push(e.faces.length === 2 ? avg(pts) : avg([V[e.a], V[e.b]]));
    }
    const moved = V.map((P, i) => {
        const n = vFaces[i].length;
        if (n === 0 || vEdges[i].length !== n) return P;
        const Fa = avg(vFaces[i].map(fi => facePts[fi]));
        const R = avg(vEdges[i].map(e => avg([V[e.a], V[e.b]])));
        return add(add(mul(Fa, 1 / n), mul(R, 2 / n)), mul(P, (n - 3) / n));
    });
    out.v = [...moved, ...facePts, ...out.v];

    const edgeIndex = (a, b) => edges.get(a < b ? `${a}_${b}` : `${b}_${a}`).index;
    F.forEach((f, fi) => f.forEach((a, k) => {
        const next = f[(k + 1) % f.length], prev = f[(k - 1 + f.length) % f.length];
        out.f.push([a, edgeIndex(a, next), V.length + fi, edgeIndex(prev, a)]);
    }));
    return out;
}

export function subdivideTimes(m, levels) {
    for (let i = 0; i < levels; i++) m = subdivide(m);
    return m;
}

// Triangulated geometry for rendering. smooth: share normals across faces.
// faceColors: { faceIndex: hex } paints those faces (flat only).
export function toGeometry(m, { smooth = false, faceColors = null, color = 0xffffff } = {}) {
    const positions = [], colors = [], index = [];
    const geo = new THREE.BufferGeometry();
    if (smooth) {
        m.v.forEach(p => positions.push(...p));
        m.f.forEach(f => {
            for (let k = 1; k < f.length - 1; k++) index.push(f[0], f[k], f[k + 1]);
        });
        geo.setIndex(index);
    } else {
        const base = new THREE.Color(color), c = new THREE.Color();
        m.f.forEach((f, fi) => {
            c.set(faceColors?.[fi] ?? base);
            for (let k = 1; k < f.length - 1; k++) {
                for (const i of [f[0], f[k], f[k + 1]]) {
                    positions.push(...m.v[i]);
                    colors.push(c.r, c.g, c.b);
                }
            }
        });
        if (faceColors) geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    return geo;
}

// Every edge once, as line segments.
export function toEdges(m) {
    const seen = new Set(), positions = [];
    m.f.forEach(f => f.forEach((a, k) => {
        const b = f[(k + 1) % f.length];
        const key = a < b ? `${a}_${b}` : `${b}_${a}`;
        if (seen.has(key)) return;
        seen.add(key);
        positions.push(...m.v[a], ...m.v[b]);
    }));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
}

export function toPoints(m) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(m.v.flat(), 3));
    return geo;
}

// Swap a mesh's geometry for a new one, freeing the old.
export function setGeometry(object, geometry) {
    object.geometry.dispose();
    object.geometry = geometry;
}
