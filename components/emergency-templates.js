"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, Info, CheckCircle, FileText } from "lucide-react"

const templates = [
  {
    key: "emergency-step",
    label: "Emergency Step",
    icon: <AlertTriangle className="h-3 w-3 text-red-500" />,
    color: "border-red-200 hover:bg-red-50",
  },
  {
    key: "warning-box",
    label: "Warning",
    icon: <AlertTriangle className="h-3 w-3 text-orange-500" />,
    color: "border-orange-200 hover:bg-orange-50",
  },
  {
    key: "info-box",
    label: "Information",
    icon: <Info className="h-3 w-3 text-blue-500" />,
    color: "border-blue-200 hover:bg-blue-50",
  },
  {
    key: "success-box",
    label: "Success",
    icon: <CheckCircle className="h-3 w-3 text-green-500" />,
    color: "border-green-200 hover:bg-green-50",
  },
]

export function EmergencyTemplates({ onInsertTemplate }) {
  return (
    <div className="border rounded-lg p-4 mb-4 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-red-600" />
        <span className="text-sm font-semibold text-gray-800">Emergency Templates</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <Button
            key={template.key}
            variant="outline"
            size="sm"
            onClick={() => onInsertTemplate(template.key)}
            className={`flex items-center gap-1 text-xs ${template.color} transition-all`}
          >
            {template.icon}
            {template.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
