from http.server import BaseHTTPRequestHandler

from python_agent_backend import parse_json_body, proxy_local_llm


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
        status_code, content_type, payload = proxy_local_llm(parse_json_body(self))
        self._set_headers(status_code, content_type)
        self.wfile.write(payload)

    def do_GET(self) -> None:
        self._set_headers(405)
        self.wfile.write(b'{"error":"Method not allowed"}')
