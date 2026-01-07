# Quick Start Guide - Backend Improvements

## Installation

1. **Install new dependency**:
```bash
cd backend
pip install passlib[bcrypt]==1.7.4
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

## Configuration

2. **Create environment file**:
```bash
cp .env.example .env
```

3. **Edit `.env` file** and set at minimum:
```env
SECRET_KEY=<generate-a-strong-random-key>
GEMINI_API_KEY=<your-existing-api-key>
```

**Generate a secure SECRET_KEY**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Running the Backend

4. **Start the server** (same as before):
```bash
uvicorn main:app --reload
```

Or from project root:
```bash
uvicorn backend.main:app --reload
```

## What's Different?

### For Users
- Nothing! The API works exactly the same
- Existing users can log in with their current passwords
- Passwords are automatically upgraded to secure hashes on login

### For Developers
- Check `backend.log` for detailed application logs
- Configure CORS via environment variable for different environments
- Better error messages and debugging information

## Verification

Test that everything works:

1. **Start the backend**:
```bash
uvicorn main:app --reload
```

2. **Check logs**: You should see:
```
INFO - CORS allowed origins: [...]
INFO - Topics data loaded and cached
WARNING - Using default SECRET_KEY! Set SECRET_KEY environment variable for production.
```

3. **Test authentication**: Try logging in with an existing user
   - Should work normally
   - Check logs for "Upgrading plain text password to hashed"

4. **Test new user signup**: Create a new user
   - Password should be automatically hashed
   - Login should work immediately

## Troubleshooting

### "Module not found: passlib"
```bash
pip install passlib[bcrypt]==1.7.4
```

### "SECRET_KEY not found" warning
- Create `.env` file
- Add `SECRET_KEY=your-secret-here`
- Restart backend

### CORS errors in frontend
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Logs not appearing
- Check `backend.log` file in backend directory
- Console logs should still appear as before

## Production Deployment

### Required Environment Variables
```env
SECRET_KEY=<strong-random-key>
ALLOWED_ORIGINS=https://yourdomain.com
GEMINI_API_KEY=<your-key>
```

### Optional (Email Features)
```env
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Recommended
- Set `DEBUG=False` if you add debug mode
- Use proper SMTP credentials for parent reports
- Review `backend.log` regularly

## Rolling Back

If you need to revert:

1. Uninstall passlib:
```bash
pip uninstall passlib
```

2. Restore old files from git:
```bash
git checkout <commit-hash> -- backend/
```

Note: Hashed passwords will need to be reset manually in the database.

## Next Steps

- ✅ Backend is production-ready
- ✅ No frontend changes needed
- ✅ Existing data is preserved
- ✅ Security improved
- ✅ Performance optimized

Happy coding! 🚀
