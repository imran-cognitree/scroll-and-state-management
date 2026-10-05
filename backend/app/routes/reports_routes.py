import asyncio
import json
import random
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.auth import require_admin
from app.database import get_database
from app.models import UserInDB

router = APIRouter(prefix="/reports", tags=["reports"])


# ── In-memory pub/sub: maps task_id -> asyncio.Queue ─────────────────────────
# Each SSE subscriber registers a Queue here. When the background task finishes
# it puts the result into the queue so the streaming endpoint can forward it.

_sse_queues: dict[str, asyncio.Queue] = {}


def _get_or_create_queue(task_id: str) -> asyncio.Queue:
    if task_id not in _sse_queues:
        _sse_queues[task_id] = asyncio.Queue()
    return _sse_queues[task_id]


async def notify_task_complete(task_id: str, status: str) -> None:
    """Called by the background worker to push a completion event."""
    if task_id in _sse_queues:
        await _sse_queues[task_id].put(status)


# ── Pydantic response models ──────────────────────────────────────────────────

class ReportTaskResponse(BaseModel):
    task_id: str
    status: str
    created_at: str


class ReportStatusResponse(BaseModel):
    task_id: str
    status: str
    created_at: str
    completed_at: str | None = None
    message: str | None = None


# ── Background simulation ─────────────────────────────────────────────────────

async def simulate_report_generation(task_id: str) -> None:
    """Simulate a long-running report job (30 s), then randomly succeed or fail."""
    await asyncio.sleep(30)

    db = get_database()

    # 80 % chance of success, 20 % chance of failure
    outcome = "SUCCESS" if random.random() < 0.8 else "FAILURE"
    completed_at = datetime.now(timezone.utc).isoformat()

    update_fields: dict = {
        "status": outcome,
        "completed_at": completed_at,
    }

    if outcome == "SUCCESS":
        update_fields["message"] = "Report generated successfully. All findings compiled."
    else:
        update_fields["message"] = "Report generation failed due to a simulated internal error."

    await db.reports.update_one(
        {"_id": task_id},
        {"$set": update_fields},
    )

    # Notify any waiting SSE subscriber
    await notify_task_complete(task_id, outcome)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("", response_model=ReportTaskResponse, status_code=202)
async def create_report(
    background_tasks: BackgroundTasks,
    current_user: UserInDB = Depends(require_admin),
):
    """Accept a report generation request; immediately return task_id while processing in background."""
    db = get_database()

    task_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    task_doc = {
        "_id": task_id,
        "status": "PENDING",
        "created_at": created_at,
        "completed_at": None,
        "message": None,
        "requested_by": current_user.email,
    }

    await db.reports.insert_one(task_doc)

    # Pre-create the queue so it is ready before the background task starts
    _get_or_create_queue(task_id)

    background_tasks.add_task(simulate_report_generation, task_id)

    return ReportTaskResponse(
        task_id=task_id,
        status="PENDING",
        created_at=created_at,
    )


@router.get("/{task_id}/stream")
async def stream_report_status(
    task_id: str,
    current_user: UserInDB = Depends(require_admin),
):
    """
    SSE endpoint — keeps the connection open and pushes a single
    'REPORT_STATUS' event once the background task finishes.

    The client should close the EventSource after receiving the event
    and then fetch the full result via GET /api/reports/{task_id}.
    """
    db = get_database()
    task = await db.reports.find_one({"_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Report task not found")

    # If the task already completed before the client connected, push immediately
    if task["status"] in ("SUCCESS", "FAILURE"):
        async def immediate_stream():
            payload = json.dumps({"status": task["status"], "taskId": task_id})
            yield f"event: REPORT_STATUS\ndata: {payload}\n\n"

        return StreamingResponse(immediate_stream(), media_type="text/event-stream")

    queue = _get_or_create_queue(task_id)

    async def event_stream():
        # Send a heartbeat comment every 15 s to keep the connection alive
        # through proxies that close idle connections.
        try:
            while True:
                try:
                    status = await asyncio.wait_for(queue.get(), timeout=5)
                    payload = json.dumps({"status": status, "taskId": task_id})
                    yield f"event: REPORT_STATUS\ndata: {payload}\n\n"
                    # Terminal event sent — close the stream
                    break
                except asyncio.TimeoutError:
                    # SSE comment (keep-alive ping)
                    yield ": keep-alive\n\n"
        finally:
            # Clean up the queue once the stream is done
            _sse_queues.pop(task_id, None)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disables Nginx buffering
        },
    )


@router.get("/{task_id}", response_model=ReportStatusResponse)
async def get_report_status(
    task_id: str,
    current_user: UserInDB = Depends(require_admin),
):
    """Fetch the final status of a completed report task."""
    db = get_database()

    task = await db.reports.find_one({"_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Report task not found")

    return ReportStatusResponse(
        task_id=task["_id"],
        status=task["status"],
        created_at=task["created_at"],
        completed_at=task.get("completed_at"),
        message=task.get("message"),
    )
