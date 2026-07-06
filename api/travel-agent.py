from http.server import BaseHTTPRequestHandler

from python_agent_backend import build_travel_agent_response, parse_json_body


class handler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code: int, content_type: str = "application/json; charset=utf-8") -> None:
        self.send_response(status_code)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "content-type")
        self.send_header("Content-Type", content_type)
        self.end_headers()

    def do_OPTIONS(self) -> None:
        self._set_headers(204)

    def do_POST(self) -> None:
        try:
            body = parse_json_body(self)
            payload = build_travel_agent_response(body)
            self._set_headers(200)
            self.wfile.write(__import__("json").dumps(payload, ensure_ascii=False).encode("utf-8"))
        except ValueError as error:
            self._set_headers(400)
            self.wfile.write(__import__("json").dumps({"error": str(error)}, ensure_ascii=False).encode("utf-8"))
        except Exception as error:  # pragma: no cover - Vercel runtime path
            self._set_headers(502)
            self.wfile.write(__import__("json").dumps({
                "error": "Python Agent unavailable",
                "detail": str(error),
            }, ensure_ascii=False).encode("utf-8"))

    def do_GET(self) -> None:
        self._set_headers(405)
        self.wfile.write(b'{"error":"Method not allowed"}')
