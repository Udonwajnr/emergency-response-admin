"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const RichTextEditor = dynamic(() => import("./rich-text-editor").then((mod) => ({ default: mod.RichTextEditor })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 border rounded-lg bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
        <p className="text-sm text-gray-600">Loading editor...</p>
      </div>
    </div>
  ),
})

const EmergencyTemplates = dynamic(
  () => import("./emergency-templates").then((mod) => ({ default: mod.EmergencyTemplates })),
  {
    ssr: false,
  },
)

export { RichTextEditor, EmergencyTemplates }
