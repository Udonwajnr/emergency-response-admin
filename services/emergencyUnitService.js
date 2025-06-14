import api from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/api-endpoints"

export const emergencyUnitService = {
  // Get all emergency units
  getEmergencyUnits: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.EMERGENCY_UNITS.LIST, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch emergency units",
      }
    }
  },

  // Get emergency unit by ID
  getEmergencyUnitById: async (unitId) => {
    try {
      const response = await api.get(API_ENDPOINTS.EMERGENCY_UNITS.DETAIL(unitId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch emergency unit details",
      }
    }
  },

  // Update emergency unit
  updateEmergencyUnit: async (unitId, unitData) => {
    try {
      const response = await api.put(API_ENDPOINTS.EMERGENCY_UNITS.UPDATE(unitId), unitData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update emergency unit",
      }
    }
  },

  // Delete emergency unit
  deleteEmergencyUnit: async (unitId) => {
    try {
      const response = await api.delete(API_ENDPOINTS.EMERGENCY_UNITS.DELETE(unitId))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete emergency unit",
      }
    }
  },

  // Verify emergency unit
  verifyEmergencyUnit: async (unitId, action) => {
    try {
      const response = await api.post(API_ENDPOINTS.EMERGENCY_UNITS.VERIFY, { userId: unitId, action })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to verify emergency unit",
      }
    }
  },

  // Toggle availability status
  toggleAvailability: async (unitId, availabilityStatus) => {
    try {
      const response = await api.put(API_ENDPOINTS.EMERGENCY_UNITS.AVAILABILITY(unitId), { availabilityStatus })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update availability",
      }
    }
  },

  // Get emergency unit statistics
  getStatistics: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.EMERGENCY_UNITS.STATISTICS)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch statistics",
      }
    }
  },
}
