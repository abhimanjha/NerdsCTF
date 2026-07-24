# API Documentation: nerdCTF - Version 1

All API endpoints are prefixed with `/api/v1`. Requests must include cookie session headers or standard JWT tokens where authenticated.

---

## 1. Authentication Module (`/auth`)

### Post Registration
- **Route**: `POST /auth/register`
- **Authentication**: None (Rate limited: Max 10 per 15 mins)
- **Request Body**:
  ```json
  {
      "email": "user@example.com",
      "username": "net_hunter",
      "password": "Password123!"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
      "success": true,
      "message": "Registration successful! You can now log in."
  }
  ```

### Post Login
- **Route**: `POST /auth/login`
- **Authentication**: None (Rate limited: Max 10 per 15 mins)
- **Request Body**:
  ```json
  {
      "email": "user@example.com",
      "password": "Password123!"
  }
  ```
- **Response (200 OK)**:
  Sets HTTPOnly cookies `accessToken` (15m) and `refreshToken` (7d).
  ```json
  {
      "success": true,
      "user": {
          "id": 14,
          "username": "net_hunter",
          "email": "user@example.com",
          "role": "USER",
          "avatar": null,
          "country": null
      }
  }
  ```

### Get Profile Context
- **Route**: `GET /auth/me`
- **Authentication**: Required (cookie `accessToken` or Authorization Bearer header)
- **Response (200 OK)**:
  ```json
  {
      "success": true,
      "user": {
          "id": 14,
          "username": "net_hunter",
          "email": "user@example.com",
          "role": "USER",
          "avatar": null,
          "country": null,
          "createdAt": "2026-07-23T22:00:00.000Z"
      }
  }
  ```

### Post Token Refresh
- **Route**: `POST /auth/refresh`
- **Authentication**: Required (cookie `refreshToken`)
- **Response (200 OK)**:
  Rotates refresh token. Sets new `accessToken` and `refreshToken` cookies.
  ```json
  {
      "success": true,
      "message": "Tokens rotated successfully."
  }
  ```

### Post Logout
- **Route**: `POST /auth/logout`
- **Authentication**: Required
- **Response (200 OK)**:
  Clears cookies and revokes tokens.
  ```json
  {
      "success": true,
      "message": "Logged out successfully."
  }
  ```

---

## 2. Challenges Module (`/challenges`)

### Get Challenges
- **Route**: `GET /challenges`
- **Authentication**: Required
- **Response (200 OK)**:
  ```json
  {
      "success": true,
      "challenges": [
          {
              "id": 1,
              "title": "Cookie Monster",
              "difficulty": "Easy",
              "description": "Learn how cookies work...",
              "objectives": "Inspect cookies...",
              "category": "Web Exploitation",
              "points": 100,
              "tags": ["cookies", "web"],
              "estimatedTime": 10,
              "solved": true,
              "dockerImage": "lab1-cookie-monster:latest",
              "hints": [
                  { "id": 1, "costPoints": 10 }
              ]
          }
      ]
  }
  ```

### Post Unlock Hint
- **Route**: `POST /challenges/hint`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
      "challengeId": 1,
      "hintId": 1
  }
  ```
- **Response (200 OK)**:
  ```json
  {
      "success": true,
      "hint": "Check the browser Application Storage tab."
  }
  ```

### Post Submit Flag
- **Route**: `POST /challenges/submit`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
      "challengeId": 1,
      "flag": "nerdCTF{c00k13_m0nst3r_m4n1pul4t10n}"
  }
  ```
- **Response (200 OK - Correct)**:
  ```json
  {
      "success": true,
      "correct": true,
      "message": "Correct Flag! Congratulations."
  }
  ```

---

## 3. Academy Module (`/academy`)

### Get Topics Map
- **Route**: `GET /academy/topics`
- **Authentication**: Required
- **Response (200 OK)**:
  ```json
  {
      "success": true,
      "topics": [
          {
              "id": 1,
              "title": "Introduction to Cybersecurity",
              "description": "Fundamental principles...",
              "orderIndex": 1,
              "lessons": [
                  { "id": 1, "title": "Welcome to nerdCTF", "orderIndex": 1 }
              ]
          }
      ]
  }
  ```

### Get Lesson Content
- **Route**: `GET /academy/lesson/:id`
- **Authentication**: Required
- **Response (200 OK)**:
  ```json
  {
      "success": true,
      "lesson": {
          "id": 1,
          "title": "Welcome to nerdCTF",
          "contentMarkdown": "# Welcome to nerdCTF...",
          "quizzes": []
      },
      "completed": false
  }
  ```

### Post Complete Lesson
- **Route**: `POST /academy/lesson/complete`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
      "lessonId": 1
  }
  ```
- **Response (200 OK)**:
  ```json
  {
      "success": true,
      "message": "Progress saved successfully."
  }
  ```
