from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel
from models.models import Video, Teacher
from models.schemas import VideoOut, VideoBase
from helper import get_db
from auth import verify_token
from r2_service import get_r2_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/videos", tags=["videos"])

# Request/Response Models
class PresignedUploadURLRequest(BaseModel):
    title: str
    description: Optional[str] = None
    class_level: str
    subject: str
    is_public: bool = False
    filename: str
    content_type: str

class PresignedUploadURLResponse(BaseModel):
    upload_url: str
    object_key: str
    upload_expires_in_seconds: int
    video_id: int

class CompleteUploadRequest(BaseModel):
    video_id: int
    object_key: str
    file_size: int
    duration: float = 0.0
    codec_info: Optional[str] = None
    thumbnail_key: Optional[str] = None

class PresignedDownloadURLResponse(BaseModel):
    download_url: str
    expires_in_seconds: int

class CDNURLResponse(BaseModel):
    cdn_url: str

# GET /videos - List all videos with filters
@router.get("", response_model=List[VideoOut])
async def list_videos(
    db: Session = Depends(get_db),
    class_level: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """List all public videos with optional filtering"""
    query = db.query(Video).filter(Video.is_public == "true")
    
    if class_level:
        query = query.filter(Video.class_level == class_level)
    if subject:
        query = query.filter(Video.subject == subject)
    
    videos = query.offset(skip).limit(limit).all()
    return videos

# GET /videos/me/my-videos - Get teacher's videos
@router.get("/me/my-videos", response_model=List[VideoOut])
async def get_my_videos(
    token_data = Depends(verify_token),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """Get videos uploaded by the authenticated teacher"""
    teacher_id = token_data.get("teacher_id")
    if not teacher_id:
        raise HTTPException(status_code=401, detail="Not authenticated as teacher")
    
    videos = db.query(Video).filter(
        Video.teacher_id == teacher_id
    ).offset(skip).limit(limit).all()
    
    return videos

# GET /videos/{id} - Get video metadata
@router.get("/{video_id}", response_model=VideoOut)
async def get_video(
    video_id: int,
    db: Session = Depends(get_db)
):
    """Get video metadata by ID"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video

# POST /videos/presigned-upload-url - Generate upload URL
@router.post("/presigned-upload-url", response_model=PresignedUploadURLResponse)
async def generate_presigned_upload_url(
    request: PresignedUploadURLRequest,
    token_data = Depends(verify_token),
    db: Session = Depends(get_db),
    r2_service = Depends(get_r2_service)
):
    """Generate presigned URL for video upload"""
    teacher_id = token_data.get("teacher_id")
    if not teacher_id:
        raise HTTPException(status_code=401, detail="Not authenticated as teacher")
    
    # Verify teacher exists
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    try:
        # Create Video record in database with status=uploading
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        object_key = f"videos/{teacher_id}/{timestamp}_{request.filename}"
        
        video = Video(
            title=request.title,
            description=request.description or "",
            teacher_id=teacher_id,
            class_level=request.class_level,
            subject=request.subject,
            is_public=str(request.is_public).lower(),
            object_key=object_key,
            status="uploading",
            upload_id=None
        )
        db.add(video)
        db.commit()
        db.refresh(video)
        
        # Generate presigned upload URL
        upload_url = r2_service.generate_presigned_upload_url(
            object_key=object_key,
            content_type=request.content_type,
            expires_in=3600  # 1 hour
        )
        
        logger.info(f"Generated presigned upload URL for teacher {teacher_id}: {object_key}")
        
        return PresignedUploadURLResponse(
            upload_url=upload_url,
            object_key=object_key,
            upload_expires_in_seconds=3600,
            video_id=video.id
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error generating presigned URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating upload URL: {str(e)}")

# POST /videos/complete-upload - Finalize upload
@router.post("/complete-upload", response_model=VideoOut)
async def complete_upload(
    request: CompleteUploadRequest,
    token_data = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Complete video upload and store metadata"""
    teacher_id = token_data.get("teacher_id")
    if not teacher_id:
        raise HTTPException(status_code=401, detail="Not authenticated as teacher")
    
    try:
        video = db.query(Video).filter(Video.id == request.video_id).first()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Verify ownership
        if video.teacher_id != teacher_id:
            raise HTTPException(status_code=403, detail="Not authorized to complete this upload")
        
        # Update video record
        video.object_key = request.object_key
        video.status = "completed"
        video.codec_info = request.codec_info
        video.thumbnail_key = request.thumbnail_key
        video.duration = request.duration
        
        db.commit()
        db.refresh(video)
        
        logger.info(f"Completed upload for video {video.id} by teacher {teacher_id}")
        
        return video
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error completing upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error completing upload: {str(e)}")

# GET /videos/{id}/presigned-download-url - Generate download URL
@router.get("/{video_id}/presigned-download-url", response_model=PresignedDownloadURLResponse)
async def get_presigned_download_url(
    video_id: int,
    token_data = Depends(verify_token),
    db: Session = Depends(get_db),
    r2_service = Depends(get_r2_service)
):
    """Generate presigned download URL for private videos"""
    teacher_id = token_data.get("teacher_id")
    
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Check if video is private
        if video.is_public == "true":
            # Public videos use CDN URL instead
            raise HTTPException(status_code=400, detail="Use /cdn-url for public videos")
        
        # Verify user has permission (owner or admin)
        if video.teacher_id != teacher_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this video")
        
        download_url = r2_service.generate_presigned_download_url(
            object_key=video.object_key,
            expires_in=3600  # 1 hour
        )
        
        logger.info(f"Generated presigned download URL for video {video_id}")
        
        return PresignedDownloadURLResponse(
            download_url=download_url,
            expires_in_seconds=3600
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating download URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating download URL: {str(e)}")

# GET /videos/{id}/cdn-url - Get public CDN URL
@router.get("/{video_id}/cdn-url", response_model=CDNURLResponse)
async def get_cdn_url(
    video_id: int,
    db: Session = Depends(get_db),
    r2_service = Depends(get_r2_service)
):
    """Get public CDN URL for video (public videos only)"""
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Check if video is public
        if video.is_public != "true":
            raise HTTPException(status_code=403, detail="Video is not public")
        
        cdn_url = r2_service.get_cdn_url(video.object_key)
        
        logger.info(f"Retrieved CDN URL for video {video_id}")
        
        return CDNURLResponse(cdn_url=cdn_url)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting CDN URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting CDN URL: {str(e)}")

# DELETE /videos/{id} - Delete video
@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video(
    video_id: int,
    token_data = Depends(verify_token),
    db: Session = Depends(get_db),
    r2_service = Depends(get_r2_service)
):
    """Delete video and remove from R2"""
    teacher_id = token_data.get("teacher_id")
    if not teacher_id:
        raise HTTPException(status_code=401, detail="Not authenticated as teacher")
    
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Verify ownership
        if video.teacher_id != teacher_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this video")
        
        # Delete from R2
        r2_service.delete_object(video.object_key)
        
        # Delete thumbnail if exists
        if video.thumbnail_key:
            r2_service.delete_object(video.thumbnail_key)
        
        # Delete database record
        db.delete(video)
        db.commit()
        
        logger.info(f"Deleted video {video_id} by teacher {teacher_id}")
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting video: {str(e)}")

# POST /videos/{id}/view - Increment view count
@router.post("/{video_id}/view", response_model=VideoOut)
async def increment_view_count(
    video_id: int,
    db: Session = Depends(get_db)
):
    """Increment view count for a video"""
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Increment view count (assuming views field exists in Video model)
        if hasattr(video, 'views'):
            video.views = (video.views or 0) + 1
        
        db.commit()
        db.refresh(video)
        
        logger.info(f"Incremented view count for video {video_id}")
        
        return video
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error incrementing view count: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating view count: {str(e)}")