# System Authorization & Access Matrix

## 1. Roles Definition
The backend enforces three distinct roles in database, JWT claims, and controller attributes:
1. **`SuperAdmin` (RoleId = 3):** Full system administrator with global view and write capabilities.
2. **`Admin` (RoleId = 2):** Operational manager handling status changes, category/priority/status configuration, and viewing dashboard metrics.
3. **`User` (RoleId = 1):** End-user (Citizen / Submitter) creating complaints, viewing their own complaints, commenting, attaching files, and providing feedback.

---

## 2. Endpoints Access Matrix

| Feature / Action | Endpoint | User (RoleId: 1) | Admin (RoleId: 2) | SuperAdmin (RoleId: 3) |
|---|---|:---:|:---:|:---:|
| **Authentication: Login** | `/api/Auth/login` | ✅ | ✅ | ✅ |
| **Authentication: Register (SingIn)** | `/api/Auth/SingIn` | ✅ (Creates Role 1) | ❌ | ❌ |
| **Authentication: Token Refresh** | `/api/Auth/refresh` | ✅ | ✅ | ✅ |
| **Authentication: Logout** | `/api/Auth/logout` | ✅ | ✅ | ✅ |
| **Complaints: List All** | `/api/Complaints/All` | ❌ (403) | ❌ (403)* | ✅ |
| **Complaints: List by User ID** | `/api/Complaints/AllByUserID/{id}` | ✅ (Own ID only) | ❌ (403) | ✅ |
| **Complaints: View Details** | `/api/Complaints/FindBy/{id}` | ✅ (Own complaint) | ✅ | ✅ |
| **Complaints: Create** | `/api/Complaints/Create` | ✅ | ✅ | ✅ |
| **Complaints: Update** | `/api/Complaints/Update/{id}` | ✅ (Own complaint) | ❌ (403) | ✅ |
| **Complaints: Assign** | `/api/Complaints/assign` | ❌ (403) | ❌ (403) | ✅ |
| **Complaints: Change Status** | `/api/Complaints/{id}/status` | ❌ (403) | ✅ | ✅ |
| **Dashboard: Summary & Charts** | `/api/Dashboard/*` | ❌ (403) | ✅ | ✅ |
| **Users: List All Users** | `/api/Users/All` | ❌ (403) | ❌ (403) | ✅ |
| **Users: View User Details** | `/api/Users/FindBy/{id}` | ✅ (Self only) | ❌ (403) | ✅ |
| **Users: Create User** | `/api/Users/Create` | ❌ (403) | ❌ (403) | ✅ |
| **Users: Update User** | `/api/Users/Update/{id}` | ✅ (Self only) | ❌ (403) | ✅ |
| **Users: Activate / Deactivate** | `/api/Users/{id}/*` | ❌ (403) | ❌ (403) | ✅ |
| **Users: Change Own Password** | `/api/Users/me/password` | ✅ | ✅ | ✅ |
| **Users: Admin Reset Password** | `/api/Users/{id}/password` | ❌ (403) | ❌ (403) | ✅ |
| **Categories: Read** | `/api/Categories/All` | ✅ | ✅ | ✅ |
| **Categories: Write / Toggle** | `/api/Categories/*` | ❌ (403) | ✅ | ✅ |
| **Priorities: Read** | `/api/Priorities/*` | ✅ (Public) | ✅ | ✅ |
| **Priorities: Write / Toggle** | `/api/Priorities/*` | ❌ (403) | ✅ | ✅ |
| **Statuses: Read** | `/api/Statuses/*` | ✅ (Public) | ✅ | ✅ |
| **Statuses: Write / Toggle** | `/api/Statuses/*` | ❌ (403) | ✅ | ✅ |
| **Comments: Read / Add** | `/api/ComplaintComments/*` | ✅ (Own complaint) | ✅ | ✅ |
| **Comments: Edit / Delete** | `/api/ComplaintComments/*` | ✅ (Author only) | ❌ | ✅ |
| **Attachments: Upload / View** | `/api/Attachment/*` | ✅ (Own complaint) | ✅ | ✅ |
| **Feedback: Read / Submit** | `/api/Feedback/*` | ✅ (Own complaint) | ✅ | ✅ |
| **History: View Activity Log** | `/api/ComplaintHistory` | ❌ (403) | ❌ (403) | ✅ |

*\*Note on Admin viewing complaints:* In `ComplaintsController`, `All` is restricted strictly to `[Authorize(Roles = "SuperAdmin")]`. Therefore, `Admin` users cannot call `/api/Complaints/All`. Admins view complaints assigned to them or by direct lookup (`/FindBy/{id}`). In the frontend, the UI navigation adapts dynamically to prevent Admins from triggering 403 on `/api/Complaints/All`.

