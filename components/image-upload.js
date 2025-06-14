"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, X, ImageIcon, Link, Loader2, Check, AlertCircle, Camera, Clipboard } from "lucide-react"
import { imageService } from "@/services/imageService"
import { cn } from "@/lib/utils"

export function ImageUpload({ onImageUploaded, onError, multiple = false, className, accept = "image/*" }) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedImages, setUploadedImages] = useState([])
  const [imageUrl, setImageUrl] = useState("")
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)
  const [uploadMode, setUploadMode] = useState("file") // "file" or "url"

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))

    if (files.length > 0) {
      await handleFileUpload(files)
    }
  }, [])

  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      await handleFileUpload(files)
    }
  }, [])

  const handleFileUpload = async (files) => {
    setError("")
    setUploading(true)
    setUploadProgress(0)

    try {
      const validFiles = []

      // Validate all files first
      for (const file of files) {
        const validation = imageService.validateImage(file)
        if (!validation.valid) {
          setError(validation.message)
          setUploading(false)
          return
        }
        validFiles.push(file)
      }

      // Compress and upload files
      const uploadPromises = validFiles.map(async (file, index) => {
        try {
          // Compress image if it's large
          const compressedFile = file.size > 1024 * 1024 ? await imageService.compressImage(file) : file

          const result = await imageService.uploadImage(compressedFile)

          if (result.success) {
            setUploadProgress(((index + 1) / validFiles.length) * 100)
            return result.data
          } else {
            throw new Error(result.message)
          }
        } catch (error) {
          throw error
        }
      })

      const results = await Promise.all(uploadPromises)

      setUploadedImages((prev) => [...prev, ...results])

      // Call callback for each uploaded image
      results.forEach((image) => {
        onImageUploaded?.(image.url, image)
      })

      setUploadProgress(100)

      // Reset after success
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 1000)
    } catch (error) {
      setError(error.message || "Failed to upload image")
      setUploading(false)
      setUploadProgress(0)
      onError?.(error.message || "Failed to upload image")
    }
  }

  const handleUrlUpload = () => {
    if (!imageUrl.trim()) {
      setError("Please enter a valid image URL")
      return
    }

    // Basic URL validation
    try {
      new URL(imageUrl)
    } catch {
      setError("Please enter a valid URL")
      return
    }

    // Check if it's likely an image URL
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
    const hasImageExtension = imageExtensions.some((ext) => imageUrl.toLowerCase().includes(ext))

    if (!hasImageExtension && !imageUrl.includes("unsplash") && !imageUrl.includes("pexels")) {
      setError("URL doesn't appear to be an image. Please check the URL.")
      return
    }

    onImageUploaded?.(imageUrl, { url: imageUrl, filename: "external-image" })
    setImageUrl("")
    setError("")
  }

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read()

      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/")) {
            const blob = await clipboardItem.getType(type)
            const file = new File([blob], `clipboard-image-${Date.now()}.png`, { type })
            await handleFileUpload([file])
            return
          }
        }
      }

      setError("No image found in clipboard")
    } catch (error) {
      setError("Failed to access clipboard. Please use file upload instead.")
    }
  }

  const removeUploadedImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Mode Selector */}
      <div className="flex gap-2">
        <Button
          variant={uploadMode === "file" ? "default" : "outline"}
          size="sm"
          onClick={() => setUploadMode("file")}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
        <Button
          variant={uploadMode === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setUploadMode("url")}
          className="flex items-center gap-2"
        >
          <Link className="h-4 w-4" />
          From URL
        </Button>
        <Button variant="outline" size="sm" onClick={handlePasteFromClipboard} className="flex items-center gap-2">
          <Clipboard className="h-4 w-4" />
          Paste
        </Button>
      </div>

      {/* File Upload Mode */}
      {uploadMode === "file" && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
            uploading && "pointer-events-none opacity-50",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              {uploading ? (
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              ) : (
                <ImageIcon className="h-12 w-12 text-gray-400" />
              )}
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900">
                {uploading ? "Uploading..." : "Drop images here or click to browse"}
              </p>
              <p className="text-sm text-gray-500 mt-1">Supports JPEG, PNG, GIF, WebP up to 5MB</p>
            </div>

            {!uploading && (
              <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Choose {multiple ? "Images" : "Image"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* URL Upload Mode */}
      {uploadMode === "url" && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="image-url">Image URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlUpload()}
              />
              <Button onClick={handleUrlUpload} className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Enter a direct link to an image file or from services like Unsplash, Pexels, etc.
          </p>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Recently Uploaded</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeUploadedImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Badge variant="secondary" className="absolute top-1 right-1 text-xs">
                  <Check className="h-3 w-3" />
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
