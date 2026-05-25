from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from database import Base

# ---------- College ----------
class College(Base):
    __tablename__ = "colleges"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, unique=True, nullable=False)
    address     = Column(String, nullable=True)
    phone       = Column(String, nullable=True)
    email       = Column(String, nullable=True)
    invite_code = Column(String(8), unique=True, nullable=False, index=True)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(String, nullable=False)  # ISO datetime

    principal   = relationship("Principal", back_populates="college", uselist=False)
    teachers    = relationship("Teacher", back_populates="college")


# ---------- Principal ----------
class Principal(Base):
    __tablename__ = "principals"

    id         = Column(Integer, primary_key=True, index=True)
    username   = Column(String, unique=True, nullable=False, index=True)
    password   = Column(String, nullable=False)
    name       = Column(String, nullable=True)
    email      = Column(String, nullable=True)
    phone      = Column(String, nullable=True)
    is_active  = Column(Boolean, default=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    created_at = Column(String, nullable=False)

    college    = relationship("College", back_populates="principal")


# ---------- Admin ----------
class Admin(Base):
    __tablename__ = "admins"

    id         = Column(Integer, primary_key=True, index=True)
    username   = Column(String, unique=True, nullable=False, index=True)
    password   = Column(String, nullable=False)  # bcrypt hashed
    name       = Column(String, nullable=True)
    email      = Column(String, nullable=True)
    created_at = Column(String, nullable=False)


# ---------- Audit Log ----------
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id          = Column(Integer, primary_key=True, index=True)
    actor_role  = Column(String, nullable=False)   # "admin" | "principal"
    actor_id    = Column(Integer, nullable=False)
    action      = Column(String, nullable=False)   # e.g. "suspend_teacher"
    target_type = Column(String, nullable=True)    # e.g. "teacher"
    target_id   = Column(Integer, nullable=True)
    detail      = Column(Text, nullable=True)      # JSON or free text
    created_at  = Column(String, nullable=False)


# ---------- System Config ----------
class SystemConfig(Base):
    __tablename__ = "system_config"

    key        = Column(String, primary_key=True)
    value      = Column(Text, nullable=True)
    updated_at = Column(String, nullable=False)


# ---------- User ----------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    name = Column(String, nullable=True)
    level = Column(Integer, default=1)
    email = Column(String, nullable=True)
    avatar = Column(Text, nullable=True)
    class_level = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    school = Column(String, nullable=True)
    total_attempts = Column(Integer, default=0)
    correct_attempts = Column(Integer, default=0)
    score = Column(Float, default=0.0)
    total_time_taken = Column(Float, default=0.0)
    current_streak = Column(Integer, default=0)
    max_streak = Column(Integer, default=0)
    Parent_feedback = Column(Text, nullable=True)
    # Suspension support
    is_active = Column(Boolean, default=True)


# ---------- Chat ----------
class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    session_id = Column(String, index=True, nullable=True, unique=True)
    subject = Column(String, nullable=True)

    messages = relationship("Message", back_populates="chat", cascade="all, delete")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=True)
    image = Column(Text, nullable=True)
    sender = Column(String, nullable=False)

    chat_id = Column(Integer, ForeignKey("chats.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    chat = relationship("Chat", back_populates="messages")


# ---------- Parent ----------
class Parent(Base):
    __tablename__ = "parents"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    email = Column(String, nullable=True)

    student_username = Column(String, ForeignKey("users.username"), nullable=False)
    student = relationship("User", foreign_keys=[student_username])


# ---------- Teacher ----------
class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    avatar = Column(Text, nullable=True)

    # College linkage (set when teacher registers with invite code)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=True)
    is_active  = Column(Boolean, default=True)
    joined_at  = Column(String, nullable=True)  # ISO date when linked to college

    college         = relationship("College", back_populates="teachers")
    videos          = relationship("Video", back_populates="teacher", cascade="all, delete")
    teacher_students = relationship("TeacherStudent", back_populates="teacher", cascade="all, delete")


# ---------- Teacher-Student Relationship ----------
class TeacherStudent(Base):
    __tablename__ = "teacher_students"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    student_username = Column(String, ForeignKey("users.username"), nullable=False)

    enrolled_date = Column(String, nullable=False)
    class_level   = Column(String, nullable=False)

    teacher = relationship("Teacher", back_populates="teacher_students")
    student = relationship("User", foreign_keys=[student_username])


# ---------- Video ----------
class Video(Base):
    __tablename__ = "videos"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    class_level = Column(String, nullable=False)
    subject     = Column(String, nullable=True)
    duration    = Column(Integer, nullable=True)
    file_path   = Column(String, nullable=False)
    file_size   = Column(Integer, nullable=True)
    thumbnail   = Column(Text, nullable=True)
    is_flagged  = Column(Boolean, default=False)  # admin content moderation

    teacher_id  = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    teacher     = relationship("Teacher", back_populates="videos")

    upload_date = Column(String, nullable=False)
    view_count  = Column(Integer, default=0)

# ---------- Short Video (CDN Backblaze B2) ----------
class ShortVideo(Base):
    __tablename__ = "short_videos"

    id              = Column(Integer, primary_key=True, index=True)
    
    # CORE CONTENT
    title           = Column(String, nullable=False)
    description     = Column(Text, nullable=True)
    class_level     = Column(String, nullable=True, index=True)
    subject         = Column(String, nullable=True, index=True)
    
    # CDN/STORAGE (B2)
    object_key      = Column(String, nullable=False, unique=True, index=True)  # videos/{user_id}/{timestamp}_{filename}
    file_url        = Column(String, nullable=True)  # CDN URL - can be computed, so optional storage
    
    # THUMBNAIL
    thumbnail_key   = Column(String, nullable=True, unique=True)
    thumbnail_url   = Column(String, nullable=True)
    
    # STATUS & CONTROL
    status          = Column(String, default='uploading')  # 'uploading', 'completed', 'failed'
    is_public       = Column(Boolean, default=False)  # True = public CDN, False = presigned
    
    # VIDEO METADATA
    duration        = Column(Float, nullable=True)  # seconds
    file_size       = Column(Integer, nullable=True)  # bytes
    codec_info      = Column(Text, nullable=True)  # {"video": "h264", "audio": "aac"}
    
    # UPLOAD TRACKING
    upload_id       = Column(String, nullable=True, index=True)  # For multipart uploads
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # TIMESTAMPS
    created_at      = Column(String, nullable=False)
    updated_at      = Column(String, nullable=False)
    
    # OPTIONAL: Analytics (can add later if needed)
    # view_count      = Column(Integer, default=0)
    
    user            = relationship("User")


# ---------- Contest ----------
class ContestAttempt(Base):
    __tablename__ = "contest_attempts"

    id             = Column(Integer, primary_key=True, index=True)
    contest_id     = Column(String, index=True, nullable=False)
    username       = Column(String, ForeignKey("users.username"), index=True, nullable=False)
    class_level    = Column(String, index=True, nullable=False)

    score          = Column(Float, default=0.0)
    correct_count  = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    time_taken     = Column(Float, nullable=True)
    answers_json   = Column(Text, nullable=False)
    submitted_at   = Column(String, nullable=False)

    student = relationship("User", foreign_keys=[username])
