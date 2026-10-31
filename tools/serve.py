"""Static dev server for the site: serves a folder (src/ by default) with
caching off, so a reload always picks up edited files.
Usage: python3 tools/serve.py [port] [folder]"""

import functools
import http.server
import pathlib
import sys

REPO = pathlib.Path(__file__).resolve().parent.parent


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5180
    root = (REPO / (sys.argv[2] if len(sys.argv) > 2 else "src")).resolve()
    if not root.is_dir():
        sys.exit(f"{root} does not exist (run `just build` first for dist/)")
    handler = functools.partial(NoCacheHandler, directory=str(root))
    with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as server:
        print(f"Serving {root} at http://localhost:{port}/")
        server.serve_forever()


if __name__ == "__main__":
    main()
