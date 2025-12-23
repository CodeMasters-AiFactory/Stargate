# Authentication API

User authentication and authorization endpoints.

## Overview

Stargate uses JWT-based authentication. Tokens expire after 24 hours.

## Endpoints

### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "plan": "professional",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Refresh Token

```http
POST /api/auth/refresh
Authorization: Bearer YOUR_REFRESH_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400
  }
}
```

## Error Responses

### Invalid Credentials
```json
{
  "success": false,
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

### Token Expired
```json
{
  "success": false,
  "error": "Token has expired",
  "code": "TOKEN_EXPIRED"
}
```

### Unauthorized
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

## Using Tokens

Include the JWT token in all authenticated requests:

```javascript
fetch('/api/projects', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Security Notes

- Passwords are hashed with bcrypt
- Tokens use HS256 algorithm
- Rate limiting: 5 login attempts per minute
- Sessions can be revoked server-side
