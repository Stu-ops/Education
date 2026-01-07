# Authentication Guide - OAuth2 Password Bearer

## Overview

The backend uses **OAuth2 Password Bearer** authentication - a single, standardized method that works everywhere.

## 🔐 How Authentication Works

**One method for everything:**
- ✅ FastAPI Swagger UI "Authorize" button
- ✅ Standard `Authorization: Bearer <token>` header
- ✅ All endpoints use the same authentication
- ✅ Consistent across users, parents, and teachers

## 🚀 Quick Start

### Using FastAPI Swagger UI (Recommended for Testing)

1. **Open docs**: `http://localhost:8000/docs`
2. **Click "Authorize"** (top right, lock icon 🔒)
3. **Enter credentials**:
   ```
   Username: your_username
   Password: your_password
   ```
4. **Click "Authorize"** and **"Close"**
5. **Try any endpoint** - authentication works automatically!

### Using in Your Application

```javascript
// 1. Get token using OAuth2 format (form data)
const formData = new URLSearchParams();
formData.append('username', 'myuser');
formData.append('password', 'mypass');

const response = await fetch('http://localhost:8000/users/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: formData
});

const { access_token } = await response.json();

// 2. Use token in all subsequent requests
const userResponse = await fetch('http://localhost:8000/users/me', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});
```

**Or use the JSON login endpoint (also returns same token format):**

```javascript
// Alternative: JSON login endpoint (easier for apps)
const response = await fetch('http://localhost:8000/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'myuser',
    password: 'mypass'
  })
});

const { access_token } = await response.json();

// Use token exactly the same way
fetch('http://localhost:8000/users/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

## 📋 Authentication Endpoints

### Users (Students)
- **Token**: `POST /users/token` (OAuth2 - for Swagger UI)
- **Login**: `POST /users/login` (JSON - for apps)
- **Signup**: `POST /users/signup`

### Parents
- **Token**: `POST /parents/token` (OAuth2 - for Swagger UI)
- **Login**: `POST /parents/login` (JSON - for apps)
- **Register**: `POST /parents/register`

### Teachers
- **Token**: `POST /teachers/token` (OAuth2 - for Swagger UI)
- **Login**: `POST /teachers/login` (JSON - for apps)
- **Register**: `POST /teachers/register`

**Note:** `/token` and `/login` endpoints both return the same JWT token, just accept different input formats (form vs JSON).

## 💡 Token Format

All endpoints return the same format:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

Use it with: `Authorization: Bearer <access_token>`

## ⏱ Token Expiration

- **Users & Parents**: 1 hour
- **Teachers**: 24 hours

After expiration, get a new token by logging in again.

## 🎯 Complete Examples

### Python
```python
import requests

# Login
response = requests.post(
    'http://localhost:8000/users/login',
    json={'username': 'user', 'password': 'pass'}
)
token = response.json()['access_token']

# Use token
headers = {'Authorization': f'Bearer {token}'}
user = requests.get('http://localhost:8000/users/me', headers=headers)
print(user.json())
```

### JavaScript/TypeScript
```typescript
class AuthService {
  private token: string | null = null;

  async login(username: string, password: string) {
    const res = await fetch('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    this.token = data.access_token;
    localStorage.setItem('token', this.token);
  }

  getAuthHeader() {
    return { 'Authorization': `Bearer ${this.token || localStorage.getItem('token')}` };
  }

  async fetchProtected(url: string) {
    return fetch(url, { headers: this.getAuthHeader() });
  }
}
```

### cURL
```bash
# Get token
TOKEN=$(curl -s -X POST "http://localhost:8000/users/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}' \
  | jq -r '.access_token')

# Use token
curl "http://localhost:8000/users/me" \
  -H "Authorization: Bearer $TOKEN"
```

## 🔒 Security

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens signed with SECRET_KEY
- ✅ Tokens expire automatically
- ✅ HTTPS recommended for production

## 🛠 Troubleshooting

### "Not authenticated" error
- Check token is included: `Authorization: Bearer <token>`
- Verify token hasn't expired (1-24 hours)
- Get new token by logging in again

### Swagger UI "Authorize" not working
- Make sure you clicked "Authorize" then "Close"
- Try using `/users/token`, `/parents/token`, or `/teachers/token`
- Check credentials are correct

### Token validation fails
- Ensure you're using `Bearer` prefix
- Check token isn't corrupted (copied correctly)
- Verify `SECRET_KEY` is set in environment

## ✨ Summary

- **One authentication method**: OAuth2 Password Bearer
- **Works everywhere**: Swagger UI, frontend, mobile, etc.
- **Simple to use**: Just add `Authorization: Bearer <token>` header
- **Standardized**: Follows OAuth2 specification
- **Production-ready**: Secure and battle-tested
