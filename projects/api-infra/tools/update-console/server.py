from __future__ import annotations

import argparse
from email import policy
from email.parser import BytesParser
import json
import mimetypes
from datetime import datetime
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


PROJECT_ROOT = Path(__file__).resolve().parents[2]
APP_ROOT = Path(__file__).resolve().parent
REQUEST_ROOT = PROJECT_ROOT / "notes" / "update-requests"


def _json_default(value: object) -> str:
    if isinstance(value, Path):
        return value.as_posix()
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def _safe_name(name: str, fallback: str = "upload") -> str:
    clean = Path(name or fallback).name.strip()
    for char in '<>:"/\\|?*':
        clean = clean.replace(char, "_")
    clean = clean.strip(". ")
    return clean or fallback


def _slug(value: str) -> str:
    value = "".join(ch.lower() if ch.isalnum() else "-" for ch in value)
    value = "-".join(part for part in value.split("-") if part)
    return value[:48] or "request"


def _read_json(path: Path, fallback: object) -> object:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def _project_status() -> dict[str, object]:
    files = []
    for pattern in (
        "wiki/sources/*.md",
        "wiki/concepts/*.md",
        "wiki/faq/*.md",
        "wiki/sops/*.md",
        "sources/extracted-md/*.md",
        "exports/agent-demo/*.json",
    ):
        for path in sorted(PROJECT_ROOT.glob(pattern)):
            if path.is_file():
                files.append(
                    {
                        "path": path.relative_to(PROJECT_ROOT).as_posix(),
                        "name": path.name,
                        "size": path.stat().st_size,
                        "modified_at": datetime.fromtimestamp(path.stat().st_mtime).isoformat(timespec="seconds"),
                    }
                )

    raw_pdfs = list((PROJECT_ROOT / "sources" / "raw-pdfs").glob("*.pdf"))
    manifest = _read_json(PROJECT_ROOT / "exports" / "agent-demo" / "manifest.json", {})
    search_index = _read_json(PROJECT_ROOT / "exports" / "agent-demo" / "search_index.json", {})
    records = search_index.get("records", []) if isinstance(search_index, dict) else []

    return {
        "project": "api-infra",
        "project_root": PROJECT_ROOT.as_posix(),
        "raw_pdf_count": len(raw_pdfs),
        "wiki_file_count": len([item for item in files if str(item["path"]).startswith("wiki/")]),
        "export_file_count": len([item for item in files if str(item["path"]).startswith("exports/")]),
        "search_record_count": len(records),
        "manifest_version": manifest.get("version") if isinstance(manifest, dict) else None,
        "files": files,
        "recent_requests": _recent_requests(),
    }


def _recent_requests(limit: int = 8) -> list[dict[str, object]]:
    if not REQUEST_ROOT.exists():
        return []
    items = []
    for path in sorted(REQUEST_ROOT.iterdir(), reverse=True):
        if not path.is_dir():
            continue
        payload = _read_json(path / "request.json", {})
        if isinstance(payload, dict):
            items.append(
                {
                    "id": payload.get("id", path.name),
                    "title": payload.get("title") or payload.get("document_name") or payload.get("target_hint") or path.name,
                    "change_type": payload.get("change_type"),
                    "behavior": payload.get("behavior"),
                    "created_at": payload.get("created_at"),
                    "path": path.relative_to(PROJECT_ROOT).as_posix(),
                }
            )
        if len(items) >= limit:
            break
    return items


def _request_markdown(payload: dict[str, object], files: list[dict[str, str]]) -> str:
    lines = [
        "# LLM Wiki 更新请求",
        "",
        f"- 请求 ID：`{payload.get('id', '')}`",
        f"- 创建时间：`{payload.get('created_at', '')}`",
        f"- 知识域：`{payload.get('project', 'api-infra')}`",
        f"- 文档名称：{payload.get('document_name') or payload.get('target_hint', '')}",
        f"- 行为：{payload.get('behavior_label') or payload.get('behavior') or payload.get('change_type', '')}",
        f"- 同步 demo 导出：{payload.get('sync_exports', '')}",
        f"- 记录日志：{payload.get('write_log', '')}",
        "",
        "## 用户给出的内容",
        "",
        str(payload.get("change_text", "")).strip() or "未填写",
        "",
        "## 来源或备注",
        "",
        str(payload.get("source_note", "")).strip() or "未填写",
        "",
        "## 附件",
        "",
    ]
    if files:
        lines.extend(f"- `{item['path']}`" for item in files)
    else:
        lines.append("- 无")
    lines.extend(
        [
            "",
            "## 给 Codex 的处理边界",
            "",
            "- 只处理 `projects/api-infra/`。",
            "- 不读取或修改 `projects/agent-learning/`，除非用户另行明确要求。",
            "- 根据文档名称和内容关键词自行检索应更新的位置。",
            "- 小补丁优先更新 wiki、必要的 exports JSON、search_index 和 log。",
            "- 新文档先检查附件，再决定是否进入 raw-pdfs、extracted-md、wiki/sources 和主题页。",
        ]
    )
    return "\n".join(lines).strip() + "\n"


def _parse_multipart(content_type: str, body: bytes) -> tuple[dict[str, object], list[tuple[str, bytes]]]:
    raw_message = (
        f"Content-Type: {content_type}\r\n"
        "MIME-Version: 1.0\r\n"
        "\r\n"
    ).encode("utf-8") + body
    message = BytesParser(policy=policy.default).parsebytes(raw_message)
    payload: dict[str, object] = {}
    uploads: list[tuple[str, bytes]] = []

    for part in message.iter_parts():
        disposition = part.get("Content-Disposition", "")
        if "form-data" not in disposition:
            continue
        name = part.get_param("name", header="content-disposition")
        filename = part.get_filename()
        content = part.get_payload(decode=True) or b""
        if name == "payload":
            charset = part.get_content_charset() or "utf-8"
            payload = json.loads(content.decode(charset) or "{}")
        elif name == "files" and filename:
            uploads.append((_safe_name(filename), content))

    return payload, uploads


class UpdateConsoleHandler(BaseHTTPRequestHandler):
    server_version = "LLMWikiUpdateConsole/0.1"

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/status":
            self._send_json(_project_status())
            return
        if parsed.path == "/api/requests":
            params = parse_qs(parsed.query)
            limit = int(params.get("limit", ["12"])[0])
            self._send_json({"requests": _recent_requests(limit=limit)})
            return
        if parsed.path in {"", "/"}:
            self._send_file(APP_ROOT / "index.html")
            return
        requested = _safe_name(parsed.path.lstrip("/"), "index.html")
        path = (APP_ROOT / requested).resolve()
        if APP_ROOT in path.parents or path == APP_ROOT:
            self._send_file(path)
            return
        self.send_error(HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:
        try:
            parsed = urlparse(self.path)
            if parsed.path != "/api/requests":
                self.send_error(HTTPStatus.NOT_FOUND)
                return

            content_type = self.headers.get("Content-Type", "")
            content_length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(content_length)
            files: list[dict[str, str]] = []

            if content_type.startswith("multipart/form-data"):
                payload, uploads = _parse_multipart(content_type, body)
                now = datetime.now()
                request_id = f"{now:%Y%m%d-%H%M%S}-{_slug(str(payload.get('change_type', 'update')))}"
                target_dir = REQUEST_ROOT / request_id
                upload_dir = target_dir / "uploads"
                upload_dir.mkdir(parents=True, exist_ok=True)

                for filename, content in uploads:
                    destination = upload_dir / filename
                    destination.write_bytes(content)
                    files.append(
                        {
                            "filename": filename,
                            "path": destination.relative_to(PROJECT_ROOT).as_posix(),
                        }
                    )
            else:
                payload = json.loads(body.decode("utf-8") or "{}")
                now = datetime.now()
                request_id = f"{now:%Y%m%d-%H%M%S}-{_slug(str(payload.get('change_type', 'update')))}"
                target_dir = REQUEST_ROOT / request_id
                target_dir.mkdir(parents=True, exist_ok=True)

            payload["id"] = request_id
            payload["created_at"] = now.isoformat(timespec="seconds")
            payload["project"] = "api-infra"
            payload["uploaded_files"] = files

            target_dir.mkdir(parents=True, exist_ok=True)
            (target_dir / "request.json").write_text(
                json.dumps(payload, ensure_ascii=False, indent=2, default=_json_default) + "\n",
                encoding="utf-8",
            )
            (target_dir / "request.md").write_text(_request_markdown(payload, files), encoding="utf-8")

            self._send_json(
                {
                    "ok": True,
                    "id": request_id,
                    "path": target_dir.relative_to(PROJECT_ROOT).as_posix(),
                    "files": files,
                },
                status=HTTPStatus.CREATED,
            )
        except Exception as exc:
            self._send_json({"ok": False, "error": str(exc)}, status=HTTPStatus.BAD_REQUEST)

    def _send_json(self, payload: object, status: HTTPStatus = HTTPStatus.OK) -> None:
        encoded = json.dumps(payload, ensure_ascii=False, indent=2, default=_json_default).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def _send_file(self, path: Path) -> None:
        if not path.exists() or not path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        content = path.read_bytes()
        content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        if path.suffix == ".html":
            content_type = "text/html; charset=utf-8"
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def log_message(self, format: str, *args: object) -> None:
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {self.address_string()} {format % args}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the LLM Wiki update console.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    REQUEST_ROOT.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer((args.host, args.port), UpdateConsoleHandler)
    print(f"LLM Wiki update console: http://{args.host}:{args.port}/")
    print(f"Project root: {PROJECT_ROOT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
