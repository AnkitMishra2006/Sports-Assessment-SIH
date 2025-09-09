# JWT Authentication API Documentation

## Overview

Simple JWT-based authentication system with MVC architecture for Athletes and Officials.

## Setup

1. Copy `.env.example` to `.env` and update the values
2. Make sure MongoDB is running
3. Start the server: `npm run dev`

## API Endpoints

### Authentication

#### Register Athlete

```
POST /api/auth/athlete/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "dateOfBirth": "1995-01-15",
  "address": "123 Street, City",
  "sport": "Football"
}
```

#### Login Athlete

```
POST /api/auth/athlete/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Register Official

```
POST /api/auth/official/register
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "1234567890",
  "officialId": "OFF001",
  "role": "Reviewer",
  "department": "Sports Authority"
}
```

#### Login Official

```
POST /api/auth/official/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "password123"
}
```

#### Get Profile (Protected)

```
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

### Athletes (Protected Routes)

#### Get Dashboard

```
GET /api/athletes/dashboard
Authorization: Bearer <jwt_token>
```

#### Update Profile

```
PUT /api/athletes/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "9876543210"
}
```

### Officials (Protected Routes)

#### Get Dashboard

```
GET /api/officials/dashboard
Authorization: Bearer <jwt_token>
```

#### Get All Submissions

```
GET /api/officials/submissions
Authorization: Bearer <jwt_token>
```

#### Review Submission

```
PUT /api/officials/submissions/{submissionId}/review
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "approved",
  "feedback": "Good performance",
  "score": 85
}
```

## Response Format

### Success Response

```json
{
  "message": "Success message",
  "user": { ... },
  "token": "jwt_token_here"
}
```

### Error Response

```json
{
  "error": "Error type",
  "message": "Error description"
}
```

## JWT Token Usage

Include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

## File Structure

```
backend/
├── controllers/
│   ├── authController.js
│   ├── athleteController.js
│   └── officialController.js
├── routes/
│   ├── authRoutes.js
│   ├── athleteRoutes.js
│   └── officialRoutes.js
├── middleware/
│   └── auth.js
└── utils/
    └── jwt.js
```
