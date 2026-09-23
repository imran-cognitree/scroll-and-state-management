from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from app.database import get_database
from app.models import Finding, FindingDetail, FindingStatusUpdate, DashboardData, DashboardMetadata, FindingsByType, UserInDB
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/findings", tags=["findings"])

@router.get("", response_model=DashboardData)
async def get_findings(
    project: Optional[str] = None,
    type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    scanner: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=1000)
):
    db = get_database()
    
    query = {}
    if project and project != "all":
        query["project"] = project
    if type:
        query["type"] = type
    if severity:
        query["severity"] = severity
    if status:
        query["status"] = status
    if scanner:
        query["scanner"] = scanner

    skip = (page - 1) * limit
    
    cursor = db.findings.find(query, {"raw_data": 0}).skip(skip).limit(limit)
    findings_list = await cursor.to_list(length=limit)
    
    total = await db.findings.count_documents(query)
    
    # Getting metadata. In a real app this might be cached or pre-computed.
    # We will do an aggregation to get counts by type for the selected project.
    meta_query = {}
    if project and project != "all":
        meta_query["project"] = project
        
    pipeline = [
        {"$match": meta_query},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}}
    ]
    type_counts_raw = await db.findings.aggregate(pipeline).to_list(length=None)
    counts = {"SCA": 0, "SAST": 0, "DAST": 0}
    for item in type_counts_raw:
        if item["_id"] in counts:
            counts[item["_id"]] = item["count"]
            
    projects_list = await db.findings.distinct("project")
    
    # We'll fetch the generated_at from the first finding or use a generic one
    first_doc = await db.findings.find_one({}, sort=[("detected_at", -1)])
    generated_at = first_doc["detected_at"] if first_doc else "Unknown"

    metadata = DashboardMetadata(
        generated_for="Security Report",
        generated_at=generated_at,
        projects=projects_list,
        total_findings=total,
        findings_by_type=FindingsByType(**counts)
    )
    
    return DashboardData(
        metadata=metadata,
        findings=findings_list,
        total=total,
        page=page,
        limit=limit
    )

@router.get("/{id}", response_model=FindingDetail)
async def get_finding(id: str):
    db = get_database()
    finding = await db.findings.find_one({"_id": id})
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
    return finding

@router.patch("/{id}", response_model=Finding)
async def update_finding(
    id: str, 
    update_data: FindingStatusUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    db = get_database()
    
    # Find existing
    finding = await db.findings.find_one({"_id": id}, {"raw_data": 0})
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
        
    # Update status
    result = await db.findings.update_one(
        {"_id": id},
        {"$set": {"status": update_data.status}}
    )
    
    updated_finding = await db.findings.find_one({"_id": id}, {"raw_data": 0})
    return updated_finding

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_finding(
    id: str,
    current_user: UserInDB = Depends(require_admin)
):
    db = get_database()
    result = await db.findings.delete_one({"_id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Finding not found")
    return None
