# auth.py
import jwt
import os
import logging
import bcrypt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import Optional

# Configure logging
logger = logging.getLogger(__name__)

# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production-use-env-variable-instead")
if SECRET_KEY == "your-secret-key-change-this-in-production-use-env-variable-instead":
    logger.warning("Using default SECRET_KEY! Set SECRET_KEY environment variable for production.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# OAuth2 Password Bearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/token")


# ── Password hashing (direct bcrypt, no passlib) ──────────────────────────────

def hash_password(password: str) -> str:
    """Hash a password using bcrypt. Truncates to 72 bytes (bcrypt limit)."""
    password_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    try:
        password_bytes = plain_password.encode("utf-8")[:72]
        return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))
    except Exception:
        return False

# Create JWT
def create_access_token(data: dict, expires_delta: timedelta | None = None, role: str | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    if role:
        to_encode["role"] = role
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
    """Optional token verification - returns username or None."""
    if not token:
        return None
    try:
        return verify_token(token)
    except HTTPException:
        return None


def decode_token_payload(token: str) -> dict:
    """Decode token and return full payload dict. Raises 401 on failure."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("sub"):
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_role(role: str):
    """Dependency factory — validates JWT and asserts the role claim.

    Usage:
        principal_required = require_role("principal")

        @router.get("/me")
        def me(payload: dict = Depends(principal_required)):
            username = payload["sub"]
    """
    def dependency(token: str = Depends(oauth2_scheme)) -> dict:
        payload = decode_token_payload(token)
        if payload.get("role") != role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return payload
    return dependency






