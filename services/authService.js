import api from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/api-endpoints"

export const authService = {
  // Register user
  register: async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      }
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      }
    }
  },

  // Verify OTP
  verifyOtp: async (email, otp) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "OTP verification failed",
      }
    }
  },

  // Resend OTP
  resendOtp: async (email) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.RESEND_OTP, { email })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to resend OTP",
      }
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send reset email",
      }
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.AUTH.RESET_PASSWORD}?token=${token}`, { password })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Password reset failed",
      }
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.PROFILE)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch profile",
      }
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put(API_ENDPOINTS.AUTH.PROFILE, profileData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update profile",
      }
    }
  },

  // Upload documents
  uploadDocuments: async (formData) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.UPLOAD_DOCUMENTS, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Document upload failed",
      }
    }
  },

  // Get professionals (freelancers and emergency units)
  getProfessionals: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.PROFESSIONALS)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch professionals",
      }
    }
  },
}
