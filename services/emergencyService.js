import api from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/api-endpoints"

export const emergencyService = {
  // Get all emergencies
  getEmergencies: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.EMERGENCY.LIST, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch emergencies",
      }
    }
  },

  // Get emergency by ID
  getEmergencyById: async (emergencyId) => {
    try {
      const response = await api.get(API_ENDPOINTS.EMERGENCY.DETAIL(emergencyId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch emergency details",
      }
    }
  },

  // Resolve emergency
  resolveEmergency: async (emergencyId) => {
    try {
      const response = await api.put(API_ENDPOINTS.EMERGENCY.RESOLVE(emergencyId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to resolve emergency",
      }
    }
  },

  // Delete emergency
  deleteEmergency: async (emergencyId) => {
    try {
      const response = await api.delete(API_ENDPOINTS.EMERGENCY.DELETE(emergencyId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete emergency",
      }
    }
  },

  // Get emergency history for a user
  getUserEmergencyHistory: async (userId) => {
    try {
      const response = await api.get(API_ENDPOINTS.EMERGENCY.USER_HISTORY(userId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch user emergency history",
      }
    }
  },
}
