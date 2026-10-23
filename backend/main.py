"""
Pulse API — backend
A small FastAPI service that proxies outbound HTTP requests on behalf of the
frontend (so the browser doesn't hit CORS walls), and keeps an in-memory
log of every call so the dashboard/reports pages have something to show.

Nothing here is persisted to disk — restart the server and history clears.
That's a deliberate scope cut for a personal tool, not an oversight.
"""

from __future__ import annotations

import time
import uuid
from collections import Counter
from datetime import datetime, timezone
from typing import Any, Literal, Optional

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Pulse API", version="1.0.0")

# Wide-open CORS is fine here: this backend only ever talks to the Vite dev
# server / a locally hosted build of the frontend. Tighten this if you ever
# deploy it somewhere reachable by anyone else.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

HTTP_METHODS = Literal["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]

# ---------------------------------------------------------------------------
# In-memory store
# ---------------------------------------------------------------------------

class HistoryEntry(BaseModel):
    id: str
    method: str
    url: str
    status_code: Optional[int] = None
    ok: bool
    duration_ms: float
    response_size_bytes: int
    error: Optional[str] = None
    timestamp: str


HISTORY: list[HistoryEntry] = []
MAX_HISTORY = 500


def _record(entry: HistoryEntry) -> None:
    HISTORY.append(entry)
    if len(HISTORY) > MAX_HISTORY:
        del HISTORY[0 : len(HISTORY) - MAX_HISTORY]


# ---------------------------------------------------------------------------
# Request/response models
# ---------------------------------------------------------------------------

class ProxyRequest(BaseModel):
    method: HTTP_METHODS = "GET"
    url: str
    headers: dict[str, str] = Field(default_factory=dict)
    params: dict[str, str] = Field(default_factory=dict)
    body_mode: Literal["none", "json", "raw"] = "none"
    json_body: Optional[Any] = None
    raw_body: Optional[str] = None
    timeout_seconds: float = 30.0


class ProxyResponse(BaseModel):
    id: str
    ok: bool
    status_code: Optional[int] = None
    status_text: Optional[str] = None
    headers: dict[str, str] = Field(default_factory=dict)
    body: Optional[str] = None
    is_json: bool = False
    duration_ms: float
    size_bytes: int
    error: Optional[str] = None


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/proxy", response_model=ProxyResponse)
async def proxy(req: ProxyRequest) -> ProxyResponse:
    if not req.url or not (req.url.startswith("http://") or req.url.startswith("https://")):
        raise HTTPException(status_code=400, detail="url must start with http:// or https://")

    entry_id = str(uuid.uuid4())
    start = time.perf_counter()

    kwargs: dict[str, Any] = {
        "method": req.method,
        "url": req.url,
        "headers": req.headers or None,
        "params": req.params or None,
    }
    if req.body_mode == "json" and req.json_body is not None:
        kwargs["json"] = req.json_body
    elif req.body_mode == "raw" and req.raw_body is not None:
        kwargs["content"] = req.raw_body

    try:
        async with httpx.AsyncClient(timeout=req.timeout_seconds, follow_redirects=True) as client:
            resp = await client.request(**kwargs)
        duration_ms = (time.perf_counter() - start) * 1000
        body_text = resp.text
        is_json = "application/json" in resp.headers.get("content-type", "")

        result = ProxyResponse(
            id=entry_id,
            ok=resp.is_success,
            status_code=resp.status_code,
            status_text=resp.reason_phrase,
            headers=dict(resp.headers),
            body=body_text,
            is_json=is_json,
            duration_ms=round(duration_ms, 2),
            size_bytes=len(resp.content),
        )
        _record(
            HistoryEntry(
                id=entry_id,
                method=req.method,
                url=req.url,
                status_code=resp.status_code,
                ok=resp.is_success,
                duration_ms=result.duration_ms,
                response_size_bytes=result.size_bytes,
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
        )
        return result

    except httpx.TimeoutException:
        duration_ms = (time.perf_counter() - start) * 1000
        _record(
            HistoryEntry(
                id=entry_id,
                method=req.method,
                url=req.url,
                status_code=None,
                ok=False,
                duration_ms=round(duration_ms, 2),
                response_size_bytes=0,
                error="timeout",
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
        )
        return ProxyResponse(
            id=entry_id,
            ok=False,
            duration_ms=round(duration_ms, 2),
            size_bytes=0,
            error=f"Request timed out after {req.timeout_seconds}s",
        )
    except httpx.RequestError as exc:
        duration_ms = (time.perf_counter() - start) * 1000
        _record(
            HistoryEntry(
                id=entry_id,
                method=req.method,
                url=req.url,
                status_code=None,
                ok=False,
                duration_ms=round(duration_ms, 2),
                response_size_bytes=0,
                error=str(exc),
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
        )
        return ProxyResponse(
            id=entry_id,
            ok=False,
            duration_ms=round(duration_ms, 2),
            size_bytes=0,
            error=f"Request failed: {exc}",
        )


@app.get("/api/history")
def get_history(limit: int = 100) -> list[HistoryEntry]:
    return list(reversed(HISTORY[-limit:]))


@app.delete("/api/history")
def clear_history() -> dict[str, str]:
    HISTORY.clear()
    return {"status": "cleared"}


@app.get("/api/analytics")
def analytics() -> dict[str, Any]:
    if not HISTORY:
        return {
            "total_requests": 0,
            "success_rate": 0,
            "avg_duration_ms": 0,
            "status_distribution": {},
            "method_distribution": {},
            "slowest": [],
            "fastest": [],
        }

    total = len(HISTORY)
    successes = sum(1 for h in HISTORY if h.ok)
    avg_duration = sum(h.duration_ms for h in HISTORY) / total

    status_buckets: Counter[str] = Counter()
    for h in HISTORY:
        if h.status_code is None:
            status_buckets["error"] += 1
        else:
            bucket = f"{h.status_code // 100}xx"
            status_buckets[bucket] += 1

    method_dist = Counter(h.method for h in HISTORY)

    by_duration = sorted(HISTORY, key=lambda h: h.duration_ms)
    fastest = by_duration[:5]
    slowest = list(reversed(by_duration[-5:]))

    def _slim(h: HistoryEntry) -> dict[str, Any]:
        return {
            "url": h.url,
            "method": h.method,
            "duration_ms": h.duration_ms,
            "status_code": h.status_code,
        }

    return {
        "total_requests": total,
        "success_rate": round(successes / total * 100, 1),
        "avg_duration_ms": round(avg_duration, 1),
        "status_distribution": dict(status_buckets),
        "method_distribution": dict(method_dist),
        "slowest": [_slim(h) for h in slowest],
        "fastest": [_slim(h) for h in fastest],
    }


@app.get("/api/reports/summary")
def report_summary() -> dict[str, Any]:
    stats = analytics()
    errors = [h for h in HISTORY if not h.ok]
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "performance": {
            "total_requests": stats["total_requests"],
            "success_rate": stats["success_rate"],
            "avg_duration_ms": stats["avg_duration_ms"],
        },
        "status_distribution": stats["status_distribution"],
        "method_distribution": stats["method_distribution"],
        "errors": [
            {
                "url": h.url,
                "method": h.method,
                "error": h.error,
                "status_code": h.status_code,
                "timestamp": h.timestamp,
            }
            for h in errors[-25:]
        ],
    }
