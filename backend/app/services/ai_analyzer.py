import os
from groq import Groq
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Groq client with API key from .env
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def validate_inputs(resume_text: str, job_description: str) -> dict:
    """
    Validates quality of inputs before sending to AI.
    Returns a dict with validation results and warnings.
    """
    warnings = []
    resume_words = len(resume_text.split())
    job_words = len(job_description.split())

    # Check resume length
    if resume_words < 50:
        warnings.append("Your resume seems very short. A detailed resume gives more accurate results.")

    # Check job description length
    if job_words < 30:
        warnings.append("Job description is too short. Please paste the full job posting for accurate results.")

    # Check if job description looks like just a title
    if job_words < 10:
        warnings.append("Please paste the complete job description, not just the job title.")

    return {
        "resume_word_count": resume_words,
        "job_word_count": job_words,
        "warnings": warnings,
        "is_valid": len(warnings) == 0
    }


def analyze_resume(resume_text: str, job_description: str) -> dict:
    """
    Sends resume text and job description to Groq AI.
    Returns a dictionary with:
    - match_score: 0-100
    - ats_score: 0-100
    - missing_skills: list
    - matched_skills: list
    - hidden_skills: list (skills implied but not explicitly stated)
    - suggestions: list
    - summary: string
    - input_quality: dict (feedback on input quality)
    """

    # Improved prompt that handles:
    # 1. Vague job descriptions
    # 2. Hidden/implied skills in projects
    # 3. Strong candidates who express poorly
    prompt = f"""
You are an expert HR professional, career coach, and ATS (Applicant Tracking System) specialist 
with 20 years of experience evaluating resumes.

Analyze the following resume against the job description carefully and thoroughly.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

IMPORTANT INSTRUCTIONS:

1. HIDDEN SKILLS DETECTION:
   - Look beyond explicit skill mentions
   - If someone says "built an earthquake alert system", they likely used:
     sensors, data processing, real-time systems, APIs, alert mechanisms
   - If someone says "made an e-commerce site", they likely used:
     frontend, backend, database, payment integration, user auth
   - Give credit for these IMPLIED skills in your scoring
   - List them separately as "hidden_skills"

2. VAGUE JOB DESCRIPTION HANDLING:
   - If the job description is vague or short, make reasonable assumptions
     based on the job title and industry standards
   - Still provide useful analysis based on what you can infer
   - Note in your summary if the job description was vague

3. FAIR SCORING:
   - Don't penalize candidates for poor resume writing style
   - Focus on actual skills and experience, not how well they are expressed
   - A project that demonstrates a skill counts, even if not perfectly worded
   - Give benefit of the doubt when skills are implied

4. SUGGESTIONS MUST BE SPECIFIC:
   - Don't give generic advice like "improve your resume"
   - Give specific advice like "expand your earthquake project to mention:
     the sensors used, programming language, data processing method,
     and how alerts were sent"
   - Each suggestion should be actionable and directly tied to this job

5. ATS SCORE:
   - ATS systems scan for exact keywords
   - Check if resume has the exact keywords from job description
   - Even if candidate has the skill, if the keyword is missing, ATS will reject
   - Reflect this accurately in ats_score

Return ONLY a JSON object with exactly this structure (no extra text, no markdown):
{{
    "match_score": <number 0-100>,
    "ats_score": <number 0-100>,
    "missing_skills": [<list of skills clearly missing>],
    "matched_skills": [<list of skills clearly present>],
    "hidden_skills": [<list of skills implied by projects/experience but not explicitly stated>],
    "suggestions": [<list of SPECIFIC actionable improvement suggestions>],
    "summary": "<detailed summary including: overall assessment, strongest points, main gaps, and one encouraging note>",
    "input_quality": {{
        "resume_quality": "<poor/fair/good>",
        "job_description_quality": "<poor/fair/good>",
        "notes": "<any notes about input quality that affected analysis>"
    }}
}}
"""

    # Call Groq API
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                # Tell the AI to be fair and look for hidden skills
                "content": """You are an expert HR professional and career coach. 
                You believe in giving candidates fair evaluations by looking beyond 
                surface-level resume writing to find actual skills and potential.
                Always respond with valid JSON only, no markdown, no extra text."""
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        # Lower temperature for consistent JSON output
        temperature=0.3,
    )

    # Extract response text
    raw = response.choices[0].message.content.strip()

    # Clean markdown wrappers if AI accidentally adds them
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    # Parse JSON string to Python dictionary
    result = json.loads(raw)
    return result