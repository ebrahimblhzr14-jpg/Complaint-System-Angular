import { Injectable, signal, computed, effect } from '@angular/core';

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

export const DICTIONARY: Translations = {
  // Common & App Shell
  brandName: { ar: 'شكوى', en: 'Shakowa' },
  brandFullName: { ar: 'شكوى • نظام إدارة الشكاوى', en: 'Shakowa • Complaint Management System' },
  appName: { ar: 'نظام إدارة الشكاوى', en: 'Complaint Management System' },
  appSubtitle: { ar: 'بوابة المتابعة والإشراف الذكية', en: 'Smart Monitoring & Supervision Portal' },
  complaintManagement: { ar: 'نظام الشكاوى', en: 'Complaint Management' },
  footerText: { ar: 'نظام إدارة الشكاوى المتقدم', en: 'Advanced Complaint Management System' },
  toggleSidebar: { ar: 'طي / توسيع القائمة', en: 'Toggle Sidebar' },
  loggedInAs: { ar: 'تم تسجيل الدخول كـ', en: 'Signed in as' },
  dashboard: { ar: 'لوحة المؤشرات', en: 'Dashboard' },
  complaints: { ar: 'الشكاوى', en: 'Complaints' },
  newComplaint: { ar: 'تقديم شكوى جديدة', en: 'New Complaint' },
  myComplaints: { ar: 'شكاواي', en: 'My Complaints' },
  allComplaints: { ar: 'كل الشكاوى', en: 'All Complaints' },
  categories: { ar: 'التصنيفات', en: 'Categories' },
  priorities: { ar: 'الأولويات', en: 'Priorities' },
  statuses: { ar: 'الحالات', en: 'Statuses' },
  users: { ar: 'إدارة المستخدمين', en: 'Users Management' },
  settings: { ar: 'الإعدادات', en: 'Settings' },
  profile: { ar: 'الملف الشخصي', en: 'Profile' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout' },
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  register: { ar: 'إنشاء حساب جديد', en: 'Register Account' },
  welcome: { ar: 'مرحباً بك', en: 'Welcome' },
  search: { ar: 'بحث...', en: 'Search...' },
  actions: { ar: 'الإجراءات', en: 'Actions' },
  filter: { ar: 'تصفية', en: 'Filter' },
  all: { ar: 'الكل', en: 'All' },
  save: { ar: 'حفظ', en: 'Save' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  delete: { ar: 'حذف', en: 'Delete' },
  edit: { ar: 'تعديل', en: 'Edit' },
  view: { ar: 'عرض', en: 'View' },
  confirm: { ar: 'تأكيد', en: 'Confirm' },
  back: { ar: 'رجوع', en: 'Back' },
  refresh: { ar: 'تحديث', en: 'Refresh' },
  loading: { ar: 'جارٍ التحميل...', en: 'Loading...' },
  noData: { ar: 'لا توجد بيانات متوفرة', en: 'No data available' },
  active: { ar: 'نشط', en: 'Active' },
  inactive: { ar: 'غير نشط', en: 'Inactive' },
  status: { ar: 'الحالة', en: 'Status' },
  priority: { ar: 'الأولوية', en: 'Priority' },
  category: { ar: 'التصنيف', en: 'Category' },
  department: { ar: 'القسم', en: 'Department' },
  createdAt: { ar: 'تاريخ الإنشاء', en: 'Created Date' },
  updatedAt: { ar: 'آخر تحديث', en: 'Last Updated' },
  close: { ar: 'إغلاق', en: 'Close' },
  retry: { ar: 'إعادة المحاولة', en: 'Retry' },
  name: { ar: 'الاسم', en: 'Name' },
  description: { ar: 'الوصف', en: 'Description' },
  level: { ar: 'المستوى (رقم)', en: 'Level (Number)' },
  activate: { ar: 'تفعيل', en: 'Activate' },
  deactivate: { ar: 'تعطيل', en: 'Deactivate' },
  user: { ar: 'المستخدم', en: 'User' },
  action: { ar: 'إجراء', en: 'Action' },
  optional: { ar: 'اختياري', en: 'Optional' },
  passwordMinLengthWarning: { ar: 'يجب أن تحتوي كلمة المرور على 8 خانات على الأقل', en: 'Password must be at least 8 characters' },

  // Themes & UI Controls
  themeLight: { ar: 'الوضع الفاتح', en: 'Light Mode' },
  themeDark: { ar: 'الوضع الداكن', en: 'Dark Mode' },
  themeToggle: { ar: 'تبديل المظهر (فاتح / داكن)', en: 'Toggle Theme (Light / Dark)' },
  switchToEnglish: { ar: 'التحويل إلى الإنجليزية', en: 'Switch to English' },
  switchToArabic: { ar: 'التحويل إلى العربية', en: 'Switch to Arabic' },

  // Roles
  roleSuperAdmin: { ar: 'مدير نظام متقدم (SuperAdmin)', en: 'Super Administrator' },
  roleAdmin: { ar: 'مدير تشغيلي (Admin)', en: 'Administrator' },
  roleCitizen: { ar: 'مقدم شكاوى (Citizen)', en: 'Complainant / Citizen' },
  roleUserLabel: { ar: 'User (مستخدم عادي)', en: 'User (Standard)' },
  roleAdminLabel: { ar: 'Admin (مدير تشغيلي)', en: 'Admin (Operations Manager)' },
  roleSuperAdminLabel: { ar: 'SuperAdmin (مدير نظام متقدم)', en: 'SuperAdmin (System Administrator)' },

  // Auth - Login & Register
  email: { ar: 'البريد الإلكتروني', en: 'Email Address' },
  password: { ar: 'كلمة المرور', en: 'Password' },
  confirmPassword: { ar: 'تأكيد كلمة المرور', en: 'Confirm Password' },
  fullName: { ar: 'الاسم الكامل', en: 'Full Name' },
  phone: { ar: 'رقم الهاتف', en: 'Phone Number' },
  role: { ar: 'الدور الوظيفي', en: 'Role' },
  rememberMe: { ar: 'تذكرني', en: 'Remember me' },
  signInDesc: { ar: 'أدخل بيانات اعتمادك للوصول إلى النظام', en: 'Enter your credentials to access the system' },
  signUpDesc: { ar: 'سجل حسابك لتقديم ومتابعة الشكاوى', en: 'Register your account to submit and track complaints' },
  alreadyHaveAccount: { ar: 'لديك حساب بالفعل؟', en: 'Already have an account?' },
  dontHaveAccount: { ar: 'ليس لديك حساب؟', en: 'Don\'t have an account?' },
  changePassword: { ar: 'تغيير كلمة المرور', en: 'Change Password' },
  currentPassword: { ar: 'كلمة المرور الحالية', en: 'Current Password' },
  newPassword: { ar: 'كلمة المرور الجديدة', en: 'New Password' },
  heroLoginTitle: { ar: 'منظومة رقمية متكاملة لخدمة المستفيدين', en: 'Integrated Digital Platform for Beneficiaries' },
  heroLoginSubtitle: { ar: 'إدارة متطورة، شفافية، واستجابة سريعة لكافة البلاغات والشكاوى', en: 'Advanced management, transparency, and rapid response to all reports and complaints' },
  heroLoginDesc: { ar: 'منصة مؤسسية حديثة لإدارة الشكاوى، متابعة مؤشرات الأداء، وتوزيع المهام بدقة عالية لضمان سرعة الاستجابة ورضا المستفيدين.', en: 'Modern enterprise platform to manage complaints, track key performance indicators, and dispatch tasks with high precision for fast response and beneficiary satisfaction.' },
  slaCommitmentRate: { ar: 'نسبة الالتزام بالمعالجة', en: 'SLA Resolution Rate' },
  avgResolutionTime: { ar: 'متوسط وقت المعالجة', en: 'Avg Resolution Time' },
  dataSecurityFeature: { ar: 'حماية وتشفير لكافة البيانات الحساسة', en: 'Full security and encryption for all sensitive data' },
  emailPlaceholder: { ar: 'user@example.com', en: 'user@example.com' },
  passwordPlaceholder: { ar: '••••••••', en: '••••••••' },
  namePlaceholder: { ar: 'الاسم الكامل', en: 'Your Full Name' },
  phonePlaceholder: { ar: '05xxxxxxxx أو +966...', en: '05xxxxxxxx or +966...' },
  showPassword: { ar: 'إظهار كلمة المرور', en: 'Show password' },
  hidePassword: { ar: 'إخفاء كلمة المرور', en: 'Hide password' },
  emailRequired: { ar: 'البريد الإلكتروني مطلوب', en: 'Email address is required' },
  emailInvalid: { ar: 'صيغة البريد الإلكتروني غير صحيحة', en: 'Please enter a valid email address' },
  passwordRequired: { ar: 'كلمة المرور مطلوبة', en: 'Password is required' },
  passwordMinLength: { ar: 'يجب أن تكون كلمة المرور 8 خانات على الأقل', en: 'Password must be at least 8 characters' },
  nameRequired: { ar: 'الاسم الكامل مطلوب', en: 'Full name is required' },
  nameMinLength: { ar: 'الاسم يجب أن يكون 3 أحرف على الأقل', en: 'Name must be at least 3 characters' },
  phoneRequired: { ar: 'رقم الهاتف مطلوب', en: 'Phone number is required' },
  phoneInvalid: { ar: 'رقم الهاتف يجب أن يتكون من 9 إلى 15 رقماً', en: 'Phone number must be between 9 and 15 digits' },
  confirmPasswordRequired: { ar: 'يرجى تأكيد كلمة المرور', en: 'Please confirm your password' },
  passwordsDoNotMatch: { ar: 'كلمات المرور غير متطابقة', en: 'Passwords do not match' },
  heroRegisterTitle: { ar: 'انضم لمنظومة الشكاوى والمقترحات', en: 'Join the Complaints and Suggestions System' },
  heroRegisterSubtitle: { ar: 'صوتك مسموع، وشكواك محل اهتمام ومتابعة مباشرة', en: 'Your voice is heard, and your complaints receive direct attention and tracking' },
  heroRegisterDesc: { ar: 'أنشئ حسابك خلال لحظات لتقديم بلاغاتك، إرفاق المستندات والصور، ومتابعة خطوات المعالجة خطوة بخطوة حتى الإغلاق النهائي.', en: 'Create your account in moments to submit reports, attach documents and images, and track processing steps until final resolution.' },
  registerFeatureRealtime: { ar: 'متابعة حالة الشكوى بشكل لحظي', en: 'Real-time complaint status tracking' },
  registerFeatureDirectComm: { ar: 'التواصل المباشر مع فرق المعالجة وإضافة التعليقات', en: 'Direct communication with resolution teams and adding comments' },
  registerFeatureEvaluation: { ar: 'تقييم جودة الخدمة بعد إغلاق البلاغ', en: 'Evaluate service quality upon complaint closure' },
  registerPortalBadge: { ar: 'بوابة تسجيل المستفيدين', en: 'Beneficiary Registration Portal' },

  // Dashboard
  dashboardSubtitle: { ar: 'مؤشرات الأداء وتحليل الشكاوى في الوقت الحقيقي', en: 'Real-time performance indicators and complaint analytics' },
  cooldownWaitTitle: { ar: 'يرجى الانتظار لحين انتهاء مهلة التهدئة', en: 'Please wait until cooldown expires' },
  refreshDataTitle: { ar: 'تحديث البيانات', en: 'Refresh Data' },
  dashboardUnauthorizedTitle: { ar: 'غير مصرح بالوصول للوحة المؤشرات', en: 'Dashboard Access Restricted' },
  dashboardUnauthorizedDesc: { ar: 'لوحة المؤشرات والتحليلات مخصصة لمديري النظام (Admin / SuperAdmin) فقط. يمكنك متابعة شكاواك الشخصية من قائمة الشكاوى.', en: 'The analytics dashboard is restricted to system administrators (Admin / SuperAdmin). You can track your complaints in the Complaints section.' },
  goToComplaints: { ar: 'الانتقال إلى قائمة الشكاوى', en: 'Go to Complaints List' },
  dashboardRateLimitWarnTitle: { ar: 'تنبيه: تم تجاوز الحد المسموح للطلبات', en: 'Notice: Request Limit Exceeded' },
  dashboardRateLimitWaitDesc: { ar: 'يرجى الانتظار حتى انتهاء فترة التهدئة لإعادة إرسال الطلبات للخادم.', en: 'Please wait until the cooldown period ends before sending new requests to the server.' },
  dashboardPartialLoadWarnTitle: { ar: 'تنبيه: تعذر تحميل بعض مؤشرات التحليل من الخادم', en: 'Notice: Unable to load some analytics from the server' },
  dashboardPartialLoadDesc: { ar: 'قد لا تتوفر بيانات الإحصائيات مؤقتاً نتيجة استعلامات الخادم. تم الحفاظ على استقرار الواجهة.', en: 'Statistical data may be temporarily unavailable due to server queries. UI stability is maintained.' },
  retryInSeconds: { ar: 'إعادة المحاولة', en: 'Retry' },
  noChartData: { ar: 'لا توجد بيانات كافية لعرض الرسم البياني', en: 'Not enough data to display chart' },
  noCategoryChartData: { ar: 'لا توجد بيانات كافية لعرض التصنيفات', en: 'Not enough data to display categories' },
  complaintsCountLabel: { ar: 'عدد الشكاوى', en: 'Number of Complaints' },
  totalComplaintsCount: { ar: 'إجمالي الشكاوى', en: 'Total Complaints' },
  pendingCount: { ar: 'قيد الانتظار', en: 'Pending' },
  inProgressCount: { ar: 'قيد المعالجة', en: 'In Progress' },
  resolvedCount: { ar: 'تم الحل', en: 'Resolved' },
  closedCount: { ar: 'مغلقة', en: 'Closed' },
  rejectedCount: { ar: 'مرفوضة', en: 'Rejected' },
  statusDescNew: { ar: 'شكوى جديدة بانتظار بدء المعالجة', en: 'New complaint awaiting initial review' },
  statusDescInProgress: { ar: 'الشكوى قيد المتابعة والعمل الفعلي عليها', en: 'Complaint is actively being processed' },
  statusDescResolved: { ar: 'تم التوصل إلى الحل وبانتظار الإغلاق النهائي', en: 'Solution reached, awaiting final closure' },
  statusDescClosed: { ar: 'تم إغلاق الشكوى والانتهاء منها بالكامل', en: 'Complaint has been resolved and closed' },
  statusDescRejected: { ar: 'تم رفض الشكوى لأسباب محددة وموضحة', en: 'Complaint has been rejected with justification' },
  statusWorkflowDesc: { ar: 'سير العمل: جديدة ➔ قيد المعالجة ➔ تم الحل ➔ مغلقة', en: 'Workflow: New ➔ In Progress ➔ Resolved ➔ Closed' },
  statusDistribution: { ar: 'توزيع الشكاوى حسب الحالة', en: 'Complaints by Status' },
  priorityDistribution: { ar: 'توزيع الشكاوى حسب الأولوية', en: 'Complaints by Priority' },
  categoryDistribution: { ar: 'توزيع الشكاوى حسب التصنيف', en: 'Complaints by Category' },
  quickStats: { ar: 'نظرة عامة على النظام', en: 'System Overview' },

  // Complaints Feature
  complaintsSubtitle: { ar: 'متابعة وإدارة حالات الشكاوى والإجراءات المتخذة عليها', en: 'Track and manage complaint statuses and actions taken' },
  allStatusesFilter: { ar: 'كل الحالات (الكل)', en: 'All Statuses' },
  allCategoriesFilter: { ar: 'كل التصنيفات (الكل)', en: 'All Categories' },
  refreshListTitle: { ar: 'تحديث القائمة', en: 'Refresh List' },
  noMatchingComplaintsTitle: { ar: 'لا توجد شكاوى مطابقة', en: 'No matching complaints found' },
  noMatchingComplaintsDesc: { ar: 'لم يتم العثور على أي شكاوى تطابق خيارات التصفية أو البحث الحالية.', en: 'No complaints match the current filter or search criteria.' },
  totalDisplayedComplaints: { ar: 'إجمالي الشكاوى المعروضة', en: 'Total complaints displayed' },
  realtimeUpdated: { ar: 'مُحدّث بالوقت الفعلي', en: 'Real-time updated' },
  newComplaintSubtitle: { ar: 'املأ النموذج بدقة لنتمكن من مراجعة المشكلة ومعالجتها في أسرع وقت', en: 'Fill in the form accurately so we can review and resolve the issue quickly' },
  complaintTitle: { ar: 'عنوان الشكوى', en: 'Complaint Title' },
  complaintTitlePlaceholder: { ar: 'مثال: انقطاع الخدمة أو خلل في النظام...', en: 'e.g., Service outage or system issue...' },
  complaintTitleRequired: { ar: 'عنوان الشكوى مطلوب', en: 'Complaint title is required' },
  selectCategoryDefault: { ar: 'اختر التصنيف المناسب', en: 'Select appropriate category' },
  categoryRequired: { ar: 'يرجى اختيار تصنيف الشكوى', en: 'Please select a complaint category' },
  selectPriorityDefault: { ar: 'اختر مستوى الأولوية', en: 'Select priority level' },
  priorityRequired: { ar: 'يرجى تحديد أولوية الشكوى', en: 'Please specify complaint priority' },
  complaintDescription: { ar: 'وصف الشكوى', en: 'Complaint Description' },
  complaintDescPlaceholder: { ar: 'يرجى كتابة تفاصيل الشكوى بدقة، موضحاً الزمان والمكان والتفاصيل المعنية...', en: 'Please write the details of the complaint accurately, indicating time, location, and relevant context...' },
  complaintDescRequired: { ar: 'وصف الشكوى مطلوب', en: 'Complaint description is required' },
  uploadAttachmentOptional: { ar: 'رفع مرفق (اختياري)', en: 'Upload Attachment (Optional)' },
  uploadAttachmentFormats: { ar: 'يمكنك إرفاق صورة توضيحية مع الشكوى (PNG, JPG, JPEG)', en: 'You can attach an explanatory image (PNG, JPG, JPEG)' },
  selectedFilePrefix: { ar: 'الملف المحدد:', en: 'Selected file:' },
  submitComplaint: { ar: 'إرسال الشكوى', en: 'Submit Complaint' },
  updateComplaint: { ar: 'تحديث الشكوى', en: 'Update Complaint' },

  // Complaint Details
  complaintNumberPrefix: { ar: 'شكوى رقم #', en: 'Complaint #' },
  submittedAtPrefix: { ar: 'تم التقديم:', en: 'Submitted:' },
  complaintDetails: { ar: 'تفاصيل الشكوى', en: 'Complaint Details' },
  commentsTab: { ar: 'التعليقات', en: 'Comments' },
  attachmentsTab: { ar: 'المرفقات', en: 'Attachments' },
  historyTab: { ar: 'سجل النشاطات', en: 'Activity Timeline' },
  feedbackTab: { ar: 'التقييم والملاحظات', en: 'Feedback & Rating' },
  noCommentsFound: { ar: 'لا توجد تعليقات حتى الآن. كن أول من يضيف تعليقاً!', en: 'No comments yet. Be the first to add a comment!' },
  deleteCommentTitle: { ar: 'حذف التعليق', en: 'Delete Comment' },
  deleteCommentConfirmMsg: { ar: 'هل أنت متأكد من رغبتك في حذف هذا التعليق؟', en: 'Are you sure you want to delete this comment?' },
  writeCommentPlaceholder: { ar: 'اكتب تعليقك هنا...', en: 'Write your comment here...' },
  sendComment: { ar: 'إرسال التعليق', en: 'Send Comment' },
  uploadNewAttachment: { ar: 'رفع مرفق جديد', en: 'Upload New Attachment' },
  uploadAttachmentBtn: { ar: 'رفع المرفق', en: 'Upload Attachment' },
  attachedPhotoHeader: { ar: 'الصورة المرفقة:', en: 'Attached Image:' },
  downloadPhoto: { ar: 'تحميل / فتح الصورة بحجم كامل', en: 'Download / View Full Image' },
  noAttachmentsFound: { ar: 'لا توجد مرفقات لهذه الشكوى', en: 'No attachments found for this complaint' },
  feedbackRatingPrompt: { ar: 'التقييم (1 - 5 نجوم) *', en: 'Rating (1 - 5 stars) *' },
  feedbackPlaceholderText: { ar: 'ما رأيك في سرعة وجودة معالجة الشكوى؟', en: 'How would you rate the speed and quality of complaint resolution?' },
  submitFeedbackBtn: { ar: 'إرسال التقييم', en: 'Submit Feedback' },
  noFeedbackFound: { ar: 'لم يتم تقديم تقييم بعد لهذه الشكوى', en: 'No feedback submitted yet for this complaint' },
  noAdditionalFeedbackNotes: { ar: 'لا توجد ملاحظات إضافية.', en: 'No additional notes provided.' },
  complaintStagesHeader: { ar: 'مراحل سير الشكوى:', en: 'Complaint Lifecycle Stages:' },
  stage1Created: { ar: '1. إنشاء الشكوى', en: '1. Created' },
  stage2Processing: { ar: '2. المعالجة والمتابعة', en: '2. In Progress' },
  stage3Resolved: { ar: '3. تم الحل', en: '3. Resolved' },
  stage4Closed: { ar: '4. إغلاق الشكوى', en: '4. Closed' },
  inFollowUpState: { ar: 'قيد المتابعة', en: 'In Follow-up' },
  notResolvedYetState: { ar: 'لم تُحل بعد', en: 'Not Resolved Yet' },
  openState: { ar: 'مفتوحة', en: 'Open' },
  adminDataSidebarHeader: { ar: 'بيانات الشكوى الإدارية', en: 'Administrative Information' },
  assignedTo: { ar: 'مُسندة إلى', en: 'Assigned To' },
  assignedBy: { ar: 'تم الإسناد بواسطة', en: 'Assigned By' },
  assignComplaint: { ar: 'إسناد الشكوى', en: 'Assign Complaint' },
  changeStatusPrompt: { ar: 'تغيير حالة الشكوى', en: 'Change Complaint Status' },
  selectStatus: { ar: 'اختر الحالة الجديدة', en: 'Select new status' },
  selectUser: { ar: 'اختر المستخدم', en: 'Select User' },
  selectEmployeePrompt: { ar: 'اختر الموظف لإسناد الشكوى إليه', en: 'Select employee to assign complaint' },
  assignDirectivesPlaceholder: { ar: 'ملاحظات وتوجيهات للموظف...', en: 'Notes and directives for employee...' },
  assignmentNotes: { ar: 'ملاحظات الإسناد', en: 'Assignment Notes' },
  complaintOwner: { ar: 'مقدم الشكوى', en: 'Complaint Submitter' },
  rating: { ar: 'التقييم', en: 'Rating' },

  // System-defined Status Names
  pending: { ar: 'جديدة / قيد الانتظار', en: 'Pending' },
  inProgress: { ar: 'قيد المعالجة', en: 'In Progress' },
  resolved: { ar: 'تم الحل', en: 'Resolved' },
  closed: { ar: 'مغلقة', en: 'Closed' },
  rejected: { ar: 'مرفوضة', en: 'Rejected' },
  statusUnknown: { ar: 'غير محدد', en: 'Unspecified' },

  // System-defined Priorities
  priorityLow: { ar: 'منخفضة', en: 'Low' },
  priorityMedium: { ar: 'متوسطة', en: 'Medium' },
  priorityHigh: { ar: 'عالية', en: 'High' },
  priorityCritical: { ar: 'حرجة', en: 'Critical' },
  priorityNormal: { ar: 'عادي', en: 'Normal' },
  importanceLevelPrefix: { ar: 'مستوى الأهمية:', en: 'Priority Level:' },

  // System-defined Categories
  categoryGeneral: { ar: 'شكاوى عامة', en: 'General Complaints' },
  categoryAdmin: { ar: 'خدمات إدارية', en: 'Administrative Services' },
  categoryTech: { ar: 'خدمات فنية', en: 'Technical Services' },
  departmentGeneral: { ar: 'القسم العام', en: 'General Department' },

  // Admin Features - Categories
  categoriesManagementSubtitle: { ar: 'إدارة تصنيفات الشكاوى وتفعيلها لتسهيل توجيه البلاغات', en: 'Manage complaint categories and activation for efficient routing' },
  addCategory: { ar: 'إضافة تصنيف', en: 'Add Category' },
  editCategory: { ar: 'تعديل التصنيف', en: 'Edit Category' },
  noCategoriesTitle: { ar: 'لا توجد تصنيفات', en: 'No Categories' },
  noCategoriesDesc: { ar: 'لم يتم إنشاء أي تصنيفات للشكاوى حتى الآن.', en: 'No complaint categories have been created yet.' },
  categoryNameRequired: { ar: 'اسم التصنيف مطلوب', en: 'Category name is required' },

  // Admin Features - Priorities
  prioritiesManagementSubtitle: { ar: 'تحديد مستويات الأهمية والاستجابة للشكاوى والبلاغات', en: 'Define severity and response SLA levels for complaints' },
  addPriority: { ar: 'إضافة أولوية', en: 'Add Priority' },
  editPriority: { ar: 'تعديل الأولوية', en: 'Edit Priority' },
  noPrioritiesTitle: { ar: 'لا توجد أولويات', en: 'No Priorities' },
  noPrioritiesDesc: { ar: 'لم يتم إدخال مستويات أولوية في النظام بعد.', en: 'No priority levels have been configured yet.' },
  priorityNameRequired: { ar: 'اسم الأولوية مطلوب', en: 'Priority name is required' },
  priorityLevelRequired: { ar: 'مستوى الأولوية مطلوب (رقم بين 1 و 10)', en: 'Priority level is required (number between 1 and 10)' },

  // Admin Features - Statuses
  statusesManagementSubtitle: { ar: 'دورة حياة الشكاوى والمراحل التي تمر بها حتى الإغلاق', en: 'Complaint lifecycle stages and workflow from open to close' },
  addStatus: { ar: 'إضافة حالة', en: 'Add Status' },
  editStatus: { ar: 'تعديل الحالة', en: 'Edit Status' },
  noStatusesTitle: { ar: 'لا توجد حالات', en: 'No Statuses' },
  noStatusesDesc: { ar: 'لم يتم إدخال حالات للشكاوى في النظام.', en: 'No complaint statuses have been configured yet.' },
  statusNameRequired: { ar: 'اسم الحالة مطلوب', en: 'Status name is required' },
  badgePreviewColumn: { ar: 'الشارة (المعاينة)', en: 'Badge (Preview)' },

  // Admin Features - Users
  usersManagementSubtitle: { ar: 'إدارة الحسابات، الصلاحيات، وحالات تفعيل المستخدمين في النظام', en: 'Manage user accounts, roles, permissions, and activation states' },
  searchUsersPlaceholder: { ar: 'البحث بالاسم أو البريد الإلكتروني...', en: 'Search by name or email address...' },
  addUser: { ar: 'إضافة مستخدم جديد', en: 'Add New User' },
  editUser: { ar: 'تعديل بيانات المستخدم', en: 'Edit User' },
  activateUser: { ar: 'تفعيل الحساب', en: 'Activate Account' },
  deactivateUser: { ar: 'تعطيل الحساب', en: 'Deactivate Account' },
  resetUserPassword: { ar: 'إعادة تعيين كلمة المرور', en: 'Reset Password' },
  resetPasswordForUserPrefix: { ar: 'للمستخدم:', en: 'For user:' },
  newPasswordRequiredMin: { ar: 'كلمة المرور الجديدة (8 خانات على الأقل) *', en: 'New Password (min 8 characters) *' },
  unauthorizedUsersTitle: { ar: 'وصول محظور', en: 'Access Forbidden' },
  unauthorizedUsersDesc: { ar: 'صفحة إدارة المستخدمين مخصصة لمدير النظام الأعلى (SuperAdmin) فقط.', en: 'The user management page is strictly restricted to Super Administrators.' },
  failedToLoadUsersTitle: { ar: 'تعذر تحميل المستخدمين', en: 'Failed to load users' },
  noUsersFoundTitle: { ar: 'لا يوجد مستخدمون', en: 'No users found' },
  noUsersFoundDesc: { ar: 'لم يتم العثور على أي حسابات مطابقة لمعايير البحث.', en: 'No accounts match the specified search criteria.' },
  confirmActionUserTitle: { ar: 'تأكيد الإجراء', en: 'Confirm Action' },

  // Profile
  profileSubtitle: { ar: 'إدارة بيانات الحساب الشخصي وتغيير كلمة المرور', en: 'Manage personal profile data and change account password' },
  accountIdPrefix: { ar: 'معرّف الحساب: #', en: 'Account ID: #' },
  currentPasswordRequiredMsg: { ar: 'كلمة المرور الحالية مطلوبة', en: 'Current password is required' },
  passwordRequirementsMsg: { ar: 'يجب أن تكون كلمة المرور 8 خانات على الأقل', en: 'Password must be at least 8 characters' },

  // Toast & Notifications
  toastSuccess: { ar: 'نجاح', en: 'Success' },
  toastError: { ar: 'خطأ', en: 'Error' },
  toastWarning: { ar: 'تنبيه', en: 'Warning' },
  toastInfo: { ar: 'معلومة', en: 'Information' },
  rateLimitAlertTitle: { ar: 'تنبيه معدل الطلبات (429)', en: 'Rate Limit Notice (429)' },
  rateLimitAlertMsg: { ar: 'تم تجاوز الحد الأقصى للطلبات المسموحة مؤقتاً. يرجى الانتظار بضع ثوانٍ ثم إعادة المحاولة.', en: 'Rate limit exceeded temporarily. Please wait a few seconds and try again.' },
  lookupsLoadError: { ar: 'تعذر تحميل بيانات التصنيفات والأولويات مؤقتاً.', en: 'Temporarily unable to load categories and priorities.' },
  forbiddenAlertTitle: { ar: 'ممنوع الوصول (403)', en: 'Access Forbidden (403)' },
  forbiddenAlertMsg: { ar: 'ليس لديك صلاحية كافية لتنفيذ هذا الإجراء.', en: 'You do not have permission to perform this action.' },
  backendUnreachableTitle: { ar: 'فشل الاتصال بالخادم', en: 'Server Connection Failed' },
  backendUnreachableMsg: { ar: 'تعذر الاتصال بخادم النظام (Backend). يرجى التأكد من تشغيل الخادم على https://localhost:7043.', en: 'Unable to connect to the backend server. Please verify the API is running on https://localhost:7043.' },
  unauthorizedMsg: { ar: 'غير مصرح لك بالوصول إلى هذا المورد', en: 'You are unauthorized to access this resource' },
  forbiddenMsg: { ar: 'ليس لديك الصلاحيات الكافية لتنفيذ هذا الإجراء', en: 'You do not have permission to perform this action' },
  rateLimitedMsg: { ar: 'تم تجاوز الحد المسموح للطلبات. يُرجى الانتظار دقيقة والمحاولة مجدداً.', en: 'Rate limit exceeded. Please wait a minute and try again.' },
  serverErrorMsg: { ar: 'حدث خطأ في الاتصال بالخادم. حاول لاحقاً.', en: 'Server connection error. Please try again later.' },
  successSaved: { ar: 'تم حفظ البيانات بنجاح', en: 'Data saved successfully' },
  deleteComplaint: { ar: 'حذف الشكوى', en: 'Delete Complaint' },
  deleteComplaintTitle: { ar: 'تأكيد حذف الشكوى', en: 'Confirm Complaint Deletion' },
  deleteComplaintConfirmMsg: { ar: 'هل أنت متأكد من رغبتك في حذف هذه الشكوى؟ سيتم إزالتها من قائمة الشكاوى النشطة.', en: 'Are you sure you want to delete this complaint? It will be removed from active complaints.' },
  deleteComplaintSuccess: { ar: 'تم حذف الشكوى بنجاح', en: 'Complaint deleted successfully' },
  deleteComplaintError: { ar: 'تعذر حذف الشكوى', en: 'Failed to delete complaint' },
  confirmDelete: { ar: 'هل أنت متأكد من رغبتك في الحذف؟ لا يمكن التراجع عن هذا الإجراء.', en: 'Are you sure you want to delete this? This action cannot be undone.' },
  defaultEmptyTitle: { ar: 'لا توجد عناصر حالياً', en: 'No items currently available' },
  defaultEmptyDesc: { ar: 'لم يتم العثور على أي بيانات مطابقة للمعايير المحددة.', en: 'No matching data was found for the specified criteria.' },

  // Dynamic Detail Notifications
  complaintCreateError: { ar: 'تعذر إنشاء الشكوى. يرجى المحاولة مرة أخرى.', en: 'Unable to create the complaint. Please try again.' },
  loadComplaintError: { ar: 'تعذر جلب تفاصيل الشكوى أو ليس لديك الصلاحية لعرضها.', en: 'Unable to load complaint details or unauthorized access.' },
  loadUsersError: { ar: 'تعذر جلب قائمة المستخدمين من الخادم (500).', en: 'Failed to retrieve users list from server (500).' },
  commentAdded: { ar: 'تمت إضافة التعليق بنجاح', en: 'Comment added successfully' },
  commentAddError: { ar: 'تعذر إضافة التعليق حالياً', en: 'Unable to add comment at this time' },
  commentDeleted: { ar: 'تم حذف التعليق', en: 'Comment deleted successfully' },
  commentDeleteError: { ar: 'تعذر حذف التعليق', en: 'Unable to delete comment' },
  photoUploaded: { ar: 'تم رفع الصورة بنجاح', en: 'Image uploaded successfully' },
  feedbackSaved: { ar: 'شكراً لتقييمك، تم حفظ التقييم بنجاح', en: 'Thank you for your feedback! It was saved successfully.' },
  feedbackSubmitError: { ar: 'تعذر إرسال التقييم', en: 'Failed to submit feedback' },
  statusUpdateSuccess: { ar: 'تم تحديث حالة الشكوى بنجاح', en: 'Complaint status updated successfully' },
  statusUpdateFailed: { ar: 'تعذر تحديث حالة الشكوى', en: 'Failed to update complaint status' },
  complaintAssigned: { ar: 'تم إسناد الشكوى بنجاح', en: 'Complaint assigned successfully' },
  complaintAssignFailed: { ar: 'تعذر إسناد الشكوى', en: 'Failed to assign complaint' },

  // Badges & Notification dialogs (Popups & Dialogs)
  badgeSensitiveAction: { ar: 'إجراء حساس', en: 'Sensitive Action' },
  badgeConfirmAction: { ar: 'تأكيد الإجراء', en: 'Confirm Action' },
  badgeSuccess: { ar: 'اكتمل بنجاح', en: 'Completed Successfully' },
  badgeError: { ar: 'فشل العملية', en: 'Operation Failed' },
  badgeWarning: { ar: 'تنبيه للإنتباه', en: 'Attention Notice' },
  badgeInfo: { ar: 'معلومة للنظام', en: 'System Information' },
  badgeFeedback: { ar: 'تقييم الخدمة', en: 'Service Rating' },
  badgeAttachment: { ar: 'معاينة المرفق', en: 'Attachment Preview' },
  badgeSyncing: { ar: 'جاري المعالجة', en: 'Processing' },
  deletePermanentlyTitle: { ar: 'تأكيد الحذف النهائي', en: 'Confirm Permanent Deletion' },
  deletePermanentlyMsg: { ar: 'سيتم حذف هذا العنصر نهائياً من النظام، ولن تتمكن من استعادته مجدداً. هل أنت متأكد؟', en: 'This item will be permanently removed from the system and cannot be recovered. Are you sure?' },
  confirmDeleteBtn: { ar: 'تأكيد الحذف', en: 'Confirm Delete' },
  cancelActionBtn: { ar: 'إلغاء الأمر', en: 'Cancel' },
  confirmActionTitle: { ar: 'تأكيد تنفيذ الإجراء', en: 'Confirm Action' },
  operationSuccessTitle: { ar: 'تمت العملية بنجاح', en: 'Operation Completed' },
  unexpectedErrorTitle: { ar: 'حدث خطأ غير متوقع', en: 'An Unexpected Error Occurred' },
  incompleteDataTitle: { ar: 'البيانات غير مكتملة', en: 'Incomplete Data' },
  incompleteDataDesc: { ar: 'يرجى مراجعة واستكمال الحقول الإلزامية المطلوبة للمتابعة.', en: 'Please review and fill in all required fields to proceed.' },
  completeDataBtn: { ar: 'استكمال البيانات', en: 'Complete Data' },
  retryNowBtn: { ar: 'إعادة المحاولة الآن', en: 'Retry Now' },
  notFoundTitle: { ar: 'العنصر غير موجود (404)', en: 'Not Found (404)' },
  notFoundMsg: { ar: 'تعذر العثور على العنصر أو الصفحة المطلوبة.', en: 'The requested resource or page was not found.' },
  serverErrorTitle: { ar: 'خطأ في الخادم (500)', en: 'Server Error (500)' },
  loadingSyncTitle: { ar: 'جاري معالجة وتحديث البيانات...', en: 'Processing and synchronizing data...' },
  loadingSyncDesc: { ar: 'يرجى الانتظار قليلاً لحين اكتمال مزامنة وتحديث البيانات مع الخادم.', en: 'Please wait a moment while the system synchronizes data with the server.' },
  downloadAttachmentBtn: { ar: 'تحميل المرفق', en: 'Download Attachment' },
  deleteAttachmentBtn: { ar: 'حذف المرفق', en: 'Delete Attachment' },
  deleteAttachmentConfirmMsg: { ar: 'هل أنت متأكد من رغبتك في حذف هذا المرفق نهائياً؟', en: 'Are you sure you want to delete this attachment permanently?' },
  attachmentDeletedSuccess: { ar: 'تم حذف المرفق بنجاح', en: 'Attachment deleted successfully' },
  feedbackDialogTitle: { ar: 'تقييم تجربة معالجة الشكوى', en: 'Rate Complaint Resolution Experience' },
  feedbackDialogDesc: { ar: 'شاركنا تقييمك لمستوى الخدمة المقدمة لمساعدتنا في تحسين جودة الأداء.', en: 'Share your feedback regarding the resolution quality to help us improve our services.' },
  sendFeedbackBtn: { ar: 'إرسال التقييم', en: 'Submit Rating' },

  // Missing Keys Audited & Added
  loginSuccess: { ar: 'تم تسجيل الدخول بنجاح', en: 'Logged in successfully' },
  welcomeUser: { ar: 'أهلاً بك في نظام شكوى', en: 'Welcome to Shakowa System' },
  registerSuccess: { ar: 'تم إنشاء الحساب بنجاح', en: 'Account created successfully' },
  uploadAttachment: { ar: 'رفع مرفق', en: 'Upload Attachment' },
  attachmentUploadedSuccess: { ar: 'تم رفع المرفق بنجاح', en: 'Attachment uploaded successfully' },
  updateStatus: { ar: 'تحديث الحالة', en: 'Update Status' },
  addComment: { ar: 'إضافة تعليق', en: 'Add Comment' },
  writeComment: { ar: 'اكتب تعليقك هنا...', en: 'Write your comment here...' },
  noAttachments: { ar: 'لا توجد مرفقات لهذه الشكوى', en: 'No attachments found for this complaint' },
  feedbackComment: { ar: 'ملاحظات التقييم', en: 'Feedback Comments' },
  confirmAction: { ar: 'تأكيد الإجراء', en: 'Confirm Action' },

  // Enhanced Feedback Workflow Keys
  feedbackRatingRequired: { ar: 'يرجى تحديد التقييم بالنجوم (1 إلى 5)', en: 'Please select a star rating (1 to 5)' },
  feedbackEmptyTitle: { ar: 'لا توجد تقييمات مسجلة', en: 'No Feedback Records' },
  feedbackEmptyDesc: { ar: 'لم يتم إضافة أي تقييم أو ملاحظة لهذه الشكوى حتى الآن.', en: 'No ratings or feedback notes have been submitted for this complaint yet.' },
  feedbackListTitle: { ar: 'سجل تقييمات الشكوى', en: 'Complaint Feedback History' },
  feedbackEditBtn: { ar: 'تعديل التقييم', en: 'Edit Feedback' },
  feedbackCancelEditBtn: { ar: 'إلغاء التعديل', en: 'Cancel' },
  feedbackUpdateSuccess: { ar: 'تم تحديث التقييم بنجاح', en: 'Feedback updated successfully' },
  feedbackSaveBtn: { ar: 'حفظ التعديل', en: 'Save Changes' },
  feedbackLoadError: { ar: 'تعذر تحميل التقييمات', en: 'Failed to load feedback records' },
  starRatingAria: { ar: 'تقييم {0} من 5 نجوم', en: 'Rating {0} out of 5 stars' },
  starsSelectLabel: { ar: 'اختر تقييمك بالنجوم:', en: 'Select your star rating:' },
  star1Label: { ar: 'نجمة واحدة - سيء جداً', en: '1 Star - Very Poor' },
  star2Label: { ar: 'نجمتان - غير مرضٍ', en: '2 Stars - Poor' },
  star3Label: { ar: '3 نجوم - مقبول', en: '3 Stars - Fair' },
  star4Label: { ar: '4 نجوم - جيد', en: '4 Stars - Good' },
  star5Label: { ar: '5 نجوم - ممتاز', en: '5 Stars - Excellent' },
  addFeedbackPrompt: { ar: 'إضافة تقييم جديد للشكوى', en: 'Add New Feedback' },
  feedbackCharsRemaining: { ar: 'الرموز المتبقية:', en: 'Characters remaining:' },
  copyRefNumber: { ar: 'نسخ رقم الشكوى', en: 'Copy Complaint Reference' },
  refNumberCopied: { ar: 'تم نسخ رقم الشكوى بنجاح', en: 'Complaint reference copied to clipboard' },
  printReport: { ar: 'طباعة التقرير', en: 'Print Report' },
  complaintProgressTimeline: { ar: 'مسار معالجة الشكوى', en: 'Complaint Progress Lifecycle' },
  timelineNew: { ar: 'تقديم الشكوى', en: 'Complaint Submitted' },
  timelineInProgress: { ar: 'بدء المعالجة', en: 'In Resolution' },
  timelineResolved: { ar: 'تم حل الشكوى', en: 'Resolved' },
  timelineClosed: { ar: 'إغلاق الشكوى', en: 'Closed' }
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly STORAGE_KEY = 'cms_lang';

  // Arabic is default
  currentLang = signal<Language>(
    (localStorage.getItem(this.STORAGE_KEY) as Language) || 'ar'
  );

  direction = computed<Direction>(() => (this.currentLang() === 'ar' ? 'rtl' : 'ltr'));

  constructor() {
    // Sync direction and lang attribute to document HTML
    effect(() => {
      const lang = this.currentLang();
      const dir = this.direction();
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
        document.documentElement.dir = dir;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, lang);
      }
    });
  }

  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
  }

  toggleLanguage(): void {
    this.setLanguage(this.currentLang() === 'ar' ? 'en' : 'ar');
  }

  translate(key: string): string {
    if (!key) return '';
    const entry = DICTIONARY[key];
    if (!entry) {
      // Prevent raw developer error keys from ever leaking to user notifications
      if (key.includes('Error') || key.includes('Failed')) {
        return this.currentLang() === 'ar'
          ? 'تعذر إتمام العملية. يرجى المحاولة مرة أخرى.'
          : 'Unable to complete the operation. Please try again.';
      }
      return key;
    }
    return entry[this.currentLang()] || key;
  }

  /**
   * Safe mapping for system-defined status labels based on stable statusId
   */
  translateStatus(statusId?: number, fallbackName?: string): string {
    const isEn = this.currentLang() === 'en';

    if (!isEn) {
      switch (statusId) {
        case 1:
          return 'جديدة';
        case 2:
          return 'قيد المعالجة';
        case 3:
          return 'مغلقة';
        case 4:
          return 'مرفوضة';
        case 5:
          return 'تم الحل';
        default:
          return fallbackName || this.translate('statusUnknown');
      }
    }

    switch (statusId) {
      case 1:
        return this.translate('pending');
      case 2:
        return this.translate('inProgress');
      case 3:
        return this.translate('closed');
      case 4:
        return this.translate('rejected');
      case 5:
        return this.translate('resolved');
      default:
        // Try fallback mapping by standard Arabic names if ID not provided
        if (fallbackName) {
          if (fallbackName.includes('جديدة') || fallbackName.includes('معلقة') || fallbackName.toLowerCase().includes('pending')) {
            return this.translate('pending');
          }
          if (fallbackName.includes('معالجة') || fallbackName.toLowerCase().includes('progress')) {
            return this.translate('inProgress');
          }
          if (fallbackName.includes('حل') || fallbackName.toLowerCase().includes('resolved')) {
            return this.translate('resolved');
          }
          if (fallbackName.includes('مغلق') || fallbackName.toLowerCase().includes('closed')) {
            return this.translate('closed');
          }
          if (fallbackName.includes('رفض') || fallbackName.toLowerCase().includes('reject')) {
            return this.translate('rejected');
          }
        }
        return fallbackName || this.translate('statusUnknown');
    }
  }

  /**
   * Provides a concise description for each status to guide user actions
   */
  getStatusDescription(statusId?: number): string {
    switch (statusId) {
      case 1:
        return this.translate('statusDescNew');
      case 2:
        return this.translate('statusDescInProgress');
      case 3:
        return this.translate('statusDescClosed');
      case 4:
        return this.translate('statusDescRejected');
      case 5:
        return this.translate('statusDescResolved');
      default:
        return '';
    }
  }

  /**
   * Safe mapping for system-defined priority labels based on level or ID
   */
  translatePriority(priorityId?: number, fallbackName?: string, level?: number): string {
    const isEn = this.currentLang() === 'en';
    if (!isEn) return fallbackName || this.translate('priorityNormal');

    const lvl = level ?? priorityId;
    switch (lvl) {
      case 1:
        return this.translate('priorityLow');
      case 2:
        return this.translate('priorityMedium');
      case 3:
        return this.translate('priorityHigh');
      case 4:
        return this.translate('priorityCritical');
      default:
        if (fallbackName) {
          if (fallbackName.includes('منخفض') || fallbackName.toLowerCase().includes('low')) return this.translate('priorityLow');
          if (fallbackName.includes('متوسط') || fallbackName.toLowerCase().includes('medium')) return this.translate('priorityMedium');
          if (fallbackName.includes('عال') || fallbackName.toLowerCase().includes('high')) return this.translate('priorityHigh');
          if (fallbackName.includes('حرج') || fallbackName.toLowerCase().includes('critical')) return this.translate('priorityCritical');
        }
        return fallbackName || this.translate('priorityNormal');
    }
  }

  /**
   * Safe mapping for system-defined seeded category labels based on ID
   */
  translateCategory(categoryId?: number, fallbackName?: string): string {
    const isEn = this.currentLang() === 'en';
    if (!isEn) return fallbackName || this.translate('categoryGeneral');

    switch (categoryId) {
      case 1:
        return this.translate('categoryGeneral');
      case 2:
        return this.translate('categoryAdmin');
      case 3:
        return this.translate('categoryTech');
      default:
        if (fallbackName) {
          if (fallbackName.includes('عام') || fallbackName.toLowerCase().includes('general')) return this.translate('categoryGeneral');
          if (fallbackName.includes('إدار') || fallbackName.toLowerCase().includes('admin')) return this.translate('categoryAdmin');
          if (fallbackName.includes('فن') || fallbackName.toLowerCase().includes('tech')) return this.translate('categoryTech');
        }
        return fallbackName || this.translate('categoryGeneral');
    }
  }

  /**
   * Safe mapping for system user roles
   */
  translateRole(role?: string): string {
    if (!role) return '';
    const r = role.trim().toLowerCase();
    if (r === 'superadmin') return this.translate('roleSuperAdmin');
    if (r === 'admin') return this.translate('roleAdmin');
    if (r === 'user' || r === 'citizen') return this.translate('roleCitizen');
    return role;
  }
}
