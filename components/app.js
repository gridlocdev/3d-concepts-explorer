// Boots every page, then turns clicks on the site's own links into in-place
// page swaps: fetch the next page, replace <main>, and restart its scenes.
// The sidebar and three.js stay loaded, so the switch is instant with no
// blank flash. Anything unexpected falls back to a normal page load.
import './wiki-sidebar.js';

let stopScene = null;
let navId = 0;
let swapped = true; // false while a navigation hasn't swapped its page in yet

function pageName(url) {
    const file = new URL(url, location.href).pathname.split('/').pop();
    return file.replace(/\.html$/, '') || 'index';
}

// Pages with canvases have a matching module in scenes/ exporting start().
function loadScene(url, doc) {
    if (!doc.querySelector('canvas')) return null;
    return import(`../scenes/${pageName(url)}.js`);
}

function startScene(scene) {
    stopScene = scene ? scene.start() : null;
}

async function navigate(url, { push }) {
    const id = ++navId;
    // A click that interrupts an unfinished swap replaces its history entry,
    // so Back never lands on a page that was never shown.
    if (push) history[swapped ? 'pushState' : 'replaceState'](null, '', url);
    swapped = false;
    let doc, scene;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${url}`);
        doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        if (!doc.querySelector('.main-container')) throw new Error(`no .main-container in ${url}`);
        scene = await loadScene(url, doc);
    } catch (err) {
        console.warn('Page swap failed, loading normally:', err);
        location.replace(url);
        return;
    }
    if (id !== navId) return; // a newer click or back/forward won

    // All in one task, so the browser never paints a half-swapped page.
    swapped = true;
    stopScene?.();
    stopScene = null;
    const main = document.adoptNode(doc.querySelector('.main-container'));
    document.querySelector('.main-container').replaceWith(main);
    document.title = doc.title;
    document.querySelector('wiki-sidebar')?.render();
    startScene(scene); // draws a first frame, so the new page appears rendered
}

document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    // composedPath() reaches into the sidebar's shadow DOM.
    const link = event.composedPath().find(el => el instanceof HTMLAnchorElement);
    if (!link || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.hash) return; // in-page anchor
    event.preventDefault();
    if (url.href !== location.href) navigate(url.href, { push: true });
});

addEventListener('popstate', () => navigate(location.href, { push: false }));

startScene(await loadScene(location.href, document));
