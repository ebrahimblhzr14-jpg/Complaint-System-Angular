# Complete API Contract Specification

Base URL (Dev Proxy): `/api`
Backend Real URL: `https://localhost:7208`

All protected endpoints require the HTTP Header:
`Authorization: Bearer <AccessToken>`

---

## 1. Authentication & Session (`/api/Auth`)

### `POST /api/Auth/login`
- **Rate Limit:** `AuthLimiter` (5 per 2 min)
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "4a7e9..."
  }
  ```
- **Response `401 Unauthorized`:**
  ```json
  {
    "message": "Invalid email or password."
  }
  ```

### `POST /api/Auth/SingIn` (Note specific casing and spelling: `SingIn`)
- **Rate Limit:** `SingInLimiter` (1 per 15 min per IP)
- **Request Body:**
  ```json
  {
    "name": "Full Name",
    "email": "user@example.com",
    "password": "Password123!",
    "phone": "+1234567890"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "4a7e9..."
  }
  ```
- **Response `409 Conflict`:**
  ```json
  {
    "message": "Email already registered."
  }
  ```

### `POST /api/Auth/refresh`
- **Request Body:**
  ```json
  {
    "refreshToken": "4a7e9..."
  }
  ```
- **Response `200 OK`:** `LoginResponseDto` (`accessToken`, `refreshToken`)
- **Response `401 Unauthorized`:** `{"message": "Invalid or expired refresh token."}`

### `POST /api/Auth/logout`
- **Request Body:**
  ```json
  {
    "refreshToken": "4a7e9..."
  }
  ```
- **Response `200 OK`:** `{"message": "Logged out successfully."}`

---

## 2. Complaints Management (`/api/Complaints`)

### `GET /api/Complaints/All`
- **Roles:** `SuperAdmin`
- **Response `200 OK`:** `ComplaintDto[]`

### `GET /api/Complaints/AllByUserID/{ID}`
- **Authorization:** `OwnerOrSuperAdmin` (Authenticated user ID must match `{ID}` or user is `SuperAdmin`)
- **Response `200 OK`:** `ComplaintDto[]`

### `GET /api/Complaints/FindBy/{id}`
- **Authorization:** `OwnerOrAdminOrSuper` (Owner, Admin, or SuperAdmin)
- **Response `200 OK`:** `ComplaintDto`
- **Response `404 Not Found`**

### `POST /api/Complaints/Create`
- **Roles:** `User,Admin,SuperAdmin`
- **Rate Limit:** `CreateInApiLimiter` (3 per 3 min)
- **Request Body:**
  ```json
  {
    "categoryId": 1,
    "departmentId": 2, // optional / nullable
    "priorityId": 1,
    "title": "Issue title",
    "description": "Detailed explanation..."
  }
  ```
- **Response `201 Created`:** `ComplaintDto`

### `PUT /api/Complaints/Update/{id}`
- **Authorization:** `OwnerOrSuperAdmin`
- **Request Body:** `CreateComplaintDto`
- **Response `200 OK`:** `ComplaintDto`

### `PATCH /api/Complaints/assign`
- **Roles:** `SuperAdmin`
- **Request Body:**
  ```json
  {
    "complaintId": 10,
    "assignedToUserId": 5,
    "notes": "Please investigate urgently"
  }
  ```
- **Response `204 NoContent`**

### `PATCH /api/Complaints/{id}/status`
- **Roles:** `Admin,SuperAdmin`
- **Request Body:**
  ```json
  {
    "statusId": 3
  }
  ```
- **Response `204 NoContent`**

---

## 3. Dashboard Statistics (`/api/Dashboard`)
*Roles required for all dashboard endpoints:* `Admin,SuperAdmin`

### `GET /api/Dashboard/summary`
- **Response `200 OK`:**
  ```json
  {
    "totalComplaints": 120,
    "pendingComplaints": 45,
    "inProgressComplaints": 30,
    "resolvedComplaints": 35,
    "closedComplaints": 10
  }
  ```

### `GET /api/Dashboard/complaints-by-status`
- **Response `200 OK`:** Array of `{ "id": 1, "name": "Pending", "complaintCount": 45 }`

### `GET /api/Dashboard/complaints-by-priority`
- **Response `200 OK`:** Array of `{ "id": 1, "name": "High", "complaintCount": 15 }`

### `GET /api/Dashboard/complaints-by-category`
- **Response `200 OK`:** Array of `{ "id": 1, "name": "Technical", "complaintCount": 50 }`

---

## 4. Users Administration (`/api/Users`)

### `GET /api/Users/All`
- **Roles:** `SuperAdmin`
- **Response `200 OK`:** `UserDto[]`

### `GET /api/Users/FindBy/{id}`
- **Authorization:** `OwnerOrSuperAdmin`
- **Response `200 OK`:** `UserDto`

### `POST /api/Users/Create`
- **Roles:** `SuperAdmin` (and `AllowAnonymous` attribute present on action)
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "phone": "0501234567",
    "roleId": 2 // 1: User, 2: Admin, 3: SuperAdmin
  }
  ```
- **Response `201 Created`:** `UserDto`

### `PUT /api/Users/Update/{id}`
- **Authorization:** `OwnerOrSuperAdmin`
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "0501234567",
    "roleId": 2,
    "isActive": true
  }
  ```
- **Response `200 OK`:** `UserDto`

### `PATCH /api/Users/{id}/activate`
- **Roles:** `SuperAdmin`
- **Response `204 NoContent`**

### `PATCH /api/Users/{id}/deactivate`
- **Roles:** `SuperAdmin`
- **Response `204 NoContent`**

### `PUT /api/Users/PutDept?UserId={userId}&DepID={deptId}`
- **Roles:** `SuperAdmin`
- **Response `204 NoContent`**

### `PUT /api/Users/me/password`
- **Authorization:** Any authenticated user
- **Request Body:**
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword456!"
  }
  ```
- **Response `204 NoContent`**

### `PUT /api/Users/{id}/password`
- **Roles:** `SuperAdmin`
- **Request Body:**
  ```json
  {
    "newPassword": "ResetPassword123!"
  }
  ```
- **Response `204 NoContent`**

---

## 5. Reference Data: Categories, Priorities, Statuses

### Categories (`/api/Categories`)
- `GET /api/Categories/All` (Authenticated) -> `CategoryDto[]`
- `GET /api/Categories/FindBy/{id}` (Authenticated) -> `CategoryDto`
- `POST /api/Categories` (`Admin,SuperAdmin`) -> Body: `CreateCategoryDto` -> `201 Created`
- `PUT /api/Categories/Update/{id}` (`Admin,SuperAdmin`) -> Body: `UpdateCategoryDto` -> `200 OK`
- `PATCH /api/Categories/activate/{id}` (`Admin,SuperAdmin`) -> `204 NoContent`
- `PATCH /api/Categories/deactivate/{id}` (`Admin,SuperAdmin`) -> `204 NoContent`

### Priorities (`/api/Priorities`)
- `GET /api/Priorities/All` (AllowAnonymous) -> `PriorityDto[]`
- `GET /api/Priorities/GetBy/{id}` (AllowAnonymous) -> `PriorityDto`
- `POST /api/Priorities/Create` (`Admin,SuperAdmin`) -> Body: `CreatePriorityDto` -> `201 Created`
- `PUT /api/Priorities/Update/{id}` (`Admin,SuperAdmin`) -> Body: `UpdatePriorityDto` -> `200 OK`
- `PATCH /api/Priorities/{id}/activate` (`Admin,SuperAdmin`) -> `204 NoContent`
- `PATCH /api/Priorities/{id}/deactivate` (`Admin,SuperAdmin`) -> `204 NoContent`

### Statuses (`/api/Statuses`)
- `GET /api/Statuses/All` (AllowAnonymous) -> `StatusDto[]`
- `GET /api/Statuses/FindBy/{id}` (AllowAnonymous) -> `StatusDto`
- `POST /api/Statuses/create` (`Admin,SuperAdmin`) -> Body: `CreateStatusDto` -> `201 Created`
- `PUT /api/Statuses/Update/{id}` (`Admin,SuperAdmin`) -> Body: `UpdateStatusDto` -> `200 OK`
- `PATCH /api/Statuses/activate/{id}` (`Admin,SuperAdmin`) -> `204 NoContent`
- `PATCH /api/Statuses/deactivate/{id}` (`Admin,SuperAdmin`) -> `204 NoContent`

---

## 6. Comments, Attachments, Feedback & History

### Comments (`/api/ComplaintComments`)
- `GET /api/ComplaintComments/GetAll/{complaintId}` (Owner, Admin, SuperAdmin) -> `CommentDto[]`
- `GET /api/ComplaintComments/GetByID/{commentId}` (`Admin,SuperAdmin`) -> `CommentDto`
- `POST /api/ComplaintComments/Create` (Owner, Admin, SuperAdmin) -> Body: `CreateCommentDto` (`complaintId`, `comment`) -> `201 Created`
- `PUT /api/ComplaintComments/Update/{commentId}` (Comment Author or SuperAdmin) -> Body: `UpdateCommentDto` (`comment`) -> `200 OK`
- `DELETE /api/ComplaintComments/{commentId}?complaintId={complaintId}` (Comment Author or SuperAdmin) -> `204 NoContent` (Note: `complaintId` required as query param)

### Attachments (`/api/Attachment`)
- `POST /api/Attachment/Uploade/{complainId}`: Multipart form data with `imageFile` (Owner, Admin, SuperAdmin).
- `GET /api/Attachment/GetImagePath/{complainID}`: (Owner, Admin, SuperAdmin) -> Returns image URL string.

### Feedback (`/api/Feedback`)
- `GET /api/Feedback/FindBy{complaintId}` (Owner, Admin, SuperAdmin) -> `FeedbackDto`
- `GET /api/Feedback/FindByFeedID{feedbackId}?complaintId={complaintId}` -> `FeedbackDto`
- `POST /api/Feedback/create` (Owner, Admin, SuperAdmin) -> Body: `CreateFeedbackDto` (`complaintId`, `rating`, `comment`) -> `201 Created`
- `PUT /api/Feedback/Update/{feedbackId}?complaintId={complaintId}` (Feedback Author or SuperAdmin) -> Body: `UpdateFeedbackDto` (`rating`, `comment`) -> `200 OK`

### History (`/api/ComplaintHistory`)
- `GET /api/ComplaintHistory?complaintId={complaintId}` (`SuperAdmin` ONLY) -> `ComplaintHistoryDto[]`
- `GET /api/ComplaintHistory/{historyId}?complaintId={complaintId}` (`SuperAdmin` ONLY) -> `ComplaintHistoryDto`

