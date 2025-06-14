"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link,
  ImageIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Type,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RichTextEditor({ value = "", onChange, placeholder = "Start writing...", className }) {
  const editorRef = useRef(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false)
  const [isImagePopoverOpen, setIsImagePopoverOpen] = useState(false)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value
      setIsEditorReady(true)
    }
  }, [value])

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleContentChange()
  }

  const handleContentChange = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertLink = () => {
    if (linkUrl) {
      execCommand("createLink", linkUrl)
      setLinkUrl("")
      setIsLinkPopoverOpen(false)
    }
  }

  const insertImage = () => {
    if (imageUrl) {
      execCommand("insertImage", imageUrl)
      setImageUrl("")
      setIsImagePopoverOpen(false)
    }
  }

  const formatBlock = (tag) => {
    execCommand("formatBlock", tag)
  }

  const isCommandActive = (command) => {
    try {
      return document.queryCommandState(command)
    } catch (e) {
      return false
    }
  }

  const toolbarButtons = [
    {
      group: "text-style",
      buttons: [
        { command: "bold", icon: Bold, tooltip: "Bold" },
        { command: "italic", icon: Italic, tooltip: "Italic" },
        { command: "underline", icon: Underline, tooltip: "Underline" },
      ],
    },
    {
      group: "headings",
      buttons: [
        { action: () => formatBlock("h1"), icon: Heading1, tooltip: "Heading 1" },
        { action: () => formatBlock("h2"), icon: Heading2, tooltip: "Heading 2" },
        { action: () => formatBlock("h3"), icon: Heading3, tooltip: "Heading 3" },
        { action: () => formatBlock("p"), icon: Type, tooltip: "Paragraph" },
      ],
    },
    {
      group: "alignment",
      buttons: [
        { command: "justifyLeft", icon: AlignLeft, tooltip: "Align Left" },
        { command: "justifyCenter", icon: AlignCenter, tooltip: "Align Center" },
        { command: "justifyRight", icon: AlignRight, tooltip: "Align Right" },
      ],
    },
    {
      group: "lists",
      buttons: [
        { command: "insertUnorderedList", icon: List, tooltip: "Bullet List" },
        { command: "insertOrderedList", icon: ListOrdered, tooltip: "Numbered List" },
        { command: "formatBlock", value: "blockquote", icon: Quote, tooltip: "Quote" },
      ],
    },
    {
      group: "media",
      buttons: [
        {
          action: () => setIsLinkPopoverOpen(true),
          icon: Link,
          tooltip: "Insert Link",
          popover: true,
        },
        {
          action: () => setIsImagePopoverOpen(true),
          icon: ImageIcon,
          tooltip: "Insert Image",
          popover: true,
        },
        { command: "insertHTML", value: "<code></code>", icon: Code, tooltip: "Code" },
      ],
    },
    {
      group: "history",
      buttons: [
        { command: "undo", icon: Undo, tooltip: "Undo" },
        { command: "redo", icon: Redo, tooltip: "Redo" },
      ],
    },
  ]

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-white", className)}>
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {toolbarButtons.map((group, groupIndex) => (
            <div key={group.group} className="flex items-center">
              {group.buttons.map((button, buttonIndex) => {
                const Icon = button.icon
                const isActive = button.command ? isCommandActive(button.command) : false

                if (button.popover) {
                  return (
                    <Popover
                      key={buttonIndex}
                      open={button.icon === Link ? isLinkPopoverOpen : isImagePopoverOpen}
                      onOpenChange={button.icon === Link ? setIsLinkPopoverOpen : setIsImagePopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-200"
                          title={button.tooltip}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        {button.icon === Link ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="link-url">Link URL</Label>
                              <Input
                                id="link-url"
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && insertLink()}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setIsLinkPopoverOpen(false)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={insertLink}>
                                Insert Link
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="image-url">Image URL</Label>
                              <Input
                                id="image-url"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && insertImage()}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setIsImagePopoverOpen(false)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={insertImage}>
                                Insert Image
                              </Button>
                            </div>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  )
                }

                return (
                  <Toggle
                    key={buttonIndex}
                    pressed={isActive}
                    onPressedChange={() => {
                      if (button.action) {
                        button.action()
                      } else if (button.command) {
                        execCommand(button.command, button.value)
                      }
                    }}
                    size="sm"
                    className="h-8 w-8 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
                    title={button.tooltip}
                  >
                    <Icon className="h-4 w-4" />
                  </Toggle>
                )
              })}
              {groupIndex < toolbarButtons.length - 1 && <Separator orientation="vertical" className="mx-1 h-6" />}
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
        style={{
          lineHeight: "1.6",
        }}
        onInput={handleContentChange}
        onBlur={handleContentChange}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem 0;
          color: #1f2937;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: #374151;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.75rem 0 0.5rem 0;
          color: #4b5563;
        }
        
        [contenteditable] p {
          margin: 0.5rem 0;
          color: #374151;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
          background-color: #f9fafb;
          padding: 1rem;
          border-radius: 0.375rem;
        }
        
        [contenteditable] code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          color: #dc2626;
        }
        
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        [contenteditable] a:hover {
          color: #1d4ed8;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
        }
        
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  )
}
