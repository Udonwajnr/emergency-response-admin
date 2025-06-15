import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export const firstAidService = {
  // CREATE - Create new first aid guide
  createGuide: async (guideData) => {
    try {
      const response = await api.post(API_ENDPOINTS.FIRST_AID.CREATE, {
        title: guideData.title,
        category: guideData.category,
        language: guideData.language || "en",
        description: guideData.description,
        content: guideData.content,
        severity: guideData.severity || "moderate", // Add severity field
      });
      return {
        success: true,
        data: response.data,
        message: "Guide created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create guide",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // READ - Get all first aid guides with optional filtering
  getGuides: async (params = {}) => {
    try {
      const queryParams = {};
      if (params.category && params.category !== "all") {
        queryParams.category = params.category;
      }
      if (params.language && params.language !== "all") {
        queryParams.language = params.language;
      }
      if (params.search) {
        queryParams.search = params.search;
      }

      const response = await api.get(API_ENDPOINTS.FIRST_AID.LIST, {
        params: queryParams,
      });
      return {
        success: true,
        data: response.data || [],
        count: response.data?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch guides",
        error: error.response?.data?.error || error.message,
        data: [],
      };
    }
  },

  // READ - Get single guide by ID
  getGuideById: async (guideId) => {
    try {
      if (!guideId) {
        throw new Error("Guide ID is required");
      }

      const response = await api.get(API_ENDPOINTS.FIRST_AID.DETAIL(guideId));
      return {
        success: true,
        data: response.data,
        message: "Guide fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch guide",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // UPDATE - Update existing guide
  updateGuide: async (guideId, guideData) => {
    try {
      if (!guideId) {
        throw new Error("Guide ID is required");
      }

      const updateData = {
        title: guideData.title,
        category: guideData.category,
        language: guideData.language || "en",
        description: guideData.description,
        content: guideData.content,
        severity: guideData.severity || "moderate", // Add severity field
      };

      const response = await api.put(
        API_ENDPOINTS.FIRST_AID.UPDATE(guideId),
        updateData
      );
      return {
        success: true,
        data: response.data,
        message: "Guide updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update guide",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // DELETE - Delete guide by ID
  deleteGuide: async (guideId) => {
    try {
      if (!guideId) {
        throw new Error("Guide ID is required");
      }

      const response = await api.delete(
        API_ENDPOINTS.FIRST_AID.DELETE(guideId)
      );
      return {
        success: true,
        data: response.data,
        message: "Guide deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete guide",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // UTILITY - Search guides
  searchGuides: async (searchTerm, filters = {}) => {
    try {
      const params = {
        search: searchTerm,
        ...filters,
      };

      return await firstAidService.getGuides(params);
    } catch (error) {
      return {
        success: false,
        message: "Failed to search guides",
        error: error.message,
        data: [],
      };
    }
  },

  // UTILITY - Get guides by category
  getGuidesByCategory: async (category) => {
    try {
      return await firstAidService.getGuides({ category });
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch guides by category",
        error: error.message,
        data: [],
      };
    }
  },

  // UTILITY - Get recent guides
  getRecentGuides: async (limit = 10) => {
    try {
      const result = await firstAidService.getGuides();
      if (result.success) {
        // Sort by updatedAt and limit results
        const sortedGuides = result.data
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, limit);

        return {
          success: true,
          data: sortedGuides,
          count: sortedGuides.length,
        };
      }
      return result;
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch recent guides",
        error: error.message,
        data: [],
      };
    }
  },

  // UTILITY - Validate guide data
  validateGuideData: (guideData) => {
    const errors = [];

    if (!guideData.title || guideData.title.trim().length === 0) {
      errors.push("Title is required");
    }

    if (!guideData.category || guideData.category.trim().length === 0) {
      errors.push("Category is required");
    }

    if (!guideData.description || guideData.description.trim().length === 0) {
      errors.push("Description is required");
    }

    if (!guideData.content || guideData.content.trim().length === 0) {
      errors.push("Content is required");
    }

    if (guideData.title && guideData.title.length > 200) {
      errors.push("Title must be less than 200 characters");
    }

    if (guideData.description && guideData.description.length > 500) {
      errors.push("Description must be less than 500 characters");
    }

    if (
      !guideData.severity ||
      !["critical", "severe", "moderate", "minor"].includes(guideData.severity)
    ) {
      errors.push(
        "Valid severity level is required (critical, severe, moderate, or minor)"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
