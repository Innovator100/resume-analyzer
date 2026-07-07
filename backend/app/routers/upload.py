import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app import models, schemas
from app.services.resume_parser import extract_text

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.ResumeOut)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Validate file type
    if not file.filename.endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files allowed")

    # Save file temporarily to disk
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text
    try:
        text = extract_text(file_path, file.filename)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

    # Save to database
    resume = models.Resume(
        filename=file.filename,
        extracted_text=text,
        owner_id=current_user.id
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return resume