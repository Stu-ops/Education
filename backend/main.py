import sys
import logging
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from database import Base, engine
from sqlalchemy import text
import os
import re
from typing import Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('backend.log')
    ]
)
logger = logging.getLogger(__name__)

# Ensure the backend directory is on sys.path so imports like `from routers import ...`
# work whether uvicorn is started from the repo root (uvicorn backend.main:app)
# or from inside the backend folder (uvicorn main:app).
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from routers import user, chat, history, explore, syllabus, topics, parent, quotes_router, teacher, config, contest, vector_ingest, principal, admin as admin_router
from fastapi.middleware.cors import CORSMiddleware
# create tables
def ensure_streak_columns():
    """Add `current_streak` and `max_streak` columns to `users` table if missing (SQLite)."""
    try:
        conn = engine.connect()
        try:
            res = conn.execute(text("PRAGMA table_info('users')")).mappings().all()
            cols = [r["name"] for r in res]
            stmts = []
            if "current_streak" not in cols:
                stmts.append("ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0")
            if "max_streak" not in cols:
                stmts.append("ALTER TABLE users ADD COLUMN max_streak INTEGER DEFAULT 0")
            if "Parent_feedback" not in cols:
                stmts.append("ALTER TABLE users ADD COLUMN Parent_feedback TEXT")
            for s in stmts:
                conn.execute(text(s))
            if stmts:
                logger.info(f"DB migration applied: added columns -> {stmts}")
        finally:
            conn.close()
    except Exception as e:
        logger.error(f"DB migration error (non-fatal): {e}")


def ensure_new_columns():
    """Add new columns introduced by the Principal/Admin module to existing tables."""
    try:
        conn = engine.connect()
        try:
            migrations = []

            # users table — is_active
            res = conn.execute(text("PRAGMA table_info('users')")).mappings().all()
            user_cols = [r["name"] for r in res]
            if "is_active" not in user_cols:
                migrations.append("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1")

            # teachers table — college_id, is_active, joined_at
            res = conn.execute(text("PRAGMA table_info('teachers')")).mappings().all()
            teacher_cols = [r["name"] for r in res]
            if "college_id" not in teacher_cols:
                migrations.append("ALTER TABLE teachers ADD COLUMN college_id INTEGER REFERENCES colleges(id)")
            if "is_active" not in teacher_cols:
                migrations.append("ALTER TABLE teachers ADD COLUMN is_active INTEGER DEFAULT 1")
            if "joined_at" not in teacher_cols:
                migrations.append("ALTER TABLE teachers ADD COLUMN joined_at TEXT")

            # videos table — is_flagged
            res = conn.execute(text("PRAGMA table_info('videos')")).mappings().all()
            video_cols = [r["name"] for r in res]
            if "is_flagged" not in video_cols:
                migrations.append("ALTER TABLE videos ADD COLUMN is_flagged INTEGER DEFAULT 0")

            for stmt in migrations:
                conn.execute(text(stmt))
            conn.commit()
            if migrations:
                logger.info(f"DB migration applied (new columns): {migrations}")
        finally:
            conn.close()
    except Exception as e:
        logger.error(f"DB migration error (non-fatal): {e}")


# Ensure schema exists and run lightweight migrations
ensure_streak_columns()
ensure_new_columns()
Base.metadata.create_all(bind=engine)


def seed_default_admin():
    """Create a default admin account from env vars if none exists."""
    from models.models import Admin
    from auth import hash_password as _hash
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    try:
        db = __import__("database").SessionLocal()
        try:
            if not db.query(Admin).first():
                admin = Admin(
                    username=admin_username,
                    password=_hash(admin_password),
                    name="Platform Admin",
                    email=os.getenv("ADMIN_EMAIL", ""),
                    created_at=__import__("datetime").datetime.utcnow().isoformat(),
                )
                db.add(admin)
                db.commit()
                logger.info(f"Default admin seeded: username='{admin_username}'")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Admin seeding error (non-fatal): {e}")


seed_default_admin()

app = FastAPI()

# Get allowed origins from environment variable (comma-separated)
# Default to localhost for development, but warn if using wildcard in production
allowed_origins_str = os.getenv("ALLOWED_ORIGINS","*,http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173")
if allowed_origins_str == "*":
    logger.warning("CORS configured with wildcard (*) - this should only be used in development!")
    allowed_origins = ["*"]
else:
    allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]

logger.info(f"CORS allowed origins: {allowed_origins}")

# Add CORS middleware first
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "Accept-Ranges", "Content-Length"],
)

# Custom video streaming endpoint with range request support
@app.get("/uploads/videos/{filename}")
async def stream_video(filename: str, request: Request):
    """Stream video files with support for range requests (seeking)"""
    video_path = BASE_DIR / "uploads" / "videos" / filename
    
    if not video_path.exists():
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Video not found")
    
    file_size = video_path.stat().st_size
    range_header = request.headers.get("range")
    
    # If no range header, serve the entire file
    if not range_header:
        return StreamingResponse(
            open(video_path, "rb"),
            media_type="video/mp4",
            headers={
                "Accept-Ranges": "bytes",
                "Content-Length": str(file_size),
            }
        )
    
    # Parse range header
    range_match = re.match(r"bytes=(\d+)-(\d*)", range_header)
    if not range_match:
        from fastapi import HTTPException
        raise HTTPException(status_code=416, detail="Invalid range header")
    
    start = int(range_match.group(1))
    end = int(range_match.group(2)) if range_match.group(2) else file_size - 1
    
    # Ensure valid range
    if start >= file_size or end >= file_size or start > end:
        from fastapi import HTTPException
        raise HTTPException(status_code=416, detail="Range not satisfiable")
    
    chunk_size = end - start + 1
    
    def iterfile():
        with open(video_path, "rb") as video_file:
            video_file.seek(start)
            remaining = chunk_size
            while remaining:
                chunk_to_read = min(8192, remaining)
                data = video_file.read(chunk_to_read)
                if not data:
                    break
                remaining -= len(data)
                yield data
    
    return StreamingResponse(
        iterfile(),
        status_code=206,
        media_type="video/mp4",
        headers={
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(chunk_size),
        }
    )

# Serve other uploaded files (documents/thumbnails/images) - but NOT videos (handled above)
uploads_dir = BASE_DIR / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)

# Mount subdirectories individually to avoid conflict with custom video endpoint
for subdir in ["documents", "images", "thumbnails"]:
    subdir_path = uploads_dir / subdir
    subdir_path.mkdir(parents=True, exist_ok=True)
    app.mount(f"/uploads/{subdir}", StaticFiles(directory=str(subdir_path)), name=f"uploads_{subdir}")

# routers
app.include_router(user.router)
app.include_router(chat.router)
app.include_router(history.router)
app.include_router(explore.router)
app.include_router(syllabus.router)
app.include_router(topics.router)
app.include_router(parent.router)
app.include_router(teacher.router)
app.include_router(contest.router)
app.include_router(quotes_router.router)
app.include_router(config.router)
app.include_router(vector_ingest.router)
app.include_router(principal.router)
app.include_router(admin_router.router)
