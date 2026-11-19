# Complete Backend API Contract Specification

**Target Backend URL:** `https://localhost:7043`  
**Angular Proxy Path:** `/api`  
**Authentication Header:** `Authorization: Bearer <AccessToken>`

---

## 1. Authentication Controller (`/api/Auth`)
### `POST /api/Auth/login`
- **Rate Limit:** `AuthLimiter` (5 per 2 min)
- **Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
- **Response 200 OK:**
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "4a7e9..."
  }
  ```

### `POST /api/Auth/SingIn` (Note specific casing and spelling: `SingIn`)
- **Rate Limit:** `SingInLimiter` (1 per 15 min per IP)
- **Request:**
  ```json
  {
    "name": "Full Name",
    "email": "user@example.com",
    "password": "Password123!",
    "phone": "0501234567"
  }
  ```
- **Response 200 OK:**
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "4a7e9..."
  }
  ```

### `POST /api/Auth/refresh`
- **Request:**
  ```json
  {
    "refreshToken": "4a7e9..."
  }
  ```
- **Response 200 OK:**
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "new_refresh_token..."
  }
  ```

### `POST /api/Auth/logout`
- **Headers:** `Authorization: Bearer <AccessToken>`
- **Response 200 OK:** Revokes active refresh token.

---

## 2. Dashboard Controller (`/api/Dashboard`)
*Requires Role: `Admin` or `SuperAdmin`*
- `GET /api/Dashboard/summary`: Total, pending, in-progress, resolved, closed count.
- `GET /api/Dashboard/by-status`: Status count distribution.
- `GET /api/Dashboard/by-priority`: Priority count distribution.
- `GET /api/Dashboard/by-category`: Category count distribution.
- `GET /api/Dashboard/monthly-trend`: Monthly complaint submissions trend.

---

## 3. Complaints Controller (`/api/Complaints`)
- `GET /api/Complaints`: List complaints with pagination and filtering (search, statusId, priorityId, categoryId).
- `GET /api/Complaints/{id}`: Detailed complaint view with user info, status, priority, assignments.
- `POST /api/Complaints`: Create complaint.
- `PUT /api/Complaints/{id}`: Update complaint details.
- `PUT /api/Complaints/{id}/status`: Update complaint status (SuperAdmin/Admin/Assigned).
- `DELETE /api/Complaints/{id}`: Delete complaint (SuperAdmin).

---

## 4. Users Controller (`/api/Users`)
*Requires Role: `SuperAdmin`*
- `GET /api/Users`: List all system users with role names and status.
- `GET /api/Users/{id}`: User profile by ID.
- `POST /api/Users`: Create user account.
- `PUT /api/Users/{id}`: Update user profile.
- `DELETE /api/Users/{id}`: Deactivate/Delete user.

---

## 5. Reference Data Controllers
- **Categories:** `/api/Categories` (`GET`, `POST`, `PUT`, `DELETE` - Admin/SuperAdmin)
- **Priorities:** `/api/Priorities` (`GET`, `POST`, `PUT`, `DELETE` - Admin/SuperAdmin)
- **Statuses:** `/api/Statuses` (`GET`, `POST`, `PUT`, `DELETE` - Admin/SuperAdmin)

---

## 6. Interactions Controllers
- **Comments:** `/api/ComplaintComments` (`GET /by-complaint/{id}`, `POST`, `DELETE`)
- **Attachments:** `/api/ComplaintAttachments` (`POST /upload/{complaintId}`, `GET /by-complaint/{id}`, `DELETE /{id}`)
- **History:** `/api/ComplaintHistory` (`GET /by-complaint/{id}`)
- **Feedback:** `/api/ComplaintFeedback` (`GET /by-complaint/{id}`, `POST`)

