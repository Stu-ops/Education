# auth.py
import jwt
import os
import logging
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional
from passlib.context import CryptContext

# Configure logging
logger = logging.getLogger(__name__)

# JWT Settings - Use environment variable with secure fallback
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production-use-env-variable-instead")
if SECRET_KEY == "your-secret-key-change-this-in-production-use-env-variable-instead":
    logger.warning("Using default SECRET_KEY! Set SECRET_KEY environment variable for production.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 Password Bearer - works with FastAPI docs and all authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/token")

# Password hashing utilities
def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

# Create JWT
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Verify JWT token
def verify_token(token: str = Depends(oauth2_scheme)) -> str:
    """Verify JWT token and return username.
    
    Works with:
    - FastAPI Swagger UI "Authorize" button
    - Authorization: Bearer <token> header
    - Standard OAuth2 authentication
    """
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            logger.warning("Token verification failed: No username in payload")
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.ExpiredSignatureError:
        logger.info("Token verification failed: Token expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        logger.warning(f"Token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")


# Optional token verification (returns None if no token)
def verify_token_optional(token: str = Depends(oauth2_scheme)) -> Optional[str]:
    """Optional token verification - returns username or None.
    
    Use this for endpoints that work with or without authentication.
    """
    if not token:
        return None
    
    try:
        return verify_token(token)
    except HTTPException:
        return None






