import api from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/api-endpoints"

export const firstAidService = {
  // Get all first aid guides
  getGuides: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.FIRST_AID.LIST, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch guides",
      }
    }
  },

  // Create new guide
  createGuide: async (guideData) => {
    try {
      const response = await api.post(API_ENDPOINTS.FIRST_AID.CREATE, guideData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create guide",
      }
    }
  },

  // Get guide by ID
  getGuideById: async (guideId) => {
    try {
      const response = await api.get(API_ENDPOINTS.FIRST_AID.DETAIL(guideId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch guide",
      }
    }
  },

  // Update guide
  updateGuide: async (guideId, guideData) => {
    try {
      const response = await api.put(API_ENDPOINTS.FIRST_AID.UPDATE(guideId), guideData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update guide",
      }
    }
  },

  // Delete guide
  deleteGuide: async (guideId) => {
    try {
      const response = await api.delete(API_ENDPOINTS.FIRST_AID.DELETE(guideId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete guide",
      }
    }
  },
}
