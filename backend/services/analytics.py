import pandas as pd
import numpy as np

def calculate_percentiles(scores: list[float]) -> dict:
    """Calculate score distributions using pandas and numpy."""
    if not scores:
        return {"mean": 0, "p50": 0, "p90": 0, "p99": 0}
        
    df = pd.DataFrame(scores, columns=["score"])
    
    return {
        "mean": float(np.mean(df["score"])),
        "p50": float(np.percentile(df["score"], 50)),
        "p90": float(np.percentile(df["score"], 90)),
        "p99": float(np.percentile(df["score"], 99)),
        "std_dev": float(np.std(df["score"]))
    }

def analyze_skill_distribution(candidate_data: list[dict]) -> pd.DataFrame:
    """Process candidate data to find skill gaps and trends."""
    df = pd.DataFrame(candidate_data)
    if df.empty:
        return pd.DataFrame()
        
    # Group by skill and calculate average performance
    if "skill" in df.columns and "score" in df.columns:
        summary = df.groupby("skill")["score"].agg(["mean", "count"]).reset_index()
        return summary
    return pd.DataFrame()
