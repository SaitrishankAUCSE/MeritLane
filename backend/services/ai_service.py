import os
import google.generativeai as genai

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_ats_summary(resume_text: str) -> str:
    """Uses Gemini API to analyze a resume."""
    if not resume_text:
        return "No resume provided."
        
    prompt = f"""
    You are an expert technical recruiter and ATS system.
    Analyze the following resume and provide a concise summary of the candidate's strengths, 
    key skills, and potential red flags.
    
    Resume:
    {resume_text}
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "Failed to generate AI summary."

def generate_interview_questions(skill: str, difficulty: str = "medium") -> list[str]:
    """Uses Gemini API to generate skill-specific questions."""
    prompt = f"Generate 3 {difficulty} technical interview questions for {skill}."
    try:
        response = model.generate_content(prompt)
        # Simple parsing for demo purposes
        return [q.strip() for q in response.text.split("\\n") if q.strip() and q.strip()[0].isdigit()]
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return []
