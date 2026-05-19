from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging
import secrets
from datetime import datetime, timedelta

from models.models import Principal, College, Teacher, TeacherStudent, User, AuditLog, Video, ContestAttempt
from models.schemas import (
    PrincipalCreate, PrincipalLogin, PrincipalOut, PrincipalWithCollege,
    CollegeOut, CollegeAnalytics, StudentPerformance, TeacherContentStats, CollegeContestStats,
)
from helper import get_db
from auth import create_access_token, hash_password, verify_password, require_role

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/principal", tags=["principal"])

principal_required = require_role("principal")


def _generate_invite_code() -> str:
    """Generate a unique 8-character uppercase alphanumeric invite code."""
    return secrets.token_hex(4).upper()


def _write_audit(db: Session, actor_role: str, actor_id: int, action: str,
                 target_type: str = None, target_id: int = None, detail: str = None):
    entry = AuditLog(
        actor_role=actor_role,
        actor_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        detail=detail,
        created_at=datetime.utcnow().isoformat(),
    )
    db.add(entry)
    db.commit()


# ============ AUTH ============

@router.post("/register")
def register_principal(data: PrincipalCreate, db: Session = Depends(get_db)):
    """Register a new principal and their college. Returns JWT with role=principal."""
    # Check college name uniqueness
    if db.query(College).filter(College.name == data.college.name).first():
        raise HTTPException(status_code=400, detail="College name already registered")

    # Check principal username uniqueness
    if db.query(Principal).filter(Principal.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    # Generate unique invite code
    invite_code = _generate_invite_code()
    while db.query(College).filter(College.invite_code == invite_code).first():
        invite_code = _generate_invite_code()

    now = datetime.utcnow().isoformat()

    # Create college
    college = College(
        name=data.college.name,
        address=data.college.address,
        phone=data.college.phone,
        email=data.college.email,
        invite_code=invite_code,
        is_active=True,
        created_at=now,
    )
    db.add(college)
    db.flush()  # get college.id before committing

    # Create principal
    principal = Principal(
        username=data.username,
        password=hash_password(data.password),
        name=data.name,
        email=data.email,
        phone=data.phone,
        is_active=True,
        college_id=college.id,
        created_at=now,
    )
    db.add(principal)
    db.commit()
    db.refresh(principal)
    db.refresh(college)

    token = create_access_token(
        data={"sub": principal.username},
        expires_delta=timedelta(hours=24),
        role="principal",
    )
    logger.info(f"Principal registered: {principal.username}, college: {college.name}")
    return {
        "access_token": token,
        "token_type": "bearer",
        "principal_id": principal.id,
        "college_id": college.id,
        "invite_code": college.invite_code,
    }


@router.post("/login")
def login_principal(data: PrincipalLogin, db: Session = Depends(get_db)):
    """Login principal and return JWT with role=principal."""
    principal = db.query(Principal).filter(Principal.username == data.username).first()
    if not principal:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not principal.is_active:
        raise HTTPException(status_code=403, detail="Account suspended. Contact the platform admin.")

    if not verify_password(data.password, principal.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        data={"sub": principal.username},
        expires_delta=timedelta(hours=24),
        role="principal",
    )
    logger.info(f"Principal logged in: {principal.username}")
    return {
        "access_token": token,
        "token_type": "bearer",
        "principal_id": principal.id,
        "college_id": principal.college_id,
    }


# ============ PROFILE ============

@router.get("/me", response_model=PrincipalWithCollege)
def get_me(payload: dict = Depends(principal_required), db: Session = Depends(get_db)):
    """Get current principal's profile with college info."""
    principal = db.query(Principal).filter(Principal.username == payload["sub"]).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found")
    return principal


# ============ INVITE CODE ============

@router.get("/invite-code")
def get_invite_code(payload: dict = Depends(principal_required), db: Session = Depends(get_db)):
    """Return the current invite code for the principal's college."""
    principal = db.query(Principal).filter(Principal.username == payload["sub"]).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found")
    college = db.query(College).filter(College.id == principal.college_id).first()
    return {"invite_code": college.invite_code, "college_name": college.name}


@router.post("/invite-code/refresh")
def refresh_invite_code(payload: dict = Depends(principal_required), db: Session = Depends(get_db)):
    """Generate a new invite code, invalidating the old one."""
    principal = db.query(Principal).filter(Principal.username == payload["sub"]).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found")

    college = db.query(College).filter(College.id == principal.college_id).first()
    old_code = college.invite_code

    new_code = _generate_invite_code()
    while db.query(College).filter(College.invite_code == new_code).first():
        new_code = _generate_invite_code()

    college.invite_code = new_code
    db.commit()

    _write_audit(db, "principal", principal.id, "refresh_invite_code",
                 "college", college.id, f"old={old_code} new={new_code}")

    logger.info(f"Invite code refreshed for college {college.name}")
    return {"invite_code": new_code, "college_name": college.name}


# ============ TEACHER MANAGEMENT ============

@router.get("/teachers")
def list_teachers(payload: dict = Depends(principal_required), db: Session = Depends(get_db)):
    """List all teachers in the principal's college with stats."""
    principal = db.query(Principal).filter(Principal.username == payload["sub"]).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found")

    teachers = db.query(Teacher).filter(Teacher.college_id == principal.college_id).all()
    result = []
    for t in teachers:
        video_count = db.query(func.count(Video.id)).filter(Video.teacher_id == t.id).scalar() or 0
        student_count = db.query(func.count(TeacherStudent.id)).filter(TeacherStudent.teacher_id == t.id).scalar() or 0
        result.append({
            "id": t.id,
            "username": t.username,
            "name": t.name,
            "email": t.email,
            "is_active": t.is_active,
            "joined_at": t.joined_at,
            "video_count": video_count,
            "student_count": student_count,
        })
    return result


@router.get("/teachers/{teacher_id}")
def get_teacher_detail(teacher_id: int, payload: dict = Depends(principal_required), db: Session = Depends(get_db)):
    """Get a teacher's full profile with videos and enrolled students."""
    principal = db.query(Principal).filter(Principal.username == payload["sub"]).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found")

    teacher = db.query(Teacher).filter(
        Teacher.id == teacher_id,
        Teacher.college_id == principal.college_id
    ).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found in your college")

    videos = [{"id": v.id, "title": v.title, "upload_date": v.upload_date, "view_count": v.view_count}
              for v in teacher.videos]
    students = []
    for ts in teacher.teacher_students:
        s = ts.student
        students.append({"username": s.username, "name": s.name, "class_level": s.class_level,
                          "enrolled_date": ts.enrolled_date})

    return {
        "id": teacher.id,
        "username": teacher.username,
        "name": teacher.name,
        "email": teacher.email,
        "bio": teacher.bio,
        "is_active": teacher.is_active,
        "joined_at": teacher.joined_at,
        "videos": videos,
        "students": students,
    }


@router.put("/teachers/{teacher_id}/deactivate")
def deactivate_teacher(teacher_id: int, payload: dict = Depends(principal_required), db: Session = Depends(get_db)):
    """Deactivate a teacher account (prevents login)."""
    principal = db.query(Principal).filter(Principal.username == payload["sub"]).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found")

    teacher = db.query(Teacher).filter(
        Teacher.id == teacher_id,
        Teacher.college_id == principal.college_id
    ).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found in your college")

    teacher.is_active = False
    db.commit()
    _write_audit(db, "principal", principal.id, "deactivate_teacher", "teacher", teacher_id)
    return {"message": f"Teacher {teacher.username} deactivated"}


@router.put("/teachers/{teacher_id}/reactivate")
def reactivate_teacher(teacher_id: int, payload: dict = Depends(principal_required), db: Session = Depends(get_db)):
    """Reactivate a teacher account."""
    principal = db.query(Principal).filter(Principal.username == payload["sub"]).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found")

    teacher = db.query(Teacher).filter(
        Teacher.id == teacher_id,
        Teacher.college_id == principal.college_id
    ).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found in your college")

    teacher.is_active = True
    db.commit()
    _write_audit(db, "principal", principal.id, "reactivate_teacher", "teacher", teacher_id)
    return {"message": f"Teacher {teacher.username} reactivated"}


# ============ STUDENT MANAGEMENT ============

@router.get("/students")
def list_students(payload: dict = Depends(principal_required), db: Session = Depends(get_db)):
    """List all students enrolled under teachers in the principal's college."""
    principal = db.query(Principal).filter(Principal.username == payload["sub"]).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found")

    # Get all teacher IDs in this college
    teacher_ids = [t.id for t in db.query(Teacher.id).filter(Teacher.college_id == principal.college_id).all()]

    if not teacher_ids:
        return []

    # Get unique students via TeacherStudent
    enrollments = db.query(TeacherStudent).filter(TeacherStudent.teacher_id.in_(teacher_ids)).all()
    seen = set()
    result = []
    for ts in enrollments:
        if ts.student_username not in seen:
            seen.add(ts.student_username)
            s = ts.student
            result.append({
                "username": s.username,
                "name": s.name,
                "class_level": s.class_level,
                "score": s.score,
                "total_attempts": s.total_attempts,
                "correct_attempts": s.correct_attempts,
                "current_streak": s.current_streak,
                "is_active": s.is_active,
            })
    return result


# ============ ANALYTICS ============

@router.get("/analytics", response_model=CollegeAnalytics)
def college_analytics(payload: dict = Depends(principal_required), db: Session = Depends(get_db)):
    """Return summary analytics for the principal's college."""
    principal = db.query(Principal).filter(Principal.username == payload["sub"]).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found")

    teacher_ids = [t.id for t in db.query(Teacher.id).filter(Teacher.college_id == principal.college_id).all()]
    teacher_count = len(teacher_ids)

    student_usernames = set()
    if teacher_ids:
        for ts in db.query(TeacherStudent).filter(TeacherStudent.teacher_id.in_(teacher_ids)).all():
            student_usernames.add(ts.student_username)

    student_count = len(student_usernames)
    total_uploads = db.query(func.count(Video.id)).filter(Video.teacher_id.in_(teacher_ids)).scalar() or 0 if teacher_ids else 0

    avg_score = 0.0
    if student_usernames:
        avg_score = db.query(func.avg(User.score)).filter(User.username.in_(student_usernames)).scalar() or 0.0

    return CollegeAnalytics(
        teacher_count=teacher_count,
        student_count=student_count,
        total_uploads=int(total_uploads),
        avg_student_score=float(avg_score),
    )


@router.get("/analytics/students")
def analytics_students(payload: dict = Depends(principal_required), db: Session = Depends(get_db)):
    """Per-student performance data for the college."""
    principal = db.query(Principal).filter(Principal.username == payload["sub"]).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found")

    teacher_ids = [t.id for t in db.query(Teacher.id).filter(Teacher.college_id == principal.college_id).all()]
    student_usernames = set()
    if teacher_ids:
        for ts in db.query(TeacherStudent).filter(TeacherStudent.teacher_id.in_(teacher_ids)).all():
            student_usernames.add(ts.student_username)

    students = db.query(User).filter(User.username.in_(student_usernames)).all() if student_usernames else []
    return [
        StudentPerformance(
            username=s.username,
            name=s.name,
            class_level=s.class_level,
            score=float(s.score or 0),
            accuracy=float(s.correct_attempts / s.total_attempts) if s.total_attempts else 0.0,
            total_attempts=int(s.total_attempts or 0),
            correct_attempts=int(s.correct_attempts or 0),
            current_streak=int(s.current_streak or 0),
            max_streak=int(s.max_streak or 0),
        )
        for s in students
    ]


@router.get("/analytics/content")
def analytics_content(payload: dict = Depends(principal_required), db: Session = Depends(get_db)):
    """Content upload and view stats per teacher in the college."""
    principal = db.query(Principal).filter(Principal.username == payload["sub"]).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found")

    teachers = db.query(Teacher).filter(Teacher.college_id == principal.college_id).all()
    result = []
    for t in teachers:
        videos = db.query(Video).filter(Video.teacher_id == t.id).all()
        total_views = sum(v.view_count for v in videos)
        most_watched = max(videos, key=lambda v: v.view_count, default=None)
        result.append(TeacherContentStats(
            teacher_id=t.id,
            teacher_name=t.name,
            video_count=len(videos),
            total_views=total_views,
            most_watched_title=most_watched.title if most_watched else None,
        ))
    return result


@router.get("/analytics/contests")
def analytics_contests(payload: dict = Depends(principal_required), db: Session = Depends(get_db)):
    """Contest participation stats for the college's students."""
    principal = db.query(Principal).filter(Principal.username == payload["sub"]).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found")

    teacher_ids = [t.id for t in db.query(Teacher.id).filter(Teacher.college_id == principal.college_id).all()]
    student_usernames = set()
    if teacher_ids:
        for ts in db.query(TeacherStudent).filter(TeacherStudent.teacher_id.in_(teacher_ids)).all():
            student_usernames.add(ts.student_username)

    if not student_usernames:
        return CollegeContestStats(total_participants=0, total_attempts=0, avg_score=0.0, top_score=0.0)

    attempts = db.query(ContestAttempt).filter(ContestAttempt.username.in_(student_usernames)).all()
    participants = len({a.username for a in attempts})
    avg_score = sum(a.score for a in attempts) / len(attempts) if attempts else 0.0
    top_score = max((a.score for a in attempts), default=0.0)

    return CollegeContestStats(
        total_participants=participants,
        total_attempts=len(attempts),
        avg_score=float(avg_score),
        top_score=float(top_score),
    )
