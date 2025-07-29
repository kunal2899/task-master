# Task Master

A Collaborative Task Tracking System for teams. Task Master allows users to create teams, assign tasks, comment, and manage attachments in a collaborative environment. Built with Node.js, Express, and PostgreSQL.

---

## Table of Contents
- [Features](#features)
- [File Structure](#file-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Running the App](#running-the-app)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Teams](#teams)
  - [Tasks](#tasks)
  - [Comments](#comments)
  - [Attachments](#attachments)

---

## Features
- User registration, login, and authentication
- Team creation and user management (roles: owner, admin, member, viewer)
- Task creation, assignment, and status tracking
- Task comments and likes
- Task attachments (image, video, document)
- RESTful API design

---

## File Structure
```
task-master/
├── configs/           # App and DB config files
├── db/                # Database connection and migrations
│   ├── migrations/
│   │   ├── migrationFiles/   # SQL migration scripts
│   │   └── order.txt         # Migration order
│   └── connectionService.js  # DB connection logic
├── src/
│   ├── constants/     # App-wide constants
│   ├── controllers/   # Route controllers
│   ├── middlewares/   # Express middlewares & validators
│   ├── routes/        # API route definitions
│   ├── schemas/       # Joi validation schemas
│   ├── services/      # Business logic
│   └── utils/         # Utility functions
├── package.json
├── README.md
└── ...
```

---

## Setup & Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/kunal2899/task-master.git
   cd task-master
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values (see [Environment Variables](#environment-variables)).
4. **Set up the database:**
   - Ensure PostgreSQL is running and accessible.
   - Create a database for development.
   - Run migrations:
     ```bash
     npm run migrate
     ```

---

## Environment Variables
The following environment variables are required (see `configs/config.json`):

```
# For development
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=taskmaster_dev
DB_PORT=5432
PORT=3000
# For production
DATABASE_URL=postgres://user:password@host:port/dbname
```

---

## Database Schema
**Main tables:**
- `users`: id, name, email, password, created_at, updated_at
- `teams`: id, name, about, owner, created_at, updated_at
- `team_users`: id, user_id, team_id, role (owner/admin/member/viewer), status, added_by, created_at, updated_at
- `tasks`: id, name, description, due_date, added_by, priority, created_at, updated_at
- `team_user_tasks`: id, team_user_id, task_id, status, remark, completed_at, created_at, updated_at
- `task_comments`: id, task_id, added_by, data, likes_count
- `task_attachments`: id, task_id, added_by, media_url, media_type

---

## Running the App
1. **Start the server:**
   ```bash
   npm start
   ```
2. The server will run on `http://localhost:3000` (or the port set in your `.env`).

---

## API Documentation

All API endpoints are prefixed with `/v1`. Most endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### Authentication

#### Register User
```http
POST /v1/users
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongP@ss123"
}
```
> Note: Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-03-20T10:30:00Z"
  }
}
```

#### Login
```http
POST /v1/users/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "StrongP@ss123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Teams

#### Create Team
```http
POST /v1/teams
```

**Request Body:**
```json
{
  "name": "Engineering Team",
  "about": "Core engineering team for product development"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Engineering Team",
    "about": "Core engineering team for product development",
    "owner": 1,
    "created_at": "2024-03-20T10:35:00Z"
  }
}
```

#### Assign Users to Team
```http
POST /v1/teams/:teamId/assign
```

**Request Body:**
```json
{
  "users": [
    {
      "userId": 2,
      "role": "admin"
    },
    {
      "userId": 3,
      "role": "member"
    }
  ]
}
```
> Available roles: "owner", "admin", "member", "viewer"

**Response (200):**
```json
{
  "success": true,
  "data": {
    "assigned": [
      {
        "userId": 2,
        "role": "admin",
        "status": "pending"
      },
      {
        "userId": 3,
        "role": "member",
        "status": "pending"
      }
    ]
  }
}
```

### Tasks

#### Create Task
```http
POST /v1/teams/:teamId/:userId/tasks
```

**Request Body:**
```json
{
  "task": {
    "name": "Implement API Authentication",
    "description": "Add JWT authentication to all API endpoints",
    "dueDate": "2024-04-01T00:00:00Z",
    "priority": "high"
  }
}
```
> Priority levels: "highest", "high", "medium", "low", "lowest"

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Implement API Authentication",
    "description": "Add JWT authentication to all API endpoints",
    "due_date": "2024-04-01T00:00:00Z",
    "priority": "high",
    "added_by": 1,
    "created_at": "2024-03-20T10:40:00Z"
  }
}
```

#### Update Task Status
```http
PUT /v1/teams/:teamId/:userId/tasks/:taskId/status
```

**Request Body:**
```json
{
  "status": "in-progress"
}
```
> Available statuses: "not-started", "in-progress", "completed", "closed"

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "in-progress",
    "updated_at": "2024-03-20T10:45:00Z"
  }
}
```

### Comments

#### Add Comment to Task
```http
POST /v1/teams/:teamId/:userId/tasks/:taskId/comments
```

**Request Body:**
```json
{
  "comment": "Initial authentication implementation completed. Please review."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "task_id": 1,
    "added_by": 1,
    "data": "Initial authentication implementation completed. Please review.",
    "likes_count": 0,
    "created_at": "2024-03-20T10:50:00Z"
  }
}
```

### Attachments

#### Add Task Attachment
```http
POST /v1/teams/:teamId/:userId/tasks/:taskId/attachments
```

**Request Body:**
```json
{
  "mediaUrl": "https://storage.example.com/files/auth-diagram.png",
  "mediaType": "image"
}
```
> Media types: "image", "video", "document"

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "task_id": 1,
    "added_by": 1,
    "media_url": "https://storage.example.com/files/auth-diagram.png",
    "media_type": "image",
    "created_at": "2024-03-20T10:55:00Z"
  }
}
```

### Error Responses

All endpoints return error responses in the following format:

**Response (4xx/5xx):**
```json
{
  "success": false,
  "message": "Error message for the user",
  "developerMessage": "Detailed error message (non-production only)"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
