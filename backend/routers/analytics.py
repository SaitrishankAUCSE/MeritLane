from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from ..services.analytics import calculate_percentiles, analyze_skill_distribution
from ..auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.post("/percentiles")
async def get_percentiles(scores: List[float], user: dict = Depends(get_current_user)):
    """Calculate score distributions for a set of candidate scores."""
    result = calculate_percentiles(scores)
    return {"status": "success", "data": result}

@router.post("/skills-distribution")
async def get_skills_distribution(data: List[Dict[str, Any]], user: dict = Depends(get_current_user)):
    """Analyze skill distribution across multiple candidates."""
    df_summary = analyze_skill_distribution(data)
    # Convert pandas DataFrame to dict for JSON serialization
    return {"status": "success", "data": df_summary.to_dict(orient="records")}
