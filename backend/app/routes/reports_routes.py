import asyncio
import random
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel

from app.auth import require_admin
from app.database import get_database
from app.models import UserInDB

router = APIRouter(prefix="/reports", tags=["reports"])


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

    background_tasks.add_task(simulate_report_generation, task_id)

    return ReportTaskResponse(
        task_id=task_id,
        status="PENDING",
        created_at=created_at,
    )


@router.get("/{task_id}", response_model=ReportStatusResponse)
async def get_report_status(
    task_id: str,
    current_user: UserInDB = Depends(require_admin),
):
    """Poll this endpoint to check the current status of a report generation task."""
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
