# Video Upload & Playback with backblaze B2 - Quick Start Guide

## 5-Minute Setup

### Step 1: Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure Environment
```bash
cp .env.example .env
# Edit .env and add your backblaze B2 credentials:
# - BACKBLAZE_B2_ACCESS_KEY_ID
# - BACKBLAZE_B2_SECRET_ACCESS_KEY
# - BACKBLAZE_B2_BUCKET_NAME
# - BACKBLAZE_B2_ENDPOINT
# - BACKBLAZE_B2_REGION
# - CLOUDFLARE_CUSTOM_DOMAIN (optional)
```

### Step 3: Start Backend
```bash
uvicorn main:app --reload
# API will be at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Step 4: Use Video Components

#### In Teacher Dashboard
```jsx
import VideoUpload from '@/components/video/VideoUpload';

export default function TeacherPage() {
  const token = localStorage.getItem('access_token');
  
  return (
    <VideoUpload 
      teacherToken={token}
      onUploadSuccess={(video) => {
        console.log('Video uploaded:', video);
        // Refresh video list, redirect, etc.
      }}
    />
  );
}
```

#### In Student Page
```jsx
import VideoPlayer from '@/components/video/VideoPlayer';
import VideoList from '@/components/video/VideoList';

export default function StudentPage() {
  return (
    <>
      <VideoList 
        showPrivate={false}
        onSelectVideo={(video) => {
          // Show video player
        }}
      />
    </>
  );
}
```

#### Play Specific Video
```jsx
<VideoPlayer 
  videoId={42}
  isPublic={true}
  userToken={localStorage.getItem('access_token')}
/>
```

## Files Created/Modified

### Backend

#### New Files
- `r2_service.py` - backblaze B2 client with presigned URL generation
- `routers/video_r2.py` - Video API endpoints (13 endpoints)

#### Modified Files
- `requirements.txt` - Added boto3, aioboto3
- `models/models.py` - Updated Video model with R2 fields
- `models/schemas.py` - Updated VideoOut schema
- `main.py` - Added video_r2 router
- `.env.example` - Added R2 configuration variables

### Frontend

#### New Components
- `src/components/video/VideoUpload.jsx` - Upload with progress
- `src/components/video/VideoPlayer.jsx` - Playback with CDN/presigned support
- `src/components/video/VideoList.jsx` - Video gallery with filters

### Documentation
- `backend/VIDEO_R2_IMPLEMENTATION_GUIDE.md` - Full guide

## Key Features Implemented

✅ **Presigned Upload URLs**
- Generate time-limited upload URLs (1 hour)
- Direct upload from browser to R2
- No server bandwidth used

✅ **Presigned Download URLs**
- For private videos (owner only)
- Time-limited access (configurable)
- Fresh URL generated on each request

✅ **Public CDN Delivery**
- Cloudflare Cache for fast delivery
- Custom domain support
- Cached globally

✅ **Multipart Upload**
- Automatic for files > 100MB
- Parts ≥ 5MB except last part
- Resume support

✅ **Security**
- JWT authentication required
- Ownership verification
- Configurable expiry times
- CORS protected

✅ **Metadata Management**
- Title, description, class level
- Subject filtering
- Duration tracking
- View counting
- Upload date tracking

✅ **Error Handling**
- User-friendly error messages
- Retry mechanisms
- Graceful fallbacks

## Test the API

### 1. Get Teacher Token
```bash
curl -X POST http://localhost:8000/teachers/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=teacher1&password=pass123"
```

### 2. Request Presigned Upload URL
```bash
curl -X POST http://localhost:8000/videos/presigned-upload-url \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lesson 1",
    "class_level": "class_10",
    "subject": "Math",
    "filename": "lesson.mp4",
    "is_public": true
  }'
```

### 3. List Videos
```bash
curl http://localhost:8000/videos?class_level=class_10&is_public=true
```

## Architecture

```
Browser (React)
    ↓
VideoUpload Component
    ↓ (1) Request presigned URL
Backend (/videos/presigned-upload-url)
    ↓ (2) Generate presigned URL via boto3
backblaze B2
    ← (3) Return presigned URL
Browser
    ↓ (4) Upload video directly to R2 (PUT)
backblaze B2
    ← (5) Upload complete
Browser
    ↓ (6) Call complete-upload endpoint
Backend (/videos/complete-upload)
    ↓ (7) Store metadata in DB
Database
    ← (8) Video record created

For Playback:
Browser (React)
    ↓
VideoPlayer Component
    ↓ (1) Check if public
    ├─ If Public → Get CDN URL → Play
    └─ If Private → Request presigned download URL → Play
```

## Costs and Performance

### R2 Storage
- $0.015 per GB/month (first 10GB free)
- No download fees
- Significant savings vs traditional S3

### Cloudflare Cache
- No additional cost if using Cloudflare
- Global CDN delivery
- Reduces R2 bandwidth usage

### Presigned URLs
- Generated on-demand
- No storage/bandwidth cost
- Secure temporary access

## Next Steps

1. **Create backblaze B2 bucket** (5 min)
2. **Generate API credentials** (2 min)
3. **Update .env file** (2 min)
4. **Test API endpoints** (5 min)
5. **Integrate components into app** (15 min)

## Support & Troubleshooting

Check `VIDEO_R2_IMPLEMENTATION_GUIDE.md` for:
- Detailed setup instructions
- Complete API reference
- Troubleshooting guide
- Performance optimization
- Security best practices
