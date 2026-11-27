"""Serve the local editor and verify workshop uploads without retaining a copy."""

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from workshop import MAX_BYTES, OUTPUT_NAME, SOURCES, check, digest, sample, save_new, verify_output, workspace_id

GALLERY = Path(__file__).with_name("index.html").parent
HOST = "127.0.0.1"
PORT = 8765
ASSETS = {
    "/": ("index.html", "text/html"),
    "/editor": ("editor.html", "text/html"),
    "/style.css": ("style.css", "text/css"),
    "/upload.js": ("upload.js", "text/javascript"),
    "/editor.js": ("editor.js", "text/javascript"),
}


class DemoHandler(BaseHTTPRequestHandler):
    timeout = 5

    def log_message(self, *_):
        pass

    @property
    def origin(self):
        return f"http://{HOST}:{self.server.server_port}"

    def respond(self, status, body, content_type):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'none'; script-src 'self'; style-src 'self'; "
            "img-src 'self' blob:; connect-src 'self'; base-uri 'none'; "
            "form-action 'self'; frame-ancestors 'none'",
        )
        self.end_headers()
        self.wfile.write(body)

    def respond_json(self, status, **payload):
        self.respond(status, json.dumps(payload).encode(), "application/json")

    def check_host(self):
        if self.headers.get("Host") == f"{HOST}:{self.server.server_port}":
            return True
        self.respond_json(403, error=f"Open the workshop at {self.origin}/.")
        return False

    def do_GET(self):
        if not self.check_host():
            return
        try:
            if self.path in ASSETS:
                name, content_type = ASSETS[self.path]
                self.respond(200, (GALLERY / name).read_bytes(), f"{content_type}; charset=utf-8")
            elif self.path == "/workspace":
                check()
                self.respond_json(200, workspace=workspace_id(), samples=list(SOURCES), output="edited images")
            elif self.path in {f"/images/{photo}.jpg" for photo in SOURCES}:
                photo = Path(self.path).stem
                self.respond(200, sample(photo), "image/jpeg")
            else:
                self.respond_json(404, error="This route is outside the workshop.")
        except (OSError, ValueError):
            self.respond_json(409, error="Workshop files are missing or changed. Run the demo check.")

    def jpeg_body(self):
        if self.headers.get_content_type() != "image/jpeg":
            self.respond_json(415, error="Choose a JPEG.")
            return None
        try:
            size = int(self.headers.get("Content-Length", ""))
        except ValueError:
            size = 0
        if not 0 < size <= MAX_BYTES:
            self.respond_json(400, error="Each JPEG must be at most 5 MB.")
            return None
        try:
            data = self.rfile.read(size)
        except TimeoutError:
            self.respond_json(408, error="The JPEG transfer timed out.")
            return None
        if len(data) != size or not data.startswith(b"\xff\xd8\xff") or not data.endswith(b"\xff\xd9"):
            self.respond_json(400, error="The receiver did not get a complete JPEG.")
            return None
        return data

    def do_POST(self):
        if not self.check_host():
            return
        if self.headers.get("Origin") != self.origin:
            self.respond_json(403, error=f"Use the editor or uploader at {self.origin}/.")
            return
        if self.path not in {"/save", "/upload"}:
            self.respond_json(404, error="This route is outside the workshop.")
            return

        if self.path == "/save":
            photo = self.headers.get("X-Demo-Photo", "")
            if photo not in SOURCES:
                self.respond_json(400, error="Choose one of the three workshop samples.")
                return
        else:
            name = self.headers.get("X-Demo-Filename", "")
            if not OUTPUT_NAME.fullmatch(name):
                self.respond_json(400, error="Choose an edited Earth, Moon, or Mars JPEG.")
                return

        data = self.jpeg_body()
        if data is None:
            return
        try:
            if self.path == "/save":
                name = save_new(photo, data).name
            elif not verify_output(name, data):
                self.respond_json(409, error="Choose the matching copy in this workshop’s edited images folder.")
                return
        except (OSError, ValueError):
            self.respond_json(409, error="Check this workshop’s edited images folder.")
            return
        self.respond_json(200, name=name, size=len(data), sha256=digest(data))


def receiver(port=PORT):
    return ThreadingHTTPServer((HOST, port), DemoHandler)
