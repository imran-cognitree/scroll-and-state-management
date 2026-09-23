from enum import Enum
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any, List

class Role(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Role = Role.USER

class UserInDB(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr
    name: str
    role: Role
    hashed_password: str

class UserResponse(BaseModel):
    email: EmailStr
    name: str
    role: Role

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[Role] = None

class ScanType(str, Enum):
    SCA = "SCA"
    SAST = "SAST"
    DAST = "DAST"

class Severity(str, Enum):
    Critical = "Critical"
    High = "High"
    Medium = "Medium"
    Low = "Low"

class Status(str, Enum):
    Open = "Open"
    In_Progress = "In Progress"
    Resolved = "Resolved"

class FindingBase(BaseModel):
    id: str = Field(alias="_id")
    type: ScanType
    project: str
    vulnerability_id: str
    package_name: str
    installed_version: str
    vulnerability_type: str
    severity: Severity
    description: str
    fixed_version: str
    status: str
    scanner: str
    location: str
    detected_at: str

class Finding(FindingBase):
    pass

class FindingDetail(FindingBase):
    raw_data: Any

class FindingStatusUpdate(BaseModel):
    status: str

class FindingsByType(BaseModel):
    SCA: int = 0
    SAST: int = 0
    DAST: int = 0

class DashboardMetadata(BaseModel):
    generated_for: str
    generated_at: str
    projects: List[str]
    total_findings: int
    findings_by_type: FindingsByType

class DashboardData(BaseModel):
    metadata: DashboardMetadata
    findings: List[Finding]
    total: int
    page: int
    limit: int
