"""Static dev server for the site: serves a folder (src/ by default) with
caching off and live reload. HTML pages get a small script that listens on
/__reload; when a file in the folder changes, CSS edits are swapped in place
(the 3D scenes keep running) and anything else reloads the page.
Usage: python3 tools/serve.py [port] [folder]"""

import functools
import http.server
import json
import pathlib
import sys
import threading
import time

REPO = pathlib.Path(__file__).resolve().parent.parent
RELOAD_PATH = "/__reload"

RELOAD_SCRIPT = f"""<script>
new EventSource('{RELOAD_PATH}').onmessage = event => {{
    const changed = JSON.parse(event.data);
    if (!changed.every(path => path.endsWith('.css'))) return location.reload();
    for (const link of document.querySelectorAll('link[rel=stylesheet]')) {{
        const url = new URL(link.href);
        url.searchParams.set('reload', Date.now());
        link.href = url.href;
    }}
}};
</script>
""".encode()


class Watcher:
    """Polls the folder's file times and wakes waiting clients on a change."""

    def __init__(self, root):
        self.root = root
        self.version = 0
        self.changed = []
        self.cond = threading.Condition()
        self.times = self.scan()
        threading.Thread(target=self.run, daemon=True).start()

    def scan(self):
        times = {}
        for path in self.root.rglob("*"):
            try:
                if path.is_file():
                    times[path] = path.stat().st_mtime_ns
            except OSError:
                pass  # deleted mid-scan
        return times

    def run(self):
        while True:
            time.sleep(0.25)
            times = self.scan()
            changed = [p for p in times.keys() | self.times.keys()
                       if times.get(p) != self.times.get(p)]
            self.times = times
            if changed:
                names = sorted(p.relative_to(self.root).as_posix() for p in changed)
                print("Changed:", ", ".join(names))
                with self.cond:
                    self.version += 1
                    self.changed = names
                    self.cond.notify_all()

    def wait(self, version):
        """Block until the version passes `version`; returns (version, changed)."""
        with self.cond:
            self.cond.wait_for(lambda: self.version > version, timeout=15)
            return self.version, self.changed


class DevHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
    }

    def __init__(self, *args, watcher, **kwargs):
        self.watcher = watcher
        super().__init__(*args, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path == RELOAD_PATH:
            return self.stream_reloads()
        path = pathlib.Path(self.translate_path(self.path))
        if path.is_dir() and self.path.split("?")[0].endswith("/"):
            path = path / "index.html"
        if path.suffix == ".html" and path.is_file():
            return self.send_html(path)
        super().do_GET()

    def send_html(self, path):
        body = path.read_bytes()
        at = body.rfind(b"</body>")
        body = body[:at] + RELOAD_SCRIPT + body[at:] if at >= 0 else body + RELOAD_SCRIPT
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def stream_reloads(self):
        """Server-sent events: one message per change, comments as keep-alives."""
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.end_headers()
        version = self.watcher.version
        try:
            while True:
                new_version, changed = self.watcher.wait(version)
                if new_version > version:
                    version = new_version
                    self.wfile.write(f"data: {json.dumps(changed)}\n\n".encode())
                else:
                    self.wfile.write(b": ping\n\n")
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass  # tab closed or reloaded

    def log_message(self, format, *args):
        if RELOAD_PATH not in self.requestline:
            super().log_message(format, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5180
    root = (REPO / (sys.argv[2] if len(sys.argv) > 2 else "src")).resolve()
    if not root.is_dir():
        sys.exit(f"{root} does not exist (run `just build` first for dist/)")
    handler = functools.partial(DevHandler, directory=str(root), watcher=Watcher(root))
    with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as server:
        print(f"Serving {root} at http://localhost:{port}/ (live reload on)")
        server.serve_forever()


if __name__ == "__main__":
    main()
