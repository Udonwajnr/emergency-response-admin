"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Edit, Trash2, Heart, Globe, MoreVertical, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MobileCard } from "@/components/mobile-card"
import { MobileSearch } from "@/components/mobile-search"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { firstAidService } from "@/services/firstAidService"
import { RichTextEditor } from "@/components/rich-text-editor"

export default function FirstAidGuidesPage() {
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingGuide, setEditingGuide] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [newGuide, setNewGuide] = useState({
    category: "",
    language: "en",
    content: "",
  })
  const { toast } = useToast()

  const categories = ["CPR", "Burns", "Bleeding", "Choking", "Fractures", "Poisoning", "Shock"]
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
  ]

  const loadGuides = async () => {
    try {
      setLoading(true)
      const result = await firstAidService.getGuides({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
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
  }, [selectedCategory])

  const filteredGuides = guides.filter((guide) => {
    const matchesSearch =
      guide.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleCreateGuide = async () => {
    if (!newGuide.category || !newGuide.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const result = await firstAidService.createGuide(newGuide)

      if (result.success) {
        setGuides((prev) => [result.data.guide, ...prev])
        setNewGuide({ category: "", language: "en", content: "" })
        setIsCreateDialogOpen(false)

        toast({
          title: "Success",
          description: "First aid guide created successfully",
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
    if (!editingGuide.category || !editingGuide.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const result = await firstAidService.updateGuide(editingGuide._id, {
        category: editingGuide.category,
        language: editingGuide.language,
        content: editingGuide.content,
      })

      if (result.success) {
        setGuides((prev) => prev.map((guide) => (guide._id === editingGuide._id ? result.data.guide : guide)))
        setEditingGuide(null)

        toast({
          title: "Success",
          description: "First aid guide updated successfully",
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
              <SelectItem key={category} value={category}>
                {category}
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={loadGuides}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">First Aid Guides</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage emergency first aid guides and instructions
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mobile-button">
                <Plus className="h-4 w-4 mr-2" />
                Create Guide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New First Aid Guide</DialogTitle>
                <DialogDescription>Add a new first aid guide to help users in emergency situations</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select onValueChange={(value) => setNewGuide((prev) => ({ ...prev, category: value }))}>
                      <SelectTrigger className="mobile-input">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={newGuide.language}
                      onValueChange={(value) => setNewGuide((prev) => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger className="mobile-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <RichTextEditor
                    value={newGuide.content}
                    onChange={(content) => setNewGuide((prev) => ({ ...prev, content }))}
                    placeholder="Enter the first aid instructions..."
                    className="min-h-[300px]"
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="mobile-button"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateGuide} className="mobile-button" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Guide"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Mobile Search */}
        <MobileSearch onSearch={setSearchTerm} placeholder="Search guides..." filters={filterComponent} />

        {/* Guides Grid - Mobile Optimized */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide) => (
            <MobileCard
              key={guide._id}
              className="hover:shadow-md transition-shadow"
              swipeable
              onSwipeLeft={() => handleDeleteGuide(guide._id)}
              onSwipeRight={() => setEditingGuide(guide)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <Heart className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                    {guide.category}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      <Globe className="h-3 w-3" />
                      {languages.find((lang) => lang.code === guide.language)?.name}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingGuide(guide)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteGuide(guide._id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription
                  className="text-sm line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html: guide.content.replace(/<[^>]*>/g, "").substring(0, 120) + "...",
                  }}
                />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(guide.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </MobileCard>
          ))}
        </div>

        {filteredGuides.length === 0 && !loading && (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No guides found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Create your first first aid guide"}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Guide
            </Button>
          </div>
        )}

        {/* Swipe hint for mobile */}
        <div className="md:hidden text-center text-xs text-muted-foreground">
          💡 Swipe left to delete, swipe right to edit
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingGuide} onOpenChange={() => setEditingGuide(null)}>
          <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit First Aid Guide</DialogTitle>
              <DialogDescription>Update the first aid guide information</DialogDescription>
            </DialogHeader>
            {editingGuide && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category *</Label>
                    <Select
                      value={editingGuide.category}
                      onValueChange={(value) => setEditingGuide((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="mobile-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-language">Language</Label>
                    <Select
                      value={editingGuide.language}
                      onValueChange={(value) => setEditingGuide((prev) => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger className="mobile-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Content *</Label>
                  <RichTextEditor
                    value={editingGuide.content}
                    onChange={(content) => setEditingGuide((prev) => ({ ...prev, content }))}
                    placeholder="Enter the first aid instructions..."
                    className="min-h-[300px]"
                  />
                </div>
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingGuide(null)}
                className="mobile-button"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateGuide} className="mobile-button" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Guide"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PullToRefresh>
  )
}
