from __future__ import annotations

import json
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "exports" / "agent-demo" / "search_index.json"
SOURCE_PATTERNS = ("wiki/**/*.md", "sources/extracted-md/*.md")


def main() -> None:
    records = []
    for path in _source_files():
        records.extend(_chunks_for(path))

    payload = {
        "name": "api-infra-agent-demo-search-index",
        "version": str(date.today()),
        "generated_at": str(date.today()),
        "source_project": "projects/api-infra",
        "records": records,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUTPUT} ({len(records)} records)")


def _source_files() -> list[Path]:
    files: list[Path] = []
    seen: set[Path] = set()
    for pattern in SOURCE_PATTERNS:
        for path in sorted(ROOT.glob(pattern)):
            if path.is_file() and path not in seen:
                seen.add(path)
                files.append(path)
    return files


def _chunks_for(path: Path) -> list[dict[str, object]]:
    relative = path.relative_to(ROOT).as_posix()
    lines = path.read_text(encoding="utf-8").splitlines()
    chunks: list[dict[str, object]] = []
    title = ""
    buffer: list[str] = []
    start_line = 1

    def flush() -> None:
        if not buffer:
            return
        text = " ".join(line.strip() for line in buffer if line.strip())
        if text:
            chunks.append(
                {
                    "source": relative,
                    "line_no": start_line,
                    "title": title or path.stem,
                    "text": _compact(text),
                }
            )

    for line_no, line in enumerate(lines, start=1):
        stripped = line.strip()
        if stripped.startswith("#"):
            flush()
            title = stripped.lstrip("#").strip()
            buffer = []
            start_line = line_no
            continue
        if not stripped:
            if len(buffer) >= 4:
                flush()
                buffer = []
                start_line = line_no + 1
            continue
        if not buffer:
            start_line = line_no
        buffer.append(stripped)
        if len(" ".join(buffer)) > 900:
            flush()
            buffer = []
            start_line = line_no + 1

    flush()
    return chunks


def _compact(text: str, max_length: int = 1200) -> str:
    normalized = " ".join(text.split())
    if len(normalized) <= max_length:
        return normalized
    return normalized[: max_length - 1] + "…"


if __name__ == "__main__":
    main()
