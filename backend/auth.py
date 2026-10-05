import jwt
from fastapi import Request, HTTPException
from firebase_admin import auth
import os

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-default-key")
ALGORITHM = "HS256"

def verify_jwt_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def verify_firebase_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        return None

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = auth_header.split(" ")[1]
    
    # Try Firebase Auth first
    user = verify_firebase_token(token)
    if user:
        return user
        
    # Fallback to standard JWT
    user = verify_jwt_token(token)
    if user:
        return user
        
    raise HTTPException(status_code=401, detail="Invalid token")
