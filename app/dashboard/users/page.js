"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Search, Eye, CheckCircle, XCircle, Clock, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [pendingVerifications, setPendingVerifications] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedUser, setSelectedUser] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate fetching users with document upload status
    const allUsers = [
      {
        _id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        role: "client",
        isVerified: true,
        isApprovedByAdmin: true,
        hasUploadedDocuments: false,
        createdAt: "2024-01-15T10:30:00Z",
        location: { city: "New York", state: "NY" },
      },
      {
        _id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+1234567891",
        role: "freelancer",
        isVerified: false,
        isApprovedByAdmin: false,
        hasUploadedDocuments: true,
        documentsUploadedAt: "2024-01-14T14:20:00Z",
        createdAt: "2024-01-14T14:20:00Z",
        location: { city: "Los Angeles", state: "CA" },
        servicesOffered: ["nurse", "first-aid"],
        documents: {
          nationalID: "/uploads/jane-national-id.pdf",
          certificationFiles: ["/uploads/jane-cert1.pdf", "/uploads/jane-cert2.pdf"],
        },
      },
      {
        _id: "3",
        name: "Emergency Unit Alpha",
        email: "alpha@emergency.com",
        phone: "+1234567892",
        role: "emergency_unit",
        isVerified: true,
        isApprovedByAdmin: true,
        hasUploadedDocuments: true,
        documentsUploadedAt: "2024-01-13T09:15:00Z",
        createdAt: "2024-01-13T09:15:00Z",
        location: { city: "Chicago", state: "IL" },
        servicesOffered: ["ambulance", "fire", "rescue"],
        documents: {
          nationalID: "/uploads/alpha-national-id.pdf",
          certificationFiles: ["/uploads/alpha-cert1.pdf"],
        },
      },
      {
        _id: "4",
        name: "Mike Johnson",
        email: "mike@freelancer.com",
        phone: "+1234567893",
        role: "freelancer",
        isVerified: false,
        isApprovedByAdmin: false,
        hasUploadedDocuments: true,
        documentsUploadedAt: "2024-01-12T16:30:00Z",
        createdAt: "2024-01-12T16:30:00Z",
        location: { city: "Miami", state: "FL" },
        servicesOffered: ["paramedic", "first-aid"],
        documents: {
          nationalID: "/uploads/mike-national-id.pdf",
          certificationFiles: ["/uploads/mike-cert1.pdf"],
        },
      },
      {
        _id: "5",
        name: "Sarah Wilson",
        email: "sarah@emergency.com",
        phone: "+1234567894",
        role: "emergency_unit",
        isVerified: false,
        isApprovedByAdmin: false,
        hasUploadedDocuments: false,
        createdAt: "2024-01-11T11:45:00Z",
        location: { city: "Seattle", state: "WA" },
        servicesOffered: ["fire", "rescue"],
      },
    ]

    setUsers(allUsers)

    // Filter and sort pending verifications
    const pending = allUsers
      .filter(
        (user) =>
          (user.role === "freelancer" || user.role === "emergency_unit") &&
          user.hasUploadedDocuments &&
          !user.isVerified,
      )
      .sort((a, b) => new Date(b.documentsUploadedAt) - new Date(a.documentsUploadedAt))

    setPendingVerifications(pending)
  }, [])

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = selectedRole === "all" || user.role === selectedRole
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "verified" && user.isVerified) ||
        (selectedStatus === "pending" && !user.isVerified && user.hasUploadedDocuments) ||
        (selectedStatus === "approved" && user.isApprovedByAdmin) ||
        (selectedStatus === "unapproved" && !user.isApprovedByAdmin) ||
        (selectedStatus === "documents_uploaded" && user.hasUploadedDocuments) ||
        (selectedStatus === "no_documents" && !user.hasUploadedDocuments)
      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => {
      // Prioritize users with uploaded documents who need verification
      if (
        (a.role === "freelancer" || a.role === "emergency_unit") &&
        (b.role === "freelancer" || b.role === "emergency_unit")
      ) {
        // First priority: Users with documents uploaded but not verified
        const aPriority = a.hasUploadedDocuments && !a.isVerified
        const bPriority = b.hasUploadedDocuments && !b.isVerified

        if (aPriority && !bPriority) return -1
        if (!aPriority && bPriority) return 1

        // Second priority: Sort by document upload date (newest first)
        if (aPriority && bPriority) {
          return new Date(b.documentsUploadedAt) - new Date(a.documentsUploadedAt)
        }
      }

      // Default sort by creation date
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  const handleVerifyUser = async (userId, action) => {
    try {
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? {
                ...user,
                isVerified: action === "verify",
                isApprovedByAdmin: action === "verify",
              }
            : user,
        ),
      )

      // Update pending verifications list
      if (action === "verify") {
        setPendingVerifications((prev) => prev.filter((user) => user._id !== userId))
      }

      toast({
        title: "Success",
        description: `User ${action === "verify" ? "verified" : "rejected"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      })
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
      } else if (user.hasUploadedDocuments && !user.isVerified) {
        return <Clock className="h-4 w-4 text-orange-500" />
      } else if (!user.hasUploadedDocuments) {
        return <XCircle className="h-4 w-4 text-red-500" />
      } else {
        return <Clock className="h-4 w-4 text-yellow-500" />
      }
    }
  }

  const getStatusText = (user) => {
    if (user.role === "client") {
      return user.isVerified ? "Verified" : "Pending"
    } else {
      if (user.isVerified && user.isApprovedByAdmin) {
        return "Verified & Approved"
      } else if (user.hasUploadedDocuments && !user.isVerified) {
        return "Documents Uploaded - Needs Verification"
      } else if (!user.hasUploadedDocuments) {
        return "No Documents Uploaded"
      } else {
        return "Pending Verification"
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage all users in the emergency response system</p>
        </div>
      </div>

      {/* Priority Section - Pending Verifications */}
      {pendingVerifications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Priority: Pending Verifications ({pendingVerifications.length})
            </CardTitle>
            <CardDescription className="text-orange-700">
              Users who have uploaded documents and are waiting for verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingVerifications.slice(0, 3).map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user.profilePhoto || "/placeholder.svg"} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
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
                      <div>Documents uploaded</div>
                      <div>{new Date(user.documentsUploadedAt).toLocaleDateString()}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyUser(user._id, "verify")}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verify
                    </Button>
                  </div>
                </div>
              ))}
              {pendingVerifications.length > 3 && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => setSelectedStatus("pending")} className="text-orange-600">
                    View All {pendingVerifications.length} Pending
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.role === "client").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Freelancers</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.role === "freelancer").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Units</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.role === "emergency_unit").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-48">
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
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending Verification</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="unapproved">Unapproved</SelectItem>
            <SelectItem value="documents_uploaded">Documents Uploaded</SelectItem>
            <SelectItem value="no_documents">No Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.profilePhoto || "/placeholder.svg"} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
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
                  <TableCell>{user.location ? `${user.location.city}, ${user.location.state}` : "N/A"}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
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
                      {(user.role === "freelancer" || user.role === "emergency_unit") &&
                        user.hasUploadedDocuments &&
                        !user.isVerified && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyUser(user._id, "verify")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Detailed information about the user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.profilePhoto || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <Badge className={getRoleColor(selectedUser.role)}>{selectedUser.role.replace("_", " ")}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedUser)}
                    <span className="text-sm">{getStatusText(selectedUser)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.location ? `${selectedUser.location.city}, ${selectedUser.location.state}` : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Joined</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {selectedUser.servicesOffered && (
                <div>
                  <Label className="text-sm font-medium">Services Offered</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedUser.servicesOffered.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedUser && selectedUser.documents && (
                <div>
                  <Label className="text-sm font-medium">Documents</Label>
                  <div className="space-y-2 mt-1">
                    {selectedUser.documents.nationalID && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">National ID</span>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    )}
                    {selectedUser.documents.certificationFiles?.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Certification {index + 1}</span>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                  {selectedUser.documentsUploadedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Uploaded: {new Date(selectedUser.documentsUploadedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {(selectedUser?.role === "freelancer" || selectedUser?.role === "emergency_unit") &&
              selectedUser.hasUploadedDocuments &&
              !selectedUser.isVerified && (
                <Button
                  onClick={() => {
                    handleVerifyUser(selectedUser._id, "verify")
                    setIsViewDialogOpen(false)
                  }}
                >
                  Verify User
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
