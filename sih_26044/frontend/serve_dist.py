from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class SpaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=Path(__file__).parent / "dist", **kwargs)

    def do_GET(self):
        if not self.path.split("?", 1)[0].rsplit("/", 1)[-1].count("."):
            self.path = "/index.html"
        super().do_GET()


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 3000), SpaHandler).serve_forever()
