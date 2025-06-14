"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  Download,
  Trash2,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Shield,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { userService } from "@/services/userService"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { MobileSearch } from "@/components/mobile-search"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedUser, setSelectedUser] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [documentToReview, setDocumentToReview] = useState(null)
  const [reviewData, setReviewData] = useState({
    status: "",
    reason: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    clients: 0,
    freelancers: 0,
    emergencyUnits: 0,
    admins: 0,
    verified: 0,
    pending: 0,
  })
  const { toast } = useToast()

  const loadUsers = async () => {
    try {
      setLoading(true)
      const result = await userService.getUsers()

      if (result.success) {
        setUsers(result.data)
        calculateStats(result.data)
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
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (userData) => {
    const total = userData.length
    const clients = userData.filter((u) => u.role === "client").length
    const freelancers = userData.filter((u) => u.role === "freelancer").length
    const emergencyUnits = userData.filter((u) => u.role === "emergency_unit").length
    const admins = userData.filter((u) => u.role === "admin").length
    const verified = userData.filter((u) => u.isVerified && u.isApprovedByAdmin).length
    const pending = userData.filter(
      (u) =>
        (u.role === "freelancer" || u.role === "emergency_unit") &&
        u.documents &&
        (u.documents.nationalID?.status === "pending" ||
          u.documents.certificationFiles?.some((file) => file.status === "pending")),
    ).length

    setStats({ total, clients, freelancers, emergencyUnits, admins, verified, pending })
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setSubmitting(true)
      const result = await userService.deleteUser(userToDelete._id)

      if (result.success) {
        setUsers((prev) => prev.filter((user) => user._id !== userToDelete._id))
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
        setIsDeleteDialogOpen(false)
        setUserToDelete(null)
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
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReviewDocument = async () => {
    if (!documentToReview || !reviewData.status) return

    try {
      setSubmitting(true)
      const result = await userService.reviewDocument({
        userId: documentToReview.userId,
        type: documentToReview.type,
        index: documentToReview.index,
        status: reviewData.status,
        reason: reviewData.reason,
      })

      if (result.success) {
        // Update the user in the list
        setUsers((prev) => prev.map((user) => (user._id === documentToReview.userId ? result.data.user : user)))

        toast({
          title: "Success",
          description: `Document ${reviewData.status} successfully`,
        })

        setIsReviewDialogOpen(false)
        setDocumentToReview(null)
        setReviewData({ status: "", reason: "" })
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
        description: "Failed to review document",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "client":
        return "bg-blue-100 text-blue-800"
      case "freelancer":
        return "bg-green-100 text-green-800"
      case "emergency_unit":
        return "bg-red-100 text-red-800"
      case "admin":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (user) => {
    if (user.role === "client") {
      return user.isVerified ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <Clock className="h-4 w-4 text-yellow-500" />
      )
    } else {
      if (user.isVerified && user.isApprovedByAdmin) {
        return <CheckCircle className="h-4 w-4 text-green-500" />
      } else if (
        user.documents &&
        (user.documents.nationalID?.status === "pending" ||
          user.documents.certificationFiles?.some((file) => file.status === "pending"))
      ) {
        return <Clock className="h-4 w-4 text-orange-500" />
      } else {
        return <XCircle className="h-4 w-4 text-red-500" />
      }
    }
  }

  const getStatusText = (user) => {
    if (user.role === "client") {
      return user.isVerified ? "Verified" : "Pending"
    } else {
      if (user.isVerified && user.isApprovedByAdmin) {
        return "Verified & Approved"
      } else if (
        user.documents &&
        (user.documents.nationalID?.status === "pending" ||
          user.documents.certificationFiles?.some((file) => file.status === "pending"))
      ) {
        return "Documents Pending Review"
      } else {
        return "No Documents Uploaded"
      }
    }
  }

  const filteredUsers = users.filter((user) => {
    // Filter by tab
    if (activeTab === "verified" && (!user.isVerified || !user.isApprovedByAdmin)) return false
    if (
      activeTab === "pending" &&
      !(
        user.documents &&
        (user.documents.nationalID?.status === "pending" ||
          user.documents.certificationFiles?.some((file) => file.status === "pending"))
      )
    )
      return false
    if (activeTab === "freelancers" && user.role !== "freelancer") return false
    if (activeTab === "emergency_units" && user.role !== "emergency_unit") return false

    // Filter by search term
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by role
    const matchesRole = selectedRole === "all" || user.role === selectedRole

    // Filter by status
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "verified" && user.isVerified && user.isApprovedByAdmin) ||
      (selectedStatus === "pending" &&
        user.documents &&
        (user.documents.nationalID?.status === "pending" ||
          user.documents.certificationFiles?.some((file) => file.status === "pending"))) ||
      (selectedStatus === "unverified" && !user.isVerified)

    return matchesSearch && matchesRole && matchesStatus
  })

  const pendingDocuments = users.filter(
    (user) =>
      user.documents &&
      (user.documents.nationalID?.status === "pending" ||
        user.documents.certificationFiles?.some((file) => file.status === "pending")),
  )

  const filterComponent = (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Role</Label>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="mt-2 mobile-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="client">Clients</SelectItem>
            <SelectItem value="freelancer">Freelancers</SelectItem>
            <SelectItem value="emergency_unit">Emergency Units</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">Status</Label>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="mt-2 mobile-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={loadUsers}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage all users in the emergency response system
            </p>
          </div>
          <Button onClick={loadUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Freelancers</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.freelancers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emergency Units</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.emergencyUnits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verified}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Section - Pending Document Reviews */}
        {pendingDocuments.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Priority: Pending Document Reviews ({pendingDocuments.length})
              </CardTitle>
              <CardDescription className="text-orange-700">
                Users who have uploaded documents that require admin review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingDocuments.slice(0, 3).map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.profilePhoto || "/placeholder.svg"} />
                        <AvatarFallback>
                          {user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <Badge className={getRoleColor(user.role)} size="sm">
                          {user.role.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground text-right">
                        <div>Documents pending</div>
                        <div>
                          {user.documents?.nationalID?.status === "pending" && "National ID"}
                          {user.documents?.certificationFiles?.some((f) => f.status === "pending") && " Certifications"}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsViewDialogOpen(true)
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingDocuments.length > 3 && (
                  <div className="text-center">
                    <Button variant="outline" onClick={() => setActiveTab("pending")} className="text-orange-600">
                      View All {pendingDocuments.length} Pending
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs and Search */}
        <div className="space-y-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
              <TabsTrigger value="emergency_units">Units</TabsTrigger>
            </TabsList>
          </Tabs>

          <MobileSearch onSearch={setSearchTerm} placeholder="Search users..." filters={filterComponent} />
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Comprehensive list of all system users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.profilePhoto || "/placeholder.svg"} />
                            <AvatarFallback>
                              {user.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>{user.role.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(user)}
                          <span className="text-sm">{getStatusText(user)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone || "N/A"}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {user.location ? `${user.location.city}, ${user.location.state}` : "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setUserToDelete(user)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                        <p className="text-gray-500">
                          {searchTerm || selectedRole !== "all" || selectedStatus !== "all"
                            ? "Try adjusting your filters"
                            : "No users have been registered yet"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View User Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>Comprehensive user information and document management</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                {/* User Header */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUser.profilePhoto || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {selectedUser.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getRoleColor(selectedUser.role)}>{selectedUser.role.replace("_", " ")}</Badge>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedUser)}
                        <span className="text-sm">{getStatusText(selectedUser)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedUser.phone || "Not provided"}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedUser.email}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {selectedUser.location
                              ? `${selectedUser.location.city}, ${selectedUser.location.state}`
                              : "Not specified"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Joined</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedUser.servicesOffered && selectedUser.servicesOffered.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Services Offered</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedUser.servicesOffered.map((service, index) => (
                            <Badge key={index} variant="secondary">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4">
                    {selectedUser.documents ? (
                      <div className="space-y-4">
                        {/* National ID */}
                        {selectedUser.documents.nationalID && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                National ID
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Badge
                                    className={
                                      selectedUser.documents.nationalID.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : selectedUser.documents.nationalID.status === "rejected"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-orange-100 text-orange-800"
                                    }
                                  >
                                    {selectedUser.documents.nationalID.status}
                                  </Badge>
                                  {selectedUser.documents.nationalID.reviewedAt && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Reviewed:{" "}
                                      {new Date(selectedUser.documents.nationalID.reviewedAt).toLocaleString()}
                                    </p>
                                  )}
                                  {selectedUser.documents.nationalID.reason && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Reason: {selectedUser.documents.nationalID.reason}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  {selectedUser.documents.nationalID.status === "pending" && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-green-600"
                                        onClick={() => {
                                          setDocumentToReview({
                                            userId: selectedUser._id,
                                            type: "nationalID",
                                            index: null,
                                          })
                                          setReviewData({ status: "approved", reason: "" })
                                          setIsReviewDialogOpen(true)
                                        }}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600"
                                        onClick={() => {
                                          setDocumentToReview({
                                            userId: selectedUser._id,
                                            type: "nationalID",
                                            index: null,
                                          })
                                          setReviewData({ status: "rejected", reason: "" })
                                          setIsReviewDialogOpen(true)
                                        }}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Certification Files */}
                        {selectedUser.documents.certificationFiles &&
                          selectedUser.documents.certificationFiles.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Certification Files
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {selectedUser.documents.certificationFiles.map((file, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                      <div>
                                        <div className="font-medium">Certification {index + 1}</div>
                                        <Badge
                                          className={
                                            file.status === "approved"
                                              ? "bg-green-100 text-green-800"
                                              : file.status === "rejected"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-orange-100 text-orange-800"
                                          }
                                        >
                                          {file.status}
                                        </Badge>
                                        {file.reviewedAt && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Reviewed: {new Date(file.reviewedAt).toLocaleString()}
                                          </p>
                                        )}
                                        {file.reason && (
                                          <p className="text-xs text-muted-foreground mt-1">Reason: {file.reason}</p>
                                        )}
                                      </div>
                                      <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                          <Download className="h-4 w-4 mr-1" />
                                          View
                                        </Button>
                                        {file.status === "pending" && (
                                          <>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-green-600"
                                              onClick={() => {
                                                setDocumentToReview({
                                                  userId: selectedUser._id,
                                                  type: "certification",
                                                  index: index,
                                                })
                                                setReviewData({ status: "approved", reason: "" })
                                                setIsReviewDialogOpen(true)
                                              }}
                                            >
                                              <CheckCircle className="h-4 w-4 mr-1" />
                                              Approve
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-red-600"
                                              onClick={() => {
                                                setDocumentToReview({
                                                  userId: selectedUser._id,
                                                  type: "certification",
                                                  index: index,
                                                })
                                                setReviewData({ status: "rejected", reason: "" })
                                                setIsReviewDialogOpen(true)
                                              }}
                                            >
                                              <XCircle className="h-4 w-4 mr-1" />
                                              Reject
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                        <p className="text-gray-500">This user hasn't uploaded any documents yet.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-4">
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Log</h3>
                      <p className="text-gray-500">User activity tracking will be displayed here.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Document Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>{reviewData.status === "approved" ? "Approve Document" : "Reject Document"}</DialogTitle>
              <DialogDescription>
                {reviewData.status === "approved"
                  ? "Approve this document and verify the user"
                  : "Reject this document and provide a reason"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {reviewData.status === "rejected" && (
                <div>
                  <Label htmlFor="reason">Reason for rejection *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a reason for rejecting this document..."
                    value={reviewData.reason}
                    onChange={(e) => setReviewData((prev) => ({ ...prev, reason: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              )}
              {reviewData.status === "approved" && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Approve Document</AlertTitle>
                  <AlertDescription>This will approve the document and mark the user as verified.</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsReviewDialogOpen(false)
                  setDocumentToReview(null)
                  setReviewData({ status: "", reason: "" })
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReviewDocument}
                disabled={submitting || (reviewData.status === "rejected" && !reviewData.reason.trim())}
                className={
                  reviewData.status === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {reviewData.status === "approved" ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    {reviewData.status === "approved" ? "Approve" : "Reject"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This will permanently delete the user and all associated data from the system.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setUserToDelete(null)
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser} disabled={submitting}>
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PullToRefresh>
  )
}
