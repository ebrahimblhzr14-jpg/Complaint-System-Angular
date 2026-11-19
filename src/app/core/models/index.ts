export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: 'User' | 'Admin' | 'SuperAdmin' | string;
  roleId: number;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  phone?: string;
  roleId: number;
  roleName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleId: number;
}

export interface UpdateUserDto {
  name: string;
  email: string;
  phone?: string;
  roleId: number;
  isActive: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AdminChangePasswordRequest {
  newPassword: string;
}

export interface ComplaintDto {
  id: number;
  userId: number;
  userName?: string;
  categoryId: number;
  categoryName?: string;
  departmentId?: number;
  departmentName?: string;
  statusId: number;
  statusName?: string;
  priorityId: number;
  priorityName?: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface CreateComplaintDto {
  categoryId: number;
  departmentId?: number | null;
  priorityId: number;
  title: string;
  description: string;
}

export interface UpdateComplaintDto {
  categoryId: number;
  departmentId?: number | null;
  priorityId: number;
  title: string;
  description: string;
}

export interface UpdateComplaintStatusDto {
  statusId: number;
}

export interface AssignmentDto {
  id: number;
  complaintId: number;
  assignedToUserId: number;
  assignedToUserName?: string;
  assignedByUserId: number;
  assignedByUserName?: string;
  assignedAt: string;
  unassignedAt?: string;
  notes?: string;
}

export interface CreateAssignmentDto {
  complaintId: number;
  assignedToUserId: number;
  notes?: string;
}

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface PriorityDto {
  id: number;
  name: string;
  level: number;
}

export interface CreatePriorityDto {
  name: string;
  level: number;
}

export interface UpdatePriorityDto {
  name: string;
  level: number;
}

export interface StatusDto {
  id: number;
  name: string;
}

export interface CreateStatusDto {
  name: string;
}

export interface UpdateStatusDto {
  name: string;
}

export interface CommentDto {
  id: number;
  complaintId: number;
  userId: number;
  userName?: string;
  comment: string;
  createdAt: string;
}

export interface CreateCommentDto {
  complaintId: number;
  comment: string;
}

export interface UpdateCommentDto {
  comment: string;
}

export interface AttachmentDto {
  id: number;
  complaintId: number;
  uploadedByUserId: number;
  uploadedByUserName?: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt: string;
}

export interface FeedbackDto {
  id: number;
  complaintId: number;
  userId: number;
  userName?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateFeedbackDto {
  complaintId: number;
  rating: number;
  comment?: string;
}

export interface UpdateFeedbackDto {
  rating: number;
  comment?: string;
}

export interface ComplaintHistoryDto {
  id: number;
  complaintId: number;
  userId?: number;
  action: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
  createdAt: string;
}

export interface ComplaintSummaryDto {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  closedComplaints: number;
  rejectedComplaints: number;
}

export interface ComplaintsByStatusDto {
  id: number;
  name: string;
  complaintCount: number;
}

export interface ComplaintsByPriorityDto {
  id: number;
  name: string;
  complaintCount: number;
}

export interface ComplaintsByCategoryDto {
  id: number;
  name: string;
  complaintCount: number;
}

