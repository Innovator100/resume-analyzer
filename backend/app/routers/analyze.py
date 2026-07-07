from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app import models, schemas
from app.services.ai_analyzer import analyze_resume
import json

# Create a router instance - this groups related endpoints together
# Instead of putting everything in main.py, we split into separate files
router = APIRouter()

@router.post("/analyze", response_model=schemas.AnalysisOut)
def analyze(
    request: schemas.AnalysisRequest,           # Incoming request data (resume_id, job_description, extracted_text)
    db: Session = Depends(get_db),              # Database session injected automatically
    current_user: models.User = Depends(get_current_user)  # Logged in user injected automatically
):

    """
    Analyzes a resume against a job description using AI.
    Steps:
    1. Verify the resume belongs to the current user (security)
    2. Send resume text + job description to Groq AI
    3. Save the analysis results to database
    4. Return the analysis
    """

    # Security check: make sure this resume belongs to the logged in user
    # Prevents users from analyzing other people's resumes
    resume = db.query(models.Resume).filter(
        models.Resume.id == request.resume_id,
        models.Resume.owner_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Send to AI for analysis
    # This calls Groq API and returns a dictionary with scores and suggestions
    try:
        result = analyze_resume(request.extracted_text, request.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    # Save analysis results to database
    # Lists (missing_skills, matched_skills, suggestions) are converted to
    # JSON strings because SQLite doesn't support array columns
    # Save to database including new fields
    analysis = models.Analysis(
        match_score=result["match_score"],
        ats_score=result["ats_score"],
        missing_skills=json.dumps(result["missing_skills"]),
        matched_skills=json.dumps(result["matched_skills"]),
        hidden_skills=json.dumps(result.get("hidden_skills", [])),      # NEW
        suggestions=json.dumps(result["suggestions"]),
        summary=result["summary"],
        input_quality=json.dumps(result.get("input_quality", {})),      # NEW
        job_description=request.job_description,
        resume_id=resume.id
    )

    db.add(analysis)        # Stage the new record
    db.commit()             # Write to database
    db.refresh(analysis)    # Reload to get auto-generated fields (id, created_at)

    return analysis

@router.get("/history", response_model=list[schemas.HistoryItem])
def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Returns all past analyses for the currently logged in user.
    Joins analyses table with resumes table to get filename.
    """

    # Get all resumes belonging to current user
    resumes = db.query(models.Resume).filter(
        models.Resume.owner_id == current_user.id
    ).all()

    # Collect all analyses across all resumes
    history = []
    for resume in resumes:
        # Get all analyses for this resume
        analyses = db.query(models.Analysis).filter(
            models.Analysis.resume_id == resume.id
        ).all()

        # Combine resume filename with each analysis
        for analysis in analyses:
            history.append({
                "id": analysis.id,
                "filename": resume.filename,
                "match_score": analysis.match_score,
                "ats_score": analysis.ats_score,
                "summary": analysis.summary,
                "created_at": analysis.created_at
            })

    # Sort by most recent first
    history.sort(key=lambda x: x["created_at"], reverse=True)

    return history