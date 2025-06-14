"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import Quill from "quill"
import "quill/dist/quill.snow.css"

// Emergency templates for first aid guides
const emergencyTemplates = {
  "emergency-step": `
    <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #fca5a5; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h4 style="color: #dc2626; margin: 0 0 0.75rem 0; font-size: 1.1em; font-weight: 600;">🚨 Emergency Step</h4>
      <p style="margin: 0; color: #7f1d1d;">Enter critical emergency action here...</p>
    </div>
  `,
  "warning-box": `
    <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h4 style="color: #d97706; margin: 0 0 0.75rem 0; font-size: 1.1em; font-weight: 600;">⚠️ Warning</h4>
      <p style="margin: 0; color: #92400e;">Enter important warning information here...</p>
    </div>
  `,
  "info-box": `
    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #60a5fa; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h4 style="color: #2563eb; margin: 0 0 0.75rem 0; font-size: 1.1em; font-weight: 600;">ℹ️ Information</h4>
      <p style="margin: 0; color: #1e40af;">Enter helpful information here...</p>
    </div>
  `,
  "success-box": `
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #4ade80; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h4 style="color: #16a34a; margin: 0 0 0.75rem 0; font-size: 1.1em; font-weight: 600;">✅ Success</h4>
      <p style="margin: 0; color: #15803d;">Enter success criteria or positive outcome here...</p>
    </div>
  `,
}

export const RichTextEditor = forwardRef(
  ({ value = "", onChange, placeholder = "Write your emergency guide here...", height = 400 }, ref) => {
    const editorRef = useRef(null)
    const quillRef = useRef(null)

    useEffect(() => {
      if (editorRef.current && !quillRef.current) {
        // Initialize Quill with a single, clean toolbar
        quillRef.current = new Quill(editorRef.current, {
          theme: "snow",
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
              ["blockquote", "code-block"],
              ["link", "image"],
              ["clean"],
            ],
          },
          placeholder: placeholder,
        })

        // Set initial content
        if (value) {
          quillRef.current.root.innerHTML = value
        }

        // Listen for text changes
        quillRef.current.on("text-change", () => {
          const html = quillRef.current.root.innerHTML
          if (onChange) {
            onChange(html)
          }
        })
      }

      return () => {
        if (quillRef.current) {
          quillRef.current = null
        }
      }
    }, [])

    // Update content when value prop changes
    useEffect(() => {
      if (quillRef.current && value !== quillRef.current.root.innerHTML) {
        quillRef.current.root.innerHTML = value
      }
    }, [value])

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
        }
      },
      insertTemplate: (templateType) => {
        if (quillRef.current && emergencyTemplates[templateType]) {
          const range = quillRef.current.getSelection()
          if (range) {
            quillRef.current.clipboard.dangerouslyPasteHTML(range.index, emergencyTemplates[templateType])
          }
        }
      },
      focus: () => {
        if (quillRef.current) {
          quillRef.current.focus()
        }
      },
    }))

    return (
      <div className="rich-text-editor-wrapper">
        <div ref={editorRef} style={{ height: `${height}px` }} />

        <style jsx global>{`
        .rich-text-editor-wrapper .ql-toolbar {
          border: 1px solid #e5e7eb;
          border-bottom: none;
          background: #f9fafb;
          border-radius: 8px 8px 0 0;
          padding: 8px;
        }

        .rich-text-editor-wrapper .ql-container {
          border: 1px solid #e5e7eb;
          border-radius: 0 0 8px 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .rich-text-editor-wrapper .ql-editor {
          font-size: 14px;
          line-height: 1.6;
          color: #374151;
          min-height: 200px;
        }

        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }

        .rich-text-editor-wrapper .ql-toolbar button:hover {
          color: #3b82f6;
        }

        .rich-text-editor-wrapper .ql-toolbar button.ql-active {
          color: #1d4ed8;
        }

        /* Ensure no duplicate toolbars */
        .rich-text-editor-wrapper .ql-toolbar:not(:first-child) {
          display: none;
        }
      `}</style>
      </div>
    )
  },
)

RichTextEditor.displayName = "RichTextEditor"
