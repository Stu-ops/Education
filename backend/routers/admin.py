from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging
import os
from datetime import datetime, timedelta
from pathlib import Path

from models.models import (
    Admin, College, Principal, Teacher, User, Video,
    ContestAttempt, AuditLog, SystemConfig, TeacherStudent
)
from models.schemas import (
    AdminLogin, AdminOut, PlatformStats, CollegeWithStats,
    VideoAdminOut, AuditLogOut, SystemConfigOut, SystemConfigUpdate,
)
from helper import get_db
from auth import create_access_token, hash_password, verify_password, require_role

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])

admin_required = require_role("admin")

VIDEOS_DIR = Path(__file__).resolve().parent.parent / "uploads" / "videos"


def _write_audit(db: Session, actor_id: int, action: str,
                 target_type: str = None, target_id: int = None, detail: str = None):
    entry = AuditLog(
        actor_role="admin",
        actor_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        detail=detail,
        created_at=datetime.utcnow().isoformat(),
    )
    db.add(entry)
    db.commit()


def _get_admin(payload: dict, db: Session) -> Admin:
    admin = db.query(Admin).filter(Admin.username == payload["sub"]).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin


# ============ AUTH ============

@router.post("/login")
def admin_login(data: AdminLogin, db: Session = Depends(get_db)):
    """Login with admin credentials. Returns JWT with role=admin."""
    admin = db.query(Admin).filter(Admin.username == data.username).first()
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, admin.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        data={"sub": admin.username},
        expires_delta=timedelta(hours=12),
        role="admin",
    )
    logger.info(f"Admin logged in: {admin.username}")
    _write_audit(db, admin.id, "admin_login")
    return {"access_token": token, "token_type": "bearer", "admin_id": admin.id}


# ============ PLATFORM STATS ============

@router.get("/stats", response_model=PlatformStats)
def platform_stats(payload: dict = Depends(admin_required), db: Session = Depends(get_db)):
    """Return platform-wide counts."""
    return PlatformStats(
        total_colleges=db.query(func.count(College.id)).scalar() or 0,
        total_principals=db.query(func.count(Principal.id)).scalar() or 0,
        total_teachers=db.query(func.count(Teacher.id)).scalar() or 0,
        total_students=db.query(func.count(User.id)).scalar() or 0,
        total_videos=db.query(func.count(Video.id)).scalar() or 0,
        total_contest_attempts=db.query(func.count(ContestAttempt.id)).scalar() or 0,
    )


@router.get("/colleges")
def list_colleges(payload: dict = Depends(admin_required), db: Session = Depends(get_db)):
    """List all colleges with principal info, teacher count, and student count."""
    colleges = db.query(College).all()
    result = []
    for c in colleges:
        principal = db.query(Principal).filter(Principal.college_id == c.id).first()
        teacher_count = db.query(func.count(Teacher.id)).filter(Teacher.college_id == c.id).scalar() or 0

        # Count unique students enrolled under teachers in this college
        teacher_ids = [t.id for t in db.query(Teacher.id).filter(Teacher.college_id == c.id).all()]
        student_count = 0
        if teacher_ids:
            student_count = db.query(func.count(func.distinct(TeacherStudent.student_username))).filter(
                TeacherStudent.teacher_id.in_(teacher_ids)
            ).scalar() or 0

        result.append(CollegeWithStats(
            id=c.id,
            name=c.name,
            is_active=c.is_active,
            invite_code=c.invite_code,
            created_at=c.created_at,
            principal_username=principal.username if principal else None,
            principal_name=principal.name if principal else None,
            teacher_count=int(teacher_count),
            student_count=int(student_count),
        ))
    return result


@router.get("/users")
def list_users(
    college_id: int = Query(None),
    class_level: str = Query(None),
    min_score: float = Query(None),
    max_score: float = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    payload: dict = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """Paginated student list with optional filters."""
    q = db.query(User)

    if college_id is not None:
        # Filter students enrolled under teachers in this college
        teacher_ids = [t.id for t in db.query(Teacher.id).filter(Teacher.college_id == college_id).all()]
        if teacher_ids:
            student_usernames = [
                ts.student_username for ts in
                db.query(TeacherStudent.student_username).filter(TeacherStudent.teacher_id.in_(teacher_ids)).all()
            ]
            q = q.filter(User.username.in_(student_usernames))
        else:
            return {"total": 0, "page": page, "page_size": page_size, "users": []}

    if class_level:
        q = q.filter(User.class_level == class_level)
    if min_score is not None:
        q = q.filter(User.score >= min_score)
    if max_score is not None:
        q = q.filter(User.score <= max_score)

    total = q.count()
    users = q.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "name": u.name,
                "class_level": u.class_level,
                "score": u.score,
                "total_attempts": u.total_attempts,
                "is_active": u.is_active,
            }
            for u in users
        ],
    }


@router.get("/teachers")
def list_teachers(
    college_id: int = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    payload: dict = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """Paginated teacher list with optional college filter."""
    q = db.query(Teacher)
    if college_id is not None:
        q = q.filter(Teacher.college_id == college_id)

    total = q.count()
    teachers = q.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "teachers": [
            {
                "id": t.id,
                "username": t.username,
                "name": t.name,
                "email": t.email,
                "college_id": t.college_id,
                "is_active": t.is_active,
                "joined_at": t.joined_at,
                "video_count": db.query(func.count(Video.id)).filter(Video.teacher_id == t.id).scalar() or 0,
            }
            for t in teachers
        ],
    }


# ============ ACCOUNT MANAGEMENT ============

@router.put("/accounts/principal/{principal_id}/suspend")
def suspend_principal(principal_id: int, payload: dict = Depends(admin_required), db: Session = Depends(get_db)):
    """Suspend a principal (and implicitly all teachers in their college)."""
    admin = _get_admin(payload, db)
    principal = db.query(Principal).filter(Principal.id == principal_id).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found")

    principal.is_active = False
    # Also suspend the college so teachers can't log in
    college = db.query(College).filter(College.id == principal.college_id).first()
    if college:
        college.is_active = False
        # Suspend all teachers in the college
        db.query(Teacher).filter(Teacher.college_id == college.id).update({"is_active": False})
    db.commit()
    _write_audit(db, admin.id, "suspend_principal", "principal", principal_id)
    return {"message": f"Principal {principal.username} and their college suspended"}


@router.put("/accounts/principal/{principal_id}/reactivate")
def reactivate_principal(principal_id: int, payload: dict = Depends(admin_required), db: Session = Depends(get_db)):
    """Reactivate a principal and their college."""
    admin = _get_admin(payload, db)
    principal = db.query(Principal).filter(Principal.id == principal_id).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found")

    principal.is_active = True
    college = db.query(College).filter(College.id == principal.college_id).first()
    if college:
        college.is_active = True
        db.query(Teacher).filter(Teacher.college_id == college.id).update({"is_active": True})
    db.commit()
    _write_audit(db, admin.id, "reactivate_principal", "principal", principal_id)
    return {"message": f"Principal {principal.username} and their college reactivated"}


@router.put("/accounts/teacher/{teacher_id}/suspend")
def suspend_teacher(teacher_id: int, payload: dict = Depends(admin_required), db: Session = Depends(get_db)):
    admin = _get_admin(payload, db)
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    teacher.is_active = False
    db.commit()
    _write_audit(db, admin.id, "suspend_teacher", "teacher", teacher_id)
    return {"message": f"Teacher {teacher.username} suspended"}


@router.put("/accounts/teacher/{teacher_id}/reactivate")
def reactivate_teacher(teacher_id: int, payload: dict = Depends(admin_required), db: Session = Depends(get_db)):
    admin = _get_admin(payload, db)
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    teacher.is_active = True
    db.commit()
    _write_audit(db, admin.id, "reactivate_teacher", "teacher", teacher_id)
    return {"message": f"Teacher {teacher.username} reactivated"}


@router.put("/accounts/student/{student_id}/suspend")
def suspend_student(student_id: int, payload: dict = Depends(admin_required), db: Session = Depends(get_db)):
    admin = _get_admin(payload, db)
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.is_active = False
    db.commit()
    _write_audit(db, admin.id, "suspend_student", "student", student_id)
    return {"message": f"Student {student.username} suspended"}


@router.put("/accounts/student/{student_id}/reactivate")
def reactivate_student(student_id: int, payload: dict = Depends(admin_required), db: Session = Depends(get_db)):
    admin = _get_admin(payload, db)
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.is_active = True
    db.commit()
    _write_audit(db, admin.id, "reactivate_student", "student", student_id)
    return {"message": f"Student {student.username} reactivated"}


@router.delete("/colleges/{college_id}")
def delete_college(college_id: int, payload: dict = Depends(admin_required), db: Session = Depends(get_db)):
    """Soft-delete a college — deactivates college, principal, and all teachers."""
    admin = _get_admin(payload, db)
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    college.is_active = False
    db.query(Principal).filter(Principal.college_id == college_id).update({"is_active": False})
    db.query(Teacher).filter(Teacher.college_id == college_id).update({"is_active": False})
    db.commit()
    _write_audit(db, admin.id, "delete_college", "college", college_id, f"name={college.name}")
    return {"message": f"College '{college.name}' and all associated accounts deactivated"}


# ============ CONTENT MODERATION ============

@router.get("/videos")
def list_videos(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    flagged_only: bool = Query(False),
    payload: dict = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """Paginated video list with teacher and college info."""
    q = db.query(Video)
    if flagged_only:
        q = q.filter(Video.is_flagged == True)

    total = q.count()
    videos = q.offset((page - 1) * page_size).limit(page_size).all()

    result = []
    for v in videos:
        teacher = v.teacher
        college_name = None
        if teacher and teacher.college_id:
            college = db.query(College).filter(College.id == teacher.college_id).first()
            college_name = college.name if college else None
        result.append(VideoAdminOut(
            id=v.id,
            title=v.title,
            class_level=v.class_level,
            subject=v.subject,
            upload_date=v.upload_date,
            view_count=v.view_count,
            file_size=v.file_size,
            is_flagged=v.is_flagged,
            teacher_id=v.teacher_id,
            teacher_name=teacher.name if teacher else None,
            college_name=college_name,
        ))

    return {"total": total, "page": page, "page_size": page_size, "videos": result}


@router.delete("/videos/{video_id}")
def delete_video(video_id: int, payload: dict = Depends(admin_required), db: Session = Depends(get_db)):
    """Delete a video — removes file from disk and DB record."""
    admin = _get_admin(payload, db)
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Delete file from disk
    try:
        disk_path = VIDEOS_DIR / Path(video.file_path).name
        if disk_path.exists():
            disk_path.unlink()
    except Exception as e:
        logger.warning(f"Could not delete video file from disk: {e}")

    db.delete(video)
    db.commit()
    _write_audit(db, admin.id, "delete_video", "video", video_id, f"title={video.title}")
    return {"message": "Video deleted successfully"}


@router.put("/videos/{video_id}/flag")
def flag_video(video_id: int, payload: dict = Depends(admin_required), db: Session = Depends(get_db)):
    """Toggle the flagged status of a video."""
    admin = _get_admin(payload, db)
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    video.is_flagged = not video.is_flagged
    db.commit()
    action = "flag_video" if video.is_flagged else "unflag_video"
    _write_audit(db, admin.id, action, "video", video_id)
    return {"message": f"Video {'flagged' if video.is_flagged else 'unflagged'}", "is_flagged": video.is_flagged}


# ============ SYSTEM CONFIGURATION ============

@router.get("/announcement")
def get_announcement(db: Session = Depends(get_db)):
    """Get the current platform announcement (public endpoint)."""
    config = db.query(SystemConfig).filter(SystemConfig.key == "platform_announcement").first()
    if not config:
        return {"announcement": None}
    return {"announcement": config.value}


@router.put("/announcement")
def set_announcement(data: SystemConfigUpdate, payload: dict = Depends(admin_required), db: Session = Depends(get_db)):
    """Set the platform-wide announcement."""
    admin = _get_admin(payload, db)
    now = datetime.utcnow().isoformat()
    config = db.query(SystemConfig).filter(SystemConfig.key == "platform_announcement").first()
    if config:
        config.value = data.value
        config.updated_at = now
    else:
        config = SystemConfig(key="platform_announcement", value=data.value, updated_at=now)
        db.add(config)
    db.commit()
    _write_audit(db, admin.id, "set_announcement", detail=f"value={data.value}")
    return {"message": "Announcement updated", "announcement": data.value}


@router.get("/config/{key}", response_model=SystemConfigOut)
def get_config(key: str, payload: dict = Depends(admin_required), db: Session = Depends(get_db)):
    """Get a system config value by key."""
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if not config:
        raise HTTPException(status_code=404, detail=f"Config key '{key}' not found")
    return config


@router.put("/config/{key}", response_model=SystemConfigOut)
def set_config(key: str, data: SystemConfigUpdate, payload: dict = Depends(admin_required), db: Session = Depends(get_db)):
    """Set a system config / feature flag value."""
    admin = _get_admin(payload, db)
    now = datetime.utcnow().isoformat()
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if config:
        config.value = data.value
        config.updated_at = now
    else:
        config = SystemConfig(key=key, value=data.value, updated_at=now)
        db.add(config)
    db.commit()
    _write_audit(db, admin.id, "set_config", detail=f"key={key} value={data.value}")
    return config


@router.get("/audit-log")
def get_audit_log(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    payload: dict = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """Paginated audit log entries."""
    total = db.query(func.count(AuditLog.id)).scalar() or 0
    entries = (
        db.query(AuditLog)
        .order_by(AuditLog.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "entries": [
            AuditLogOut(
                id=e.id,
                actor_role=e.actor_role,
                actor_id=e.actor_id,
                action=e.action,
                target_type=e.target_type,
                target_id=e.target_id,
                detail=e.detail,
                created_at=e.created_at,
            )
            for e in entries
        ],
    }
