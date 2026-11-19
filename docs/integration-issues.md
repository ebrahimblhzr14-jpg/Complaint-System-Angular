# Backend Integration Issues & Frontend Workarounds

This document outlines all quirks, route anomalies, and integration caveats discovered during reverse engineering of the ASP.NET Core backend (`ComplainsSystemAPI`).

---

## 1. Route Path Typo and Double Colons (`::int`)
- **Discovered In:**
  - `AttachmentController`: `[HttpPost("Uploade/{complainId::int}")]` and `[HttpGet("GetImagePath/{complainID::int}")]`
  - `FeedbackController`: `[HttpGet("FindBy{complaintId::int}")]`
- **Issue:**
  - Route attributes contain a double colon `::int` rather than standard ASP.NET route constraint `{id:int}`.
  - Furthermore, `AttachmentController` spells `Uploade` with a trailing `e`.
  - In `FeedbackController`, there is no slash between `FindBy` and the parameter (`FindBy{complaintId::int}`).
- **Frontend Safe Workaround:**
  The frontend API client calls the exact URL pattern expected by the backend router:
  - Attachments upload: `/api/Attachment/Uploade/${complaintId}`
  - Attachments fetch: `/api/Attachment/GetImagePath/${complaintId}`
  - Feedback fetch: `/api/Feedback/FindBy${complaintId}`

---

## 2. Inverted Validation Check in `AttachmentController.SaveImageAsync`
- **Discovered In:** `backend/ComplainsSystemAPI/Controllers/AttachmentController.cs:27`
- **Code:**
  ```csharp
  if (ModelState.IsValid)
  {
      return BadRequest();
  }
  ```
- **Issue:**
  The controller checks `if (ModelState.IsValid) return BadRequest();`. This inverted logic causes valid model states to return HTTP 400 Bad Request!
- **Frontend Safe Handling:**
  In compliance with the Backend Protection Rule (Backend is Read-Only), the frontend documents this limitation. When file upload returns 400 despite conforming payloads, the frontend displays an informative notification informing the operator of the backend controller condition without crashing the application.

---

## 3. Missing Route Parameter in Method Signatures (Query String Binding)
- **Discovered In:**
  - `ComplaintCommentsController.Delete(int complaintId, int commentId)`: Route is `[HttpDelete("{commentId:int}")]`. Since `complaintId` is in the signature but omitted from the route template, ASP.NET Core expects `complaintId` via Query String (`?complaintId=X`).
  - `FeedbackController.GetById(int complaintId, int feedbackId)`: Route is `[HttpGet("FindByFeedID{feedbackId:int}")]`. `complaintId` must be passed as query parameter `?complaintId=X`.
  - `FeedbackController.Update(int complaintId, int feedbackId, ...)`: Route is `[HttpPut("Update/{feedbackId:int}")]`. `complaintId` must be passed as query parameter `?complaintId=X`.
- **Frontend Safe Workaround:**
  The frontend services explicitly format these requests with query parameters:
  - `DELETE /api/ComplaintComments/${commentId}?complaintId=${complaintId}`
  - `GET /api/Feedback/FindByFeedID${feedbackId}?complaintId=${complaintId}`
  - `PUT /api/Feedback/Update/${feedbackId}?complaintId=${complaintId}`

---

## 4. Rate Limiting Aggressiveness
- **Discovered In:** `ComplainsSystemAPI/Program.cs`
  - `GeneralApiLimiter`: 5 calls / 1 minute per IP/UserId.
  - `CreateInApiLimiter`: 3 calls / 3 minutes per IP/UserId.
  - `SingInLimiter`: 1 call / 15 minutes per IP.
- **Frontend Safe Handling:**
  - Aggressive polling or duplicate requests will quickly trigger `429 Too Many Requests`.
  - Frontend services cache non-volatile reference data (`Categories`, `Priorities`, `Statuses`) and prevent redundant parallel network calls.
  - A central HTTP error interceptor specifically captures HTTP 429 and displays a friendly user-facing cooldown message with countdown guidance.

---

## 5. Missing CRUD Controllers
- **Departments:**
  - Backend has `DepartmentsRepository` and `DepartmentService`, but `ComplainsSystemAPI` does not expose a `DepartmentsController`.
  - The frontend marks Department CRUD as unsupported and only integrates `api/Users/PutDept?UserId=...&DepID=...` where exposed.
- **Roles:**
  - No `RolesController` exists.
  - Roles are treated as static enum tokens (`User` = 1, `Admin` = 2, `SuperAdmin` = 3) throughout the frontend.

---

## 6. History Access Restricted to SuperAdmin Only
- **Discovered In:** `ComplaintHistoryController` has `[Authorize(Roles = "SuperAdmin")]`.
- **Frontend Handling:**
  - Activity timeline tab in Complaint Details will only invoke `/api/ComplaintHistory` if the logged-in user has the `SuperAdmin` role.
  - For `Admin` and `User`, a status progression indicator derived from the complaint model (`CreatedAt`, `UpdatedAt`, `ResolvedAt`, `ClosedAt`) is displayed instead of triggering a 403 error.

