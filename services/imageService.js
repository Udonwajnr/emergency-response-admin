import api from "@/lib/api"

export const imageService = {
  // Upload single image
  uploadImage: async (file) => {
    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("folder", "first-aid-guides")

      const response = await api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return {
        success: true,
        data: {
          url: response.data.url,
          filename: response.data.filename,
          size: response.data.size,
        },
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to upload image",
      }
    }
  },

  // Upload multiple images
  uploadMultipleImages: async (files) => {
    try {
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`images`, file)
      })
      formData.append("folder", "first-aid-guides")

      const response = await api.post("/upload/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return {
        success: true,
        data: response.data.images,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to upload images",
      }
    }
  },

  // Delete image
  deleteImage: async (filename) => {
    try {
      const response = await api.delete(`/upload/image/${filename}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete image",
      }
    }
  },

  // Validate image file
  validateImage: (file) => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        message: "Image size must be less than 5MB",
      }
    }

    return { valid: true }
  },

  // Compress image before upload
  compressImage: (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(resolve, file.type, quality)
      }

      img.src = URL.createObjectURL(file)
    })
  },
}
