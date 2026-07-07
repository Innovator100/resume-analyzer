from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List

# What the client SENDS when registering
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# What we SEND BACK to the client (never include password!)
class UserOut(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ResumeOut(BaseModel):
    id: int
    filename: str
    extracted_text: str
    uploaded_at: datetime        # ← changed from str to datetime

    class Config:
        from_attributes = True



class AnalysisRequest(BaseModel):
    resume_id: int
    job_description: str
    extracted_text: str

class AnalysisOut(BaseModel):
    id: int
    match_score: float
    ats_score: float
    missing_skills: str
    matched_skills: str
    hidden_skills: str | None = None        # NEW
    suggestions: str
    summary: str
    input_quality: str | None = None        # NEW
    created_at: datetime

    class Config:
        from_attributes = True

class HistoryItem(BaseModel):
    """
    Represents one analysis in the user's history.
    Combines data from both resumes and analyses tables.
    """
    id: int                    # analysis id
    filename: str              # resume filename
    match_score: float         # how well resume matched
    ats_score: float           # ATS compatibility score
    summary: str               # brief AI summary
    created_at: datetime       # when analysis was done

    class Config:
        from_attributes = True