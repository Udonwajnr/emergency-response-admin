"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react"
import Quill from "quill"
import "quill/dist/quill.snow.css"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Maximize2, Minimize2, Save, Eye, EyeOff, FileText, Clock, Zap, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"

// Emergency templates for first aid guides
const emergencyTemplates = {
  "emergency-step": {
    name: "Emergency Step",
    icon: "🚨",
    color: "bg-red-100 text-red-800",
    html: `
      <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #fca5a5; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h4 style="color: #dc2626; margin: 0 0 0.75rem 0; font-size: 1.1em; font-weight: 600;">🚨 Emergency Step</h4>
        <p style="margin: 0; color: #7f1d1d;">Enter critical emergency action here...</p>
      </div>
    `,
  },
  "warning-box": {
    name: "Warning",
    icon: "⚠️",
    color: "bg-orange-100 text-orange-800",
    html: `
      <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h4 style="color: #d97706; margin: 0 0 0.75rem 0; font-size: 1.1em; font-weight: 600;">⚠️ Warning</h4>
        <p style="margin: 0; color: #92400e;">Enter important warning information here...</p>
      </div>
    `,
  },
  "info-box": {
    name: "Information",
    icon: "ℹ️",
    color: "bg-blue-100 text-blue-800",
    html: `
      <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #60a5fa; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h4 style="color: #2563eb; margin: 0 0 0.75rem 0; font-size: 1.1em; font-weight: 600;">ℹ️ Information</h4>
        <p style="margin: 0; color: #1e40af;">Enter helpful information here...</p>
      </div>
    `,
  },
  "success-box": {
    name: "Success",
    icon: "✅",
    color: "bg-green-100 text-green-800",
    html: `
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #4ade80; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h4 style="color: #16a34a; margin: 0 0 0.75rem 0; font-size: 1.1em; font-weight: 600;">✅ Success</h4>
        <p style="margin: 0; color: #15803d;">Enter success criteria or positive outcome here...</p>
      </div>
    `,
  },
}

export const EnhancedQuillEditor = forwardRef(
  (
    {
      value = "",
      onChange,
      onSave,
      placeholder = "Write your emergency guide here...",
      height = 400,
      autoSave = false,
      autoSaveInterval = 30000,
    },
    ref,
  ) => {
    const editorRef = useRef(null)
    const quillRef = useRef(null)
    const autoSaveRef = useRef(null)
    const containerRef = useRef(null)

    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isPreview, setIsPreview] = useState(false)
    const [wordCount, setWordCount] = useState(0)
    const [charCount, setCharCount] = useState(0)
    const [lastSaved, setLastSaved] = useState(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

    // Auto-save functionality
    useEffect(() => {
      if (autoSave && onSave && hasUnsavedChanges) {
        autoSaveRef.current = setTimeout(() => {
          handleSave()
        }, autoSaveInterval)
      }

      return () => {
        if (autoSaveRef.current) {
          clearTimeout(autoSaveRef.current)
        }
      }
    }, [hasUnsavedChanges, autoSave, autoSaveInterval])

    const handleSave = async () => {
      if (onSave && quillRef.current) {
        const content = quillRef.current.root.innerHTML
        await onSave(content)
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
      }
    }

    const updateWordCount = (text) => {
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0)
      setWordCount(words.length)
      setCharCount(text.length)
    }

    // Initialize Quill editor
    useEffect(() => {
      if (editorRef.current && !quillRef.current && mounted) {
        try {
          // Create Quill instance with proper configuration
          quillRef.current = new Quill(editorRef.current, {
            theme: "snow",
            modules: {
              toolbar: {
                container: [
                  [{ header: [1, 2, 3, 4, 5, 6, false] }],
                  [{ font: [] }],
                  [{ size: ["small", false, "large", "huge"] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ color: [] }, { background: [] }],
                  [{ script: "sub" }, { script: "super" }],
                  [{ list: "ordered" }, { list: "bullet" }],
                  [{ indent: "-1" }, { indent: "+1" }],
                  [{ direction: "rtl" }],
                  [{ align: [] }],
                  ["blockquote", "code-block"],
                  ["link", "image", "video"],
                  ["clean"],
                ],
              },
              clipboard: {
                matchVisual: false,
              },
            },
            formats: [
              "header",
              "font",
              "size",
              "bold",
              "italic",
              "underline",
              "strike",
              "color",
              "background",
              "script",
              "list",
              "bullet",
              "indent",
              "direction",
              "align",
              "blockquote",
              "code-block",
              "link",
              "image",
              "video",
            ],
            placeholder: placeholder,
          })

          // Set initial content if provided
          if (value) {
            quillRef.current.root.innerHTML = value
            updateWordCount(quillRef.current.getText())
          }

          // Listen for text changes
          quillRef.current.on("text-change", (delta, oldDelta, source) => {
            if (source === "user") {
              const html = quillRef.current.root.innerHTML
              const text = quillRef.current.getText()

              updateWordCount(text)
              setHasUnsavedChanges(true)

              if (onChange) {
                onChange(html)
              }
            }
          })

          // Listen for selection changes to update toolbar
          quillRef.current.on("selection-change", (range, oldRange, source) => {
            if (range) {
              // Update toolbar state based on current selection
              const format = quillRef.current.getFormat(range)
              // Toolbar will automatically update based on current format
            }
          })

          setIsInitialized(true)
        } catch (error) {
          console.error("Failed to initialize Quill:", error)
        }
      }

      return () => {
        if (quillRef.current) {
          try {
            quillRef.current.off("text-change")
            quillRef.current.off("selection-change")
          } catch (error) {
            console.error("Error cleaning up Quill:", error)
          }
          quillRef.current = null
          setIsInitialized(false)
        }
      }
    }, [mounted, placeholder])

    // Update content when value prop changes
    useEffect(() => {
      if (quillRef.current && isInitialized && value !== quillRef.current.root.innerHTML) {
        const currentSelection = quillRef.current.getSelection()
        quillRef.current.root.innerHTML = value
        updateWordCount(quillRef.current.getText())

        // Restore selection if it existed
        if (currentSelection) {
          try {
            quillRef.current.setSelection(currentSelection)
          } catch (error) {
            // Selection might be invalid after content change
          }
        }
      }
    }, [value, isInitialized])

    // Handle fullscreen mode
    useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === "Escape" && isFullscreen) {
          setIsFullscreen(false)
        }
      }

      if (isFullscreen) {
        document.addEventListener("keydown", handleEscape)
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = "unset"
      }

      return () => {
        document.removeEventListener("keydown", handleEscape)
        document.body.style.overflow = "unset"
      }
    }, [isFullscreen])

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getContent: () => {
        if (quillRef.current) {
          return quillRef.current.root.innerHTML
        }
        return ""
      },
      setContent: (content) => {
        if (quillRef.current) {
          quillRef.current.root.innerHTML = content
          updateWordCount(quillRef.current.getText())
        }
      },
      insertTemplate: (templateType) => {
        if (quillRef.current && emergencyTemplates[templateType] && isInitialized) {
          const range = quillRef.current.getSelection(true)
          const index = range ? range.index : quillRef.current.getLength()
          quillRef.current.clipboard.dangerouslyPasteHTML(index, emergencyTemplates[templateType].html)

          // Move cursor after inserted content
          const newIndex = index + emergencyTemplates[templateType].html.length
          quillRef.current.setSelection(newIndex)
        }
      },
      focus: () => {
        if (quillRef.current && isInitialized) {
          quillRef.current.focus()
        }
      },
      save: handleSave,
      toggleFullscreen: () => setIsFullscreen(!isFullscreen),
      getQuillInstance: () => quillRef.current,
    }))

    const toggleFullscreen = () => {
      setIsFullscreen(!isFullscreen)
    }

    const togglePreview = () => {
      setIsPreview(!isPreview)
    }

    const insertTemplate = (templateType) => {
      if (quillRef.current && emergencyTemplates[templateType] && isInitialized) {
        const range = quillRef.current.getSelection(true)
        const index = range ? range.index : quillRef.current.getLength()

        // Insert the template HTML
        quillRef.current.clipboard.dangerouslyPasteHTML(index, emergencyTemplates[templateType].html)

        // Focus the editor and move cursor
        quillRef.current.focus()
        setTimeout(() => {
          const newIndex = index + 1
          quillRef.current.setSelection(newIndex)
        }, 100)
      }
    }

    const renderEditor = () => (
      <div className="enhanced-quill-editor" ref={containerRef}>
        {/* Emergency Templates Bar */}
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border border-gray-200 rounded-t-lg">
          <div className="flex items-center gap-2 mr-4">
            <Zap className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-gray-700">Emergency Templates:</span>
          </div>
          {Object.entries(emergencyTemplates).map(([key, template]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => insertTemplate(key)}
              className="h-8 hover:bg-gray-100"
              disabled={!isInitialized}
            >
              <span className="mr-1">{template.icon}</span>
              {template.name}
            </Button>
          ))}
        </div>

        {/* Editor Controls */}
        <div className="flex items-center justify-between p-3 bg-white border-x border-gray-200">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={togglePreview} className="h-8">
              {isPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {isPreview ? "Edit" : "Preview"}
            </Button>

            <Button variant="outline" size="sm" onClick={toggleFullscreen} className="h-8">
              {isFullscreen ? <Minimize2 className="h-4 w-4 mr-1" /> : <Maximize2 className="h-4 w-4 mr-1" />}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>

            {onSave && (
              <Button variant="outline" size="sm" onClick={handleSave} disabled={!hasUnsavedChanges} className="h-8">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            )}

            {isFullscreen && (
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)} className="h-8">
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{wordCount} words</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{charCount} characters</span>
            </div>
            {lastSaved && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Unsaved changes
              </Badge>
            )}
            {!isInitialized && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Loading...
              </Badge>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className={cn("relative", isFullscreen && "flex-1 flex flex-col")}>
          {isPreview ? (
            <div
              className={cn(
                "p-6 border border-gray-200 rounded-b-lg bg-white prose prose-sm max-w-none overflow-y-auto",
                isFullscreen && "flex-1",
              )}
              style={{
                height: isFullscreen ? "auto" : `${height}px`,
                minHeight: isFullscreen ? "calc(100vh - 180px)" : "auto",
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: value }} />
            </div>
          ) : (
            <div className={cn("rich-text-editor-wrapper", isFullscreen && "flex-1 flex flex-col")}>
              <div
                ref={editorRef}
                style={{
                  height: isFullscreen ? "auto" : `${height}px`,
                  minHeight: isFullscreen ? "calc(100vh - 180px)" : `${height}px`,
                }}
                className="quill-editor-container"
              />
            </div>
          )}
        </div>

        <style jsx global>{`
/* Quill Editor Styles */
.enhanced-quill-editor .ql-toolbar.ql-snow {
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-top: none;
  background: #f9fafb;
  padding: 8px 12px;
  border-radius: 0;
  flex-shrink: 0;
}

.enhanced-quill-editor .ql-container.ql-snow {
  border: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  border-top: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.enhanced-quill-editor .ql-editor {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  min-height: 200px;
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.enhanced-quill-editor .ql-editor.ql-blank::before {
  color: #9ca3af;
  font-style: normal;
  left: 16px;
}

/* Fullscreen specific styles */
.enhanced-quill-editor .rich-text-editor-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.enhanced-quill-editor .rich-text-editor-wrapper.flex-1 {
  flex: 1;
}

.enhanced-quill-editor .rich-text-editor-wrapper .quill-editor-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* Toolbar Button Styles */
.enhanced-quill-editor .ql-toolbar button {
  border: none;
  border-radius: 4px;
  padding: 4px 6px;
  margin: 1px;
  transition: all 0.2s ease;
  background-color: transparent;
  color: #374151;
}

.enhanced-quill-editor .ql-toolbar button:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.enhanced-quill-editor .ql-toolbar button.ql-active {
  background-color: #3b82f6;
  color: white;
}

.enhanced-quill-editor .ql-toolbar .ql-picker {
  border-radius: 4px;
  color: #374151;
}

.enhanced-quill-editor .ql-toolbar .ql-picker-label {
  background-color: transparent;
  color: #374151;
  border: none;
  padding: 4px 8px;
}

.enhanced-quill-editor .ql-toolbar .ql-picker:hover .ql-picker-label {
  background-color: #e5e7eb;
  color: #374151;
}

.enhanced-quill-editor .ql-toolbar .ql-picker.ql-expanded .ql-picker-label {
  background-color: #3b82f6;
  color: white;
}

/* Dropdown Styles - Fixed visibility */
.enhanced-quill-editor .ql-toolbar .ql-picker-options {
  background-color: white !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  padding: 4px;
  z-index: 10000 !important;
  max-height: 200px;
  overflow-y: auto;
}

.enhanced-quill-editor .ql-toolbar .ql-picker-item {
  border-radius: 4px;
  padding: 6px 12px;
  color: #374151 !important;
  background-color: transparent !important;
  cursor: pointer;
}

.enhanced-quill-editor .ql-toolbar .ql-picker-item:hover {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
}

.enhanced-quill-editor .ql-toolbar .ql-picker-item.ql-selected {
  background-color: #3b82f6 !important;
  color: white !important;
}

/* Header dropdown specific styles */
.enhanced-quill-editor .ql-toolbar .ql-header .ql-picker-item::before {
  color: inherit !important;
}

.enhanced-quill-editor .ql-toolbar .ql-header .ql-picker-item[data-value="1"]::before {
  content: 'Heading 1';
  font-size: 1.5em;
  font-weight: bold;
}

.enhanced-quill-editor .ql-toolbar .ql-header .ql-picker-item[data-value="2"]::before {
  content: 'Heading 2';
  font-size: 1.3em;
  font-weight: bold;
}

.enhanced-quill-editor .ql-toolbar .ql-header .ql-picker-item[data-value="3"]::before {
  content: 'Heading 3';
  font-size: 1.1em;
  font-weight: bold;
}

.enhanced-quill-editor .ql-toolbar .ql-header .ql-picker-item:not([data-value])::before {
  content: 'Normal';
}

/* Font size dropdown styles */
.enhanced-quill-editor .ql-toolbar .ql-size .ql-picker-item[data-value="small"]::before {
  content: 'Small';
  font-size: 0.8em;
}

.enhanced-quill-editor .ql-toolbar .ql-size .ql-picker-item:not([data-value])::before {
  content: 'Normal';
  font-size: 1em;
}

.enhanced-quill-editor .ql-toolbar .ql-size .ql-picker-item[data-value="large"]::before {
  content: 'Large';
  font-size: 1.2em;
}

.enhanced-quill-editor .ql-toolbar .ql-size .ql-picker-item[data-value="huge"]::before {
  content: 'Huge';
  font-size: 1.5em;
}

/* Color Picker Styles */
.enhanced-quill-editor .ql-color-picker .ql-picker-options {
  width: 168px !important;
  background-color: white !important;
}

.enhanced-quill-editor .ql-color-picker .ql-picker-item {
  border: 1px solid #e5e7eb !important;
  border-radius: 2px;
  width: 16px !important;
  height: 16px !important;
  margin: 2px;
  padding: 0 !important;
}

.enhanced-quill-editor .ql-color-picker .ql-picker-item:hover {
  border-color: #374151 !important;
  transform: scale(1.1);
}

/* Link Tooltip */
.enhanced-quill-editor .ql-tooltip {
  background-color: white !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  padding: 8px 12px;
  z-index: 10001 !important;
}

.enhanced-quill-editor .ql-tooltip input {
  border: 1px solid #d1d5db !important;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  background-color: white !important;
  color: #374151 !important;
}

.enhanced-quill-editor .ql-tooltip a {
  background-color: #3b82f6 !important;
  color: white !important;
  border-radius: 4px;
  padding: 4px 8px;
  text-decoration: none;
  font-size: 12px;
  margin-left: 4px;
}

.enhanced-quill-editor .ql-tooltip a:hover {
  background-color: #2563eb !important;
}

/* Hide any duplicate toolbars */
.enhanced-quill-editor .ql-toolbar + .ql-toolbar {
  display: none !important;
}

/* Ensure proper z-index for dropdowns in fullscreen */
.enhanced-quill-editor .ql-picker-options {
  z-index: 10000 !important;
  position: absolute !important;
}

/* Fullscreen container fixes */
.enhanced-quill-editor .rich-text-editor-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  border-top: none;
  overflow: hidden;
}

/* Ensure editor takes full height in fullscreen */
.enhanced-quill-editor .rich-text-editor-wrapper.flex-1 .ql-container {
  height: 100% !important;
}

.enhanced-quill-editor .rich-text-editor-wrapper.flex-1 .ql-editor {
  height: 100% !important;
  min-height: auto !important;
}

/* Fullscreen editor specific styles */
.fullscreen-editor .ql-container {
  height: 100% !important;
  border: none !important;
  border-radius: 0 !important;
}

.fullscreen-editor .ql-toolbar {
  border: none !important;
  border-bottom: 1px solid #e5e7eb !important;
  border-radius: 0 !important;
}

.fullscreen-editor .ql-editor {
  height: 100% !important;
  min-height: calc(100vh - 140px) !important;
}
`}</style>
      </div>
    )

    // Render fullscreen editor as portal
    if (isFullscreen && mounted) {
      return createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
          <div className="flex-1 flex flex-col">
            {/* Emergency Templates Bar */}
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2 mr-4">
                <Zap className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Emergency Templates:</span>
              </div>
              {Object.entries(emergencyTemplates).map(([key, template]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate(key)}
                  className="h-8 hover:bg-gray-100"
                  disabled={!isInitialized}
                >
                  <span className="mr-1">{template.icon}</span>
                  {template.name}
                </Button>
              ))}
            </div>

            {/* Editor Controls */}
            <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={togglePreview} className="h-8">
                  {isPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {isPreview ? "Edit" : "Preview"}
                </Button>

                <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)} className="h-8">
                  <Minimize2 className="h-4 w-4 mr-1" />
                  Exit Fullscreen
                </Button>

                {onSave && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges}
                    className="h-8"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                )}

                <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)} className="h-8">
                  <X className="h-4 w-4 mr-1" />
                  Close
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{wordCount} words</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{charCount} characters</span>
                </div>
                {lastSaved && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </div>
                )}
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    Unsaved changes
                  </Badge>
                )}
              </div>
            </div>

            {/* Fullscreen Editor Content */}
            <div className="flex-1 flex flex-col min-h-0">
              {isPreview ? (
                <div className="flex-1 p-6 bg-white prose prose-sm max-w-none overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: value }} />
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div
                    ref={editorRef}
                    className="flex-1 fullscreen-editor"
                    style={{ minHeight: "calc(100vh - 140px)" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )
    }

    // Regular editor
    return renderEditor()
  },
)

EnhancedQuillEditor.displayName = "EnhancedQuillEditor"
