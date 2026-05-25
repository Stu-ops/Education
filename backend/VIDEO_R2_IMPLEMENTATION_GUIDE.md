# Cloudflare R2 Video Upload & Playback Implementation Guide

## Overview

This implementation provides a complete video upload and streaming system using:
- **Backblaze B2**: S3-compatible object storage for video files
- **FastAPI**: Backend API for managing uploads and access
- **React**: Frontend components for upload and playback

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (React Components)                                 │
│  ├─ VideoUpload.jsx      (upload to R2 via presigned URL)   │
│  ├─ VideoPlayer.jsx      (play from CDN or presigned URL)   │
│  └─ VideoList.jsx        (list and filter videos)           │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│  FastAPI Backend (/videos routes)                           │
│  ├─ POST   /videos/presigned-upload-url                     │
│  ├─ POST   /videos/complete-upload                          │
│  ├─ GET    /videos/{id}/presigned-download-url              │
│  ├─ GET    /videos/{id}/cdn-url                             │
│  ├─ GET    /videos (list)                                   │
│  ├─ DELETE /videos/{id}                                     │
│  └─ POST   /videos/{id}/view                                │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare R2 (S3 Compatible)                              │
│  ├─ Presigned Upload URLs (PUT)                             │
│  ├─ Presigned Download URLs (GET, private videos)           │
│  └─ Public CDN URLs (public videos)                         │
└─────────────────────────────────────────────────────────────┘
```

## Upload Flow

1. **Frontend** → Backend: Request presigned upload URL
2. **Backend** → Cloudflare: Generate presigned URL (valid 1 hour)
3. **Backend** → Database: Create Video record with "uploading" status
4. **Frontend** → Browser: Start multipart upload to R2
5. **Frontend** → Backend: Call complete-upload endpoint
6. **Backend** → Database: Update video status to "completed" + metadata

## Playback Flow

**Public Videos:**
1. Frontend gets CDN URL from backend
2. Frontend serves video through Cloudflare Cache (fast)
3. No presigned URL needed, cached for all users

**Private Videos:**
1. Frontend requests presigned download URL (auth required)
2. Backend generates 1-hour presigned URL
3. Frontend plays video via temporary secure URL
4. URL expires after 1 hour

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables
Copy `.env.example` to `.env` and fill in Cloudflare R2 credentials:

```env
# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_BUCKET_NAME=videos
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_CUSTOM_DOMAIN=videos.yourdomain.com
```

#### Database Migration
If adding to existing database, the new Video fields are optional:
- `object_key`: S3 object path
- `r2_bucket_url`: Base R2 URL
- `is_public`: Public/private flag
- `status`: uploading/completed/failed
- `codec_info`: Video codec metadata
- `thumbnail_key`: Thumbnail location
- `upload_id`: Multipart upload ID

### 2. Frontend Setup

#### Install Video Components
```bash
# Components already created in src/components/video/
# - VideoUpload.jsx
# - VideoPlayer.jsx
# - VideoList.jsx
```

#### Example Usage in React
```jsx
import VideoUpload from '@/components/video/VideoUpload';
import VideoPlayer from '@/components/video/VideoPlayer';
import VideoList from '@/components/video/VideoList';

function TeacherDashboard() {
  const token = localStorage.getItem('access_token');

  return (
    <div>
      {/* Upload Form */}
      <VideoUpload 
        teacherToken={token} 
        onUploadSuccess={(video) => console.log('Uploaded:', video)}
      />

      {/* Video List */}
      <VideoList userToken={token} />
    </div>
  );
}

function StudentDashboard() {
  return (
    <>
      {/* List Public Videos */}
      <VideoList showPrivate={false} />
    </>
  );
}

function VideoPage({ videoId }) {
  return (
    <VideoPlayer 
      videoId={videoId}
      isPublic={true}
      userToken={localStorage.getItem('access_token')}
    />
  );
}
```

### 3. Cloudflare R2 Setup

#### Create R2 Bucket
1. Go to https://dash.cloudflare.com/
2. Navigate to R2 > Buckets
3. Click "Create Bucket"
4. Name: `videos` (or your preference)
5. Region: Auto
6. Create bucket

#### Generate API Token
1. Go to Account Settings > API Tokens
2. Create Token with permissions:
   - Object Storage > Edit
   - Includes > All resources
3. Get:
   - Access Key ID
   - Secret Access Key

#### Configure Custom Domain (Optional but Recommended)
1. In R2 Bucket Settings > Custom Domains
2. Add your domain (e.g., `videos.yourdomain.com`)
3. Create DNS CNAME pointing to Cloudflare
4. Enable Cache Everything rule for optimal performance

#### Configure CORS
In R2 Bucket Settings > CORS Rules, add:
```json
{
  "AllowedOrigins": ["https://yourdomain.com", "https://app.yourdomain.com"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600
}
```

## API Endpoints

### 1. Generate Presigned Upload URL
```http
POST /videos/presigned-upload-url
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Lesson 1",
  "description": "Introduction to Mathematics",
  "class_level": "class_10",
  "subject": "Mathematics",
  "is_public": true,
  "filename": "lesson1.mp4",
  "content_type": "video/mp4"
}

Response (201):
{
  "upload_url": "https://..../videos/teacher_123/...",
  "object_key": "videos/123/20260516_145230_lesson1.mp4",
  "upload_expires_in_seconds": 3600,
  "video_id": 42
}
```

### 2. Complete Upload
```http
POST /videos/complete-upload
Authorization: Bearer {token}
Content-Type: application/json

{
  "video_id": 42,
  "object_key": "videos/123/20260516_145230_lesson1.mp4",
  "file_size": 524288000,
  "duration": 1800,
  "codec_info": {"video": "h264", "audio": "aac"},
  "thumbnail_key": "thumbnails/123/lesson1.jpg"
}

Response (200):
{
  "message": "Upload completed successfully",
  "video_id": 42,
  "status": "completed"
}
```

### 3. Get Presigned Download URL (Private Videos)
```http
GET /videos/{video_id}/presigned-download-url?expiration_hours=1
Authorization: Bearer {token}

Response (200):
{
  "download_url": "https://..../videos/123/...",
  "expires_in_seconds": 3600
}
```

### 4. Get CDN URL (Public Videos)
```http
GET /videos/{video_id}/cdn-url

Response (200):
{
  "cdn_url": "https://videos.yourdomain.com/videos/123/lesson1.mp4"
}
```

### 5. List Videos
```http
GET /videos?class_level=class_10&subject=Mathematics&is_public=true

Response (200):
[
  {
    "id": 42,
    "title": "Lesson 1",
    "description": "...",
    "class_level": "class_10",
    "subject": "Mathematics",
    "is_public": "true",
    "view_count": 125,
    "upload_date": "2026-05-16T14:52:30",
    "object_key": "videos/123/...",
    "status": "completed",
    ...
  }
]
```

### 6. Get Video Metadata
```http
GET /videos/{video_id}

Response (200):
{
  "id": 42,
  "title": "Lesson 1",
  "description": "...",
  "class_level": "class_10",
  "subject": "Mathematics",
  "is_public": "true",
  "view_count": 125,
  "upload_date": "2026-05-16T14:52:30",
  "object_key": "videos/123/...",
  "status": "completed",
  ...
}
```

### 7. Increment View Count
```http
POST /videos/{video_id}/view

Response (200):
{
  "view_count": 126
}
```

### 8. Delete Video
```http
DELETE /videos/{video_id}
Authorization: Bearer {token}

Response (200):
{
  "message": "Video deleted successfully"
}
```

## File Structure

### Backend
```
backend/
├── r2_service.py          # Cloudflare R2 client
├── routers/
│   └── video_r2.py        # Video API endpoints
├── models/
│   ├── models.py          # SQLAlchemy Video model (updated)
│   └── schemas.py         # Pydantic schemas (updated)
├── requirements.txt       # Updated with boto3
├── .env.example           # R2 credentials template
└── main.py               # Updated with video_r2 router
```

### Frontend
```
src/components/video/
├── VideoUpload.jsx        # Upload component
├── VideoPlayer.jsx        # Playback component
└── VideoList.jsx          # Video gallery
```

## Performance Optimization

### 1. Cloudflare Cache Configuration
Set up cache rules for public videos:
```
Path: /videos/*
Cache Level: Cache Everything
Browser Cache TTL: 1 hour
Edge Cache TTL: 1 month
```

### 2. Multipart Upload for Large Files
- Files > 100MB automatically use multipart upload
- Each part must be ≥ 5MB (except last)
- Supports resumable uploads

### 3. CDN Optimization
- Public videos served from Cloudflare Cache
- Custom domain accelerates delivery
- TTL: 1 month (configurable)

## Security Considerations

### 1. Authentication
- All upload endpoints require JWT authentication
- Token verified before allowing uploads
- Only video owner can delete

### 2. Presigned URL Expiry
- Upload URLs: 1 hour (configurable)
- Download URLs: 1 hour (customizable per request)
- Prevents unauthorized access

### 3. CORS Configuration
- Browser upload requests validate origin
- Only allowed origins can upload
- Configure in R2 settings

### 4. Ownership Validation
- Backend verifies video ownership
- Users can only access their own private videos
- Public videos accessible to all

### 5. Object Storage Security
- R2 bucket private by default
- Only presigned URLs grant temporary access
- No public read/list permissions

## Troubleshooting

### Upload Fails
1. Check R2 credentials in `.env`
2. Verify bucket exists and is accessible
3. Check file size (must be < 500MB)
4. Verify JWT token is valid

### Video Won't Play
1. Check `status` field is "completed"
2. Verify `object_key` is set
3. Check CORS configuration in R2
4. Verify presigned URL hasn't expired

### CDN URL Not Working
1. Verify custom domain is configured in R2
2. Check CNAME DNS record
3. Ensure Cache Everything rule exists
4. Wait for DNS propagation (up to 24 hours)

## Future Enhancements

1. **Thumbnail Generation**: Auto-extract thumbnails from videos
2. **Video Transcoding**: Convert to multiple quality levels
3. **HLS Streaming**: Adaptive bitrate streaming
4. **Video Analytics**: Track watch time, completion rate
5. **Video Versioning**: Support multiple versions of same video
6. **Batch Upload**: Queue multiple files
7. **Download Videos**: Allow downloads for offline viewing
8. **Comments/Annotations**: Add student feedback
