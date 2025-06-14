"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Edit,
  Trash2,
  Heart,
  Globe,
  MoreVertical,
  Loader2,
  Filter,
  BookOpen,
  Clock,
  Eye,
  Download,
  Share,
  Star,
  TrendingUp,
  FileText,
  Zap,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MobileSearch } from "@/components/mobile-search"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { firstAidService } from "@/services/firstAidService"
import { EnhancedQuillEditor } from "@/components/enhanced-quill-editor"
import { cn } from "@/lib/utils"

export default function FirstAidGuidesPage() {
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingGuide, setEditingGuide] = useState(null)
  const [viewingGuide, setViewingGuide] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [newGuide, setNewGuide] = useState({
    category: "",
    language: "en",
    content: "",
    title: "",
    description: "",
  })
  const { toast } = useToast()
  const editorRef = useRef(null)

  const categories = [
    { id: "CPR", name: "CPR", icon: "❤️", color: "bg-red-100 text-red-800" },
    { id: "Burns", name: "Burns", icon: "🔥", color: "bg-orange-100 text-orange-800" },
    { id: "Bleeding", name: "Bleeding", icon: "🩸", color: "bg-red-100 text-red-800" },
    { id: "Choking", name: "Choking", icon: "🫁", color: "bg-blue-100 text-blue-800" },
    { id: "Fractures", name: "Fractures", icon: "🦴", color: "bg-gray-100 text-gray-800" },
    { id: "Poisoning", name: "Poisoning", icon: "☠️", color: "bg-purple-100 text-purple-800" },
    { id: "Shock", name: "Shock", icon: "⚡", color: "bg-yellow-100 text-yellow-800" },
    { id: "Allergic Reactions", name: "Allergic Reactions", icon: "🤧", color: "bg-pink-100 text-pink-800" },
    { id: "Heart Attack", name: "Heart Attack", icon: "💔", color: "bg-red-100 text-red-800" },
    { id: "Stroke", name: "Stroke", icon: "🧠", color: "bg-indigo-100 text-indigo-800" },
  ]

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
  ]

  const loadGuides = async () => {
    try {
      setLoading(true)
      const result = await firstAidService.getGuides({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        language: selectedLanguage !== "all" ? selectedLanguage : undefined,
      })

      if (result.success) {
        setGuides(result.data)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load guides",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGuides()
  }, [selectedCategory, selectedLanguage])

  const filteredGuides = guides.filter((guide) => {
    // Filter by tab
    if (activeTab === "recent" && new Date(guide.updatedAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      return false
    if (activeTab === "popular" && !guide.viewCount) return false

    // Filter by search term
    const matchesSearch =
      guide.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.content?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleCreateGuide = async () => {
    // Validate guide data
    const validation = firstAidService.validateGuideData(newGuide)
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(", "),
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const result = await firstAidService.createGuide(newGuide)

      if (result.success) {
        setGuides((prev) => [result.data.guide, ...prev])
        setNewGuide({ category: "", language: "en", content: "", title: "", description: "" })
        setIsCreateDialogOpen(false)

        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create guide",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateGuide = async () => {
    // Validate guide data
    const validation = firstAidService.validateGuideData(editingGuide)
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(", "),
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const result = await firstAidService.updateGuide(editingGuide._id, editingGuide)

      if (result.success) {
        setGuides((prev) => prev.map((guide) => (guide._id === editingGuide._id ? result.data.guide : guide)))
        setEditingGuide(null)

        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update guide",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteGuide = async (guideId) => {
    try {
      const result = await firstAidService.deleteGuide(guideId)

      if (result.success) {
        setGuides((prev) => prev.filter((guide) => guide._id !== guideId))

        toast({
          title: "Success",
          description: "First aid guide deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete guide",
        variant: "destructive",
      })
    }
  }

  const getCategoryInfo = (categoryId) => {
    return (
      categories.find((cat) => cat.id === categoryId) || {
        id: categoryId,
        name: categoryId,
        icon: "📋",
        color: "bg-gray-100 text-gray-800",
      }
    )
  }

  const getLanguageInfo = (langCode) => {
    return languages.find((lang) => lang.code === langCode) || { code: langCode, name: langCode, flag: "🌐" }
  }

  const stripHtml = (html) => {
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  const filterComponent = (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Category</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="mt-2 mobile-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <span className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  {category.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">Language</Label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="mt-2 mobile-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  {lang.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">Loading first aid guides...</p>
        </div>
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={loadGuides}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-50 via-pink-50 to-orange-50 rounded-2xl p-8">
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <Heart className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">First Aid Guides</h1>
                    <p className="text-lg text-gray-600 mt-1">Comprehensive emergency response guides to save lives</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{guides.length} Guides</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>{new Set(guides.map((g) => g.language)).size} Languages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>{categories.length} Categories</span>
                  </div>
                </div>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white shadow-lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Guide
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
            <Heart className="h-32 w-32 text-red-500" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Total Guides</p>
                  <p className="text-3xl font-bold text-red-900">{guides.length}</p>
                  <p className="text-xs text-red-600 mt-1">+12% from last month</p>
                </div>
                <div className="p-3 bg-red-200 rounded-full">
                  <BookOpen className="h-6 w-6 text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Categories</p>
                  <p className="text-3xl font-bold text-blue-900">{new Set(guides.map((g) => g.category)).size}</p>
                  <p className="text-xs text-blue-600 mt-1">Across all guides</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <FileText className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Languages</p>
                  <p className="text-3xl font-bold text-green-900">{new Set(guides.map((g) => g.language)).size}</p>
                  <p className="text-xs text-green-600 mt-1">Global accessibility</p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <Globe className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Recent Updates</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {
                      guides.filter((g) => new Date(g.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                        .length
                    }
                  </p>
                  <p className="text-xs text-purple-600 mt-1">This week</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Search */}
        <div className="space-y-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                All Guides
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Popular
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Categories
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <MobileSearch
            onSearch={setSearchTerm}
            placeholder="Search guides by title, category, or content..."
            filters={filterComponent}
          />
        </div>

        {/* Category Quick Access */}
        {activeTab === "categories" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => {
              const categoryGuides = guides.filter((g) => g.category === category.id)
              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-md"
                  onClick={() => {
                    setSelectedCategory(category.id)
                    setActiveTab("all")
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600">{categoryGuides.length} guides</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Guides Grid */}
        {activeTab !== "categories" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGuides.map((guide) => {
              const categoryInfo = getCategoryInfo(guide.category)
              const languageInfo = getLanguageInfo(guide.language)

              return (
                <Card
                  key={guide._id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
                >
                  <div className="relative">
                    <div
                      className={cn(
                        "h-2",
                        categoryInfo.color.includes("red")
                          ? "bg-red-500"
                          : categoryInfo.color.includes("blue")
                            ? "bg-blue-500"
                            : categoryInfo.color.includes("green")
                              ? "bg-green-500"
                              : categoryInfo.color.includes("orange")
                                ? "bg-orange-500"
                                : categoryInfo.color.includes("purple")
                                  ? "bg-purple-500"
                                  : categoryInfo.color.includes("yellow")
                                    ? "bg-yellow-500"
                                    : categoryInfo.color.includes("pink")
                                      ? "bg-pink-500"
                                      : categoryInfo.color.includes("indigo")
                                        ? "bg-indigo-500"
                                        : "bg-gray-500",
                      )}
                    />
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{categoryInfo.icon}</div>
                        <div>
                          <Badge className={categoryInfo.color} variant="secondary">
                            {categoryInfo.name}
                          </Badge>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {languageInfo.flag} {languageInfo.name}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => {
                              setViewingGuide(guide)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Guide
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingGuide(guide)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Guide
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="h-4 w-4 mr-2" />
                            Share Guide
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteGuide(guide._id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Guide
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-3">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {guide.title || guide.category}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 mt-2 line-clamp-3">
                        {guide.description || stripHtml(guide.content).substring(0, 120) + "..."}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(guide.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{stripHtml(guide.content).length} chars</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{guide.viewCount || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredGuides.length === 0 && !loading && activeTab !== "categories" && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Heart className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No guides found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms or filters"
                  : "Create your first comprehensive first aid guide to help save lives"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} size="lg" className="bg-red-600 hover:bg-red-700">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Guide
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Swipe Hint */}
        <div className="md:hidden text-center text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          💡 <strong>Pro tip:</strong> Swipe left to delete, swipe right to edit guides
        </div>

        {/* Create/Edit Dialog */}
        <Dialog
          open={isCreateDialogOpen || !!editingGuide}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false)
              setEditingGuide(null)
            }
          }}
        >
          <DialogContent className="max-w-6xl mx-4 max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingGuide ? "Edit First Aid Guide" : "Create New First Aid Guide"}
              </DialogTitle>
              <DialogDescription>
                {editingGuide
                  ? "Update your comprehensive first aid guide"
                  : "Create a detailed guide to help people respond to emergency situations effectively"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Guide Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Complete CPR Guide for Adults"
                    value={editingGuide ? editingGuide.title : newGuide.title}
                    onChange={(e) => {
                      const value = e.target.value
                      if (editingGuide) {
                        setEditingGuide((prev) => ({ ...prev, title: value }))
                      } else {
                        setNewGuide((prev) => ({ ...prev, title: value }))
                      }
                    }}
                    className="mobile-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={editingGuide ? editingGuide.category : newGuide.category}
                    onValueChange={(value) => {
                      if (editingGuide) {
                        setEditingGuide((prev) => ({ ...prev, category: value }))
                      } else {
                        setNewGuide((prev) => ({ ...prev, category: value }))
                      }
                    }}
                  >
                    <SelectTrigger className="mobile-input">
                      <SelectValue placeholder="Select emergency category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={editingGuide ? editingGuide.language : newGuide.language}
                    onValueChange={(value) => {
                      if (editingGuide) {
                        setEditingGuide((prev) => ({ ...prev, language: value }))
                      } else {
                        setNewGuide((prev) => ({ ...prev, language: value }))
                      }
                    }}
                  >
                    <SelectTrigger className="mobile-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            {lang.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of what this guide covers..."
                  value={editingGuide ? editingGuide.description : newGuide.description}
                  onChange={(e) => {
                    const value = e.target.value
                    if (editingGuide) {
                      setEditingGuide((prev) => ({ ...prev, description: value }))
                    } else {
                      setNewGuide((prev) => ({ ...prev, description: value }))
                    }
                  }}
                  className="mobile-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Guide Content *</Label>
                <EnhancedQuillEditor
                  ref={editorRef}
                  value={editingGuide ? editingGuide.content : newGuide.content}
                  onChange={(content) => {
                    if (editingGuide) {
                      setEditingGuide((prev) => ({ ...prev, content }))
                    } else {
                      setNewGuide((prev) => ({ ...prev, content }))
                    }
                  }}
                  onSave={async (content) => {
                    // Auto-save functionality
                    if (editingGuide) {
                      await handleUpdateGuide()
                    }
                  }}
                  placeholder="Write comprehensive first aid instructions here. Use the emergency templates above to add highlighted steps, warnings, and information boxes..."
                  height={600}
                  autoSave={true}
                  autoSaveInterval={30000}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Use the emergency templates above to add highlighted steps, warning boxes, and info callouts for
                  better readability.
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  setEditingGuide(null)
                }}
                className="mobile-button"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={editingGuide ? handleUpdateGuide : handleCreateGuide}
                className="mobile-button bg-red-600 hover:bg-red-700"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingGuide ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {editingGuide ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    {editingGuide ? "Update Guide" : "Create Guide"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Guide Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-3">
                {viewingGuide && (
                  <>
                    <span className="text-2xl">{getCategoryInfo(viewingGuide.category).icon}</span>
                    {viewingGuide.title || viewingGuide.category}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {viewingGuide && (
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className={getCategoryInfo(viewingGuide.category).color}>
                      {getCategoryInfo(viewingGuide.category).name}
                    </Badge>
                    <Badge variant="outline">
                      {getLanguageInfo(viewingGuide.language).flag} {getLanguageInfo(viewingGuide.language).name}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Updated {new Date(viewingGuide.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>

            {viewingGuide && (
              <div className="space-y-6">
                {viewingGuide.description && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{viewingGuide.description}</p>
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: viewingGuide.content }} />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setViewingGuide(null)
                  setIsViewDialogOpen(false)
                  setEditingGuide(viewingGuide)
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Guide
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PullToRefresh>
  )
}
