import api from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/api-endpoints"

export const userService = {
  // Get all users
  getUsers: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.USERS.LIST, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch users",
      }
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(API_ENDPOINTS.USERS.DETAIL(userId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch user",
      }
    }
  },

  // Verify user (admin action)
  verifyUser: async (userId, action) => {
    try {
      const response = await api.post(API_ENDPOINTS.USERS.VERIFY, { userId, action })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to verify user",
      }
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(API_ENDPOINTS.USERS.UPDATE(userId), userData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update user",
      }
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(API_ENDPOINTS.USERS.DELETE(userId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete user",
      }
    }
  },
}
