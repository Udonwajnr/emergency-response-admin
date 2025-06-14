// API endpoint constants
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    VERIFY_OTP: "/auth/verify-otp",
    RESEND_OTP: "/auth/resend-otp",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    PROFILE: "/auth/profile",
    UPLOAD_DOCUMENTS: "/upload-documents",
    PROFESSIONALS: "/auth/professionals",
  },

  // Users Management
  USERS: {
    LIST: "/users",
    DETAIL: (id) => `/users/${id}`,
    VERIFY: "/admin/verify-user",
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    REVIEW_DOCUMENT: "/admin/review-document",
  },

  // First Aid Guides
  FIRST_AID: {
    LIST: "/firstAidGuide",
    CREATE: "/firstAidGuide",
    DETAIL: (id) => `/firstAidGuide/${id}`,
    UPDATE: (id) => `/firstAidGuide/${id}`,
    DELETE: (id) => `/firstAidGuide/${id}`,
  },

  // Emergency Management
  EMERGENCY: {
    LIST: "/emergency",
    DETAIL: (id) => `/emergency/${id}`,
    RESOLVE: (id) => `/emergency/${id}/resolve`,
    DELETE: (id) => `/emergency/${id}`,
    USER_HISTORY: () => `/emergency/history`, //get hsitory acording to user
  },

  // Emergency Units
  EMERGENCY_UNITS: {
    LIST: "/emergency-units",
    DETAIL: (id) => `/emergency-units/${id}`,
    UPDATE: (id) => `/emergency-units/${id}`,
    DELETE: (id) => `/emergency-units/${id}`,
    VERIFY: "/admin/verify-user",
    AVAILABILITY: (id) => `/emergency-units/${id}/availability`,
    STATISTICS: "/emergency-units/statistics",
  },

  // Freelancers
  FREELANCERS: {
    LIST: "/freelancers",
    DETAIL: (id) => `/freelancers/${id}`,
  },
}
