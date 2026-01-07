# deps.py
import logging
from database import SessionLocal
from sqlalchemy.orm import Session
from fastapi import Request, Depends
import jwt
from typing import Optional
import re

from models.models import User
from auth import SECRET_KEY, ALGORITHM

# Configure logging
logger = logging.getLogger(__name__)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user_class(request: Request, db: Session = Depends(get_db)) -> dict:
    """
    Resolve the user's class for any incoming request.

    Behavior:
    - If the request has a Bearer token, try to decode it and look up the user.
    - If a valid user is found, return their `level` and `class_level` and a resolved class key.
    - If no token / invalid token / user not found, return a sensible guest default (class_5).

    Returns a dict with keys:
      - user: User | None (SQLAlchemy user object if found)
      - level: int | None
      - class_level: str | None (raw class_level field from DB)
      - resolved_class_key: str (like 'class_5') — useful for loading syllabus/topics
      - is_guest: bool
    """
    auth_header: Optional[str] = request.headers.get("authorization")

    # Default guest values
    guest = {"user": None, "level": 5, "class_level": None, "resolved_class_key": "class_5", "is_guest": True}

    if not auth_header:
        return guest

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return guest

    token = parts[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if not username:
            return guest
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return guest

        raw_class = getattr(user, "class_level", None)
        level = getattr(user, "level", None) or 5
        # normalized class key: prefer explicit class_level if it looks like 'class_X', else use level
        if raw_class and isinstance(raw_class, str) and raw_class.strip():
            cl = raw_class.strip()
            if cl.startswith("class_"):
                resolved = cl
            else:
                # allow values like '5' or 'Grade 5'
                digits = "".join(c for c in cl if c.isdigit())
                resolved = f"class_{digits or level}"
        else:
            resolved = f"class_{level}"

        return {"user": user, "level": level, "class_level": raw_class, "resolved_class_key": resolved, "is_guest": False}

    except jwt.ExpiredSignatureError:
        return guest
    except jwt.InvalidTokenError:
        return guest


def get_user_class_number(request: Request, db: Session = Depends(get_db)) -> int:
    """
    FastAPI dependency that returns only the numeric class number for the request user.

    Returns an int (e.g. 1..12). Defaults to 5 for guests or on error.
    """
    info = get_user_class(request, db)
    # info should be a dict as returned by get_user_class
    if not isinstance(info, dict):
        return 5

    # Prefer resolved_class_key like 'class_5'
    resolved = info.get("resolved_class_key")
    if isinstance(resolved, str):
        m = re.search(r"(\d+)", resolved)
        if m:
            try:
                return int(m.group(1))
            except Exception:
                pass

    # Fallback to level
    level = info.get("level")
    try:
        return int(level)
    except Exception:
        return 5


def get_user_class_number_by_username(username: str, db: Session) -> int:
    """Return the numeric class for the given username by looking up the User in the DB.

    - If the user has `class_level` like 'class_5' or '5', the numeric portion is returned.
    - Else falls back to the `level` integer column.
    - Defaults to 5 when missing or on error.
    """
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return 5

        # Prefer class_level if present
        raw = getattr(user, "class_level", None)
        if raw and isinstance(raw, str):
            # extract digits from strings like 'class_5' or 'Grade 5' or '5'
            digits = "".join(c for c in raw if c.isdigit())
            if digits:
                try:
                    return int(digits)
                except Exception:
                    pass

        # Fall back to level column
        lvl = getattr(user, "level", None)
        if lvl is not None:
            try:
                return int(lvl)
            except Exception:
                pass

        return 5
    except Exception as e:
        logger.error(f"Error resolving class number for user {username}: {e}")
        return 5


def normalize_class_to_number(class_input) -> int:
    """Normalize various class input formats to integer.
    
    Handles: int (5), string ('5'), class_level ('class_5'), etc.
    Returns: int (defaults to 5 on error)
    """
    if class_input is None:
        return 5
    try:
        if isinstance(class_input, int):
            return int(class_input)
        s = str(class_input).strip()
        if s.startswith("class_"):
            s = s.split("_", 1)[1]
        # Extract digits
        digits = "".join(c for c in s if c.isdigit())
        return int(digits) if digits else 5
    except Exception:
        return 5
