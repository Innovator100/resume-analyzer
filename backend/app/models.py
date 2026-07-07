from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    """
    Represents the 'users' table in the database.
    Stores registered user accounts.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)          # Auto-incrementing unique ID
    email = Column(String, unique=True, index=True, nullable=False)  # Must be unique, indexed for fast lookup
    hashed_password = Column(String, nullable=False)             # bcrypt hashed password, never raw
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Auto set on creation

    # One user can have many resumes
    # 'back_populates' links both sides of the relationship
    resumes = relationship("Resume", back_populates="owner")


class Resume(Base):
    """
    Represents the 'resumes' table in the database.
    Stores uploaded resume files and their extracted text.
    Each resume belongs to one user.
    """
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)                    # Original file name e.g. "john_resume.pdf"
    extracted_text = Column(Text, nullable=False)               # Full text extracted from PDF/DOCX
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))          # Links to the user who uploaded this

    # Resume belongs to one user
    owner = relationship("User", back_populates="resumes")
    # One resume can have many analyses (user can analyze same resume against different jobs)
    analyses = relationship("Analysis", back_populates="resume")


class Analysis(Base):
    """
    Represents the 'analyses' table in the database.
    Stores AI analysis results for a resume vs job description.
    """
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    match_score = Column(Float, nullable=False)
    ats_score = Column(Float, nullable=False)
    missing_skills = Column(Text, nullable=False)       # JSON string
    matched_skills = Column(Text, nullable=False)       # JSON string
    hidden_skills = Column(Text, nullable=True)         # NEW: implied skills from projects
    suggestions = Column(Text, nullable=False)          # JSON string
    summary = Column(Text, nullable=False)
    input_quality = Column(Text, nullable=True)         # NEW: feedback on input quality
    job_description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resume_id = Column(Integer, ForeignKey("resumes.id"))

    resume = relationship("Resume", back_populates="analyses")