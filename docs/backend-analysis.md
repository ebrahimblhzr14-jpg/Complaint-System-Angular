# Backend Architecture Analysis & Reverse Engineering Report

## 1. Executive Summary
- **Backend Stack:** ASP.NET Core 8.0 / 10.0 runtime with Entity Framework Core and ADO.NET / Stored Procedures (`ComplainsSystemAPI`).
- **Database:** Microsoft SQL Server (`ComplaintManagementDB`), accessed via `ComplaintDbContext` and stored procedures (e.g. `sp_Users_GetById`, `sp_Complaints_Create`, etc.).
- **Authentication:** JWT Bearer tokens with symmetric key encryption (`HmacSha256`), refresh tokens stored in database (`RefreshTokens` table).
- **Default Port Configuration:**
  - HTTPS: `https://localhost:7208` (configured in CORS and launch profiles) / `https://localhost:7043`
  - HTTP: `http://localhost:5199`
- **Security & Authorization:** Role-based (`SuperAdmin`, `Admin`, `User`) and Resource-based policy authorization (`OwnerOrSuperAdmin`, `OwnerOrAdminOrSuper`).
- **CORS Policy:** Strict `CorsPolicy` restricted exclusively to `https://localhost:7208` and `http://localhost:5199`. An Angular development proxy (`proxy.conf.json`) is strictly required to route frontend requests without violating backend CORS rules.
- **Rate Limiting:** Built-in rate limiting enabled on sensitive routes:
  - `AuthLimiter`: 5 attempts / 2 minutes per IP.
  - `SingInLimiter`: 1 registration / 15 minutes per IP.
  - `GeneralApiLimiter`: 5 calls / 1 minute per user ID/IP.
  - `CreateInApiLimiter`: 3 calls / 3 minutes per user ID/IP.

---

## 2. Solution Structure
The backend solution consists of three primary projects:
1. **`ComplainsSystemAPI`:**
   - Web API hosting controllers, JWT authentication middleware, authorization policies, Serilog request logging, exception middleware, and rate limiters.
2. **`ComplaintManagement.Business`:**
   - Business services (`AuthService`, `ComplaintService`, `UserService`, `CategoryService`, `PriorityService`, `StatusService`, `CommentService`, `AttachmentService`, `FeedbackService`, `DashboardService`, `DepartmentService`, `RoleService`).
   - DTOs and Data Annotations.
   - Security primitives (`JwtTokenService`, `PasswordHasher`, `RefreshTokenGenerator`).
3. **`ComplaintManagement.Access.EFCore`:**
   - Entity models (`User`, `Role`, `Complaint`, `ComplaintCategory`, `ComplaintStatus`, `Priority`, `ComplaintAssignment`, `ComplaintComment`, `ComplaintAttachment`, `ComplaintHistory`, `ComplaintFeedback`, `Department`, `RefreshToken`).
   - Database context, migration history, and repository implementations invoking SQL stored procedures.

---

## 3. Discovered Controllers & Capabilities

| Controller | Route | Operations Available | Key Authorization Rules |
|------------|-------|----------------------|-------------------------|
| `AuthController` | `/api/Auth` | `login`, `SingIn`, `refresh`, `logout` | Anonymous / Rate Limited |
| `ComplaintsController` | `/api/Complaints` | `All`, `AllByUserID/{ID}`, `FindBy/{id}`, `Create`, `Update/{id}`, `assign`, `{id}/status` | SuperAdmin for `All`, Owner/SuperAdmin for user complaints and updates, Admin/SuperAdmin for status updates |
| `DashboardController` | `/api/Dashboard` | `summary`, `complaints-by-status`, `complaints-by-priority`, `complaints-by-category` | `Admin,SuperAdmin` |
| `UsersController` | `/api/Users` | `All`, `FindBy/{id}`, `Create`, `Update/{id}`, `activate`, `deactivate`, `PutDept`, `me/password`, `{id}/password` | SuperAdmin for user management, User for own password |
| `CategoriesController` | `/api/Categories` | `All`, `FindBy/{id}`, `POST`, `Update/{id}`, `activate/{id}`, `deactivate/{id}` | Read: Authenticated; Write: `Admin,SuperAdmin` |
| `PrioritiesController` | `/api/Priorities` | `All`, `GetBy/{id}`, `Create`, `Update/{id}`, `{id}/activate`, `{id}/deactivate` | Read: Anonymous; Write: `Admin,SuperAdmin` |
| `StatusesController` | `/api/Statuses` | `All`, `FindBy/{id}`, `create`, `Update/{id}`, `activate/{id}`, `deactivate/{id}` | Read: Anonymous; Write: `Admin,SuperAdmin` |
| `ComplaintCommentsController` | `/api/ComplaintComments` | `GetAll/{complaintId}`, `GetByID/{commentId}`, `Create`, `Update/{commentId}`, `Delete/{commentId}` | Read/Create: Owner/Admin/SuperAdmin; Update/Delete: Comment Author or SuperAdmin |
| `AttachmentController` | `/api/Attachment` | `Uploade/{complainId::int}`, `GetImagePath/{complainID::int}` | Owner/Admin/SuperAdmin |
| `FeedbackController` | `/api/Feedback` | `FindBy{complaintId::int}`, `FindByFeedID{feedbackId:int}`, `create`, `Update/{feedbackId:int}` | Read/Create: Owner/Admin/SuperAdmin; Update: Feedback Owner/SuperAdmin |
| `ComplaintHistoryController` | `/api/ComplaintHistory` | `GET ?complaintId={id}`, `GET /{historyId}?complaintId={id}` | `SuperAdmin` ONLY |

---

## 4. Unsupported or Missing Features
1. **Departments CRUD Controller:** Although `DepartmentsRepository` and `DepartmentService` exist, there is no `DepartmentsController` exposed in `ComplainsSystemAPI`. Only assigning a department to a user via `/api/Users/PutDept?UserId=...&DepID=...` exists.
2. **Roles Management Controller:** `RoleService` exists, but there is no `RolesController`. Roles are fixed (`User` = 1, `Admin` = 2, `SuperAdmin` = 3).
3. **Complaint Deletion:** `ComplaintsController` has no `DELETE` endpoint.
4. **Server-Side Pagination & Sorting:** All `GetAll` endpoints return full lists (`IEnumerable<T>`); pagination and filtering must be handled on the client side.
5. **Multiple Attachment Retrieval:** `AttachmentController.GetImagePath` only retrieves the first attachment associated with a complaint.

