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
import { Switch } from "@/components/ui/switch"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Shield,
  Trash2,
  Activity,
  XCircle,
  FileText,
  Calendar,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { emergencyUnitService } from "@/services/emergencyUnitService"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { MobileSearch } from "@/components/mobile-search"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EmergencyUnitsPage() {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedService, setSelectedService] = useState("all")
  const [selectedAvailability, setSelectedAvailability] = useState("all")
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    available: 0,
    pending: 0,
  })
  const { toast } = useToast()

  const loadUnits = async () => {
    try {
      setLoading(true)
      const result = await emergencyUnitService.getEmergencyUnits()

      if (result.success) {
        // Filter only emergency units from users
        const emergencyUnits = result.data.filter((user) => user.role === "emergency_unit")
        setUnits(emergencyUnits)

        // Calculate stats
        const totalUnits = emergencyUnits.length
        const verifiedUnits = emergencyUnits.filter((unit) => unit.isVerified && unit.isApprovedByAdmin).length
        const availableUnits = emergencyUnits.filter((unit) => unit.availabilityStatus).length
        const pendingUnits = emergencyUnits.filter((unit) => unit.hasUploadedDocuments && !unit.isVerified).length

        setStats({
          total: totalUnits,
          verified: verifiedUnits,
          available: availableUnits,
          pending: pendingUnits,
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
        description: "Failed to load emergency units",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUnits()
  }, [])

  const handleVerifyUnit = async (unitId, action) => {
    try {
      setSubmitting(true)
      const result = await emergencyUnitService.verifyEmergencyUnit(unitId, action)

      if (result.success) {
        setUnits((prev) =>
          prev.map((unit) =>
            unit._id === unitId
              ? {
                  ...unit,
                  isVerified: action === "verify",
                  isApprovedByAdmin: action === "verify",
                }
              : unit,
          ),
        )

        toast({
          title: "Success",
          description: `Emergency unit ${action === "verify" ? "verified" : "rejected"} successfully`,
        })

        setIsViewDialogOpen(false)
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
        description: `Failed to ${action} emergency unit`,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleAvailability = async (unitId, currentStatus) => {
    try {
      const newStatus = !currentStatus
      const result = await emergencyUnitService.toggleAvailability(unitId, newStatus)

      if (result.success) {
        setUnits((prev) =>
          prev.map((unit) => (unit._id === unitId ? { ...unit, availabilityStatus: newStatus } : unit)),
        )

        toast({
          title: "Success",
          description: `Availability status updated to ${newStatus ? "available" : "unavailable"}`,
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
        description: "Failed to update availability status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUnit = async () => {
    if (!unitToDelete) return

    try {
      setSubmitting(true)
      const result = await emergencyUnitService.deleteEmergencyUnit(unitToDelete._id)

      if (result.success) {
        setUnits((prev) => prev.filter((unit) => unit._id !== unitToDelete._id))

        toast({
          title: "Success",
          description: "Emergency unit deleted successfully",
        })

        setIsDeleteDialogOpen(false)
        setUnitToDelete(null)
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
        description: "Failed to delete emergency unit",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (unit) => {
    if (unit.isVerified && unit.isApprovedByAdmin) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>
    } else if (unit.hasUploadedDocuments && !unit.isVerified) {
      return <Badge className="bg-orange-100 text-orange-800">Pending Verification</Badge>
    } else if (!unit.hasUploadedDocuments) {
      return <Badge className="bg-red-100 text-red-800">No Documents</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Unverified</Badge>
    }
  }

  const getStatusIcon = (unit) => {
    if (unit.isVerified && unit.isApprovedByAdmin) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (unit.hasUploadedDocuments && !unit.isVerified) {
      return <Clock className="h-4 w-4 text-orange-500" />
    } else if (!unit.hasUploadedDocuments) {
      return <XCircle className="h-4 w-4 text-red-500" />
    } else {
      return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredUnits = units.filter((unit) => {
    // Filter by tab
    if (activeTab === "verified" && (!unit.isVerified || !unit.isApprovedByAdmin)) return false
    if (activeTab === "pending" && (!unit.hasUploadedDocuments || unit.isVerified)) return false
    if (activeTab === "available" && !unit.availabilityStatus) return false

    // Filter by search term
    const matchesSearch =
      unit.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.servicesOffered?.some((service) => service.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filter by status
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "verified" && unit.isVerified && unit.isApprovedByAdmin) ||
      (selectedStatus === "pending" && unit.hasUploadedDocuments && !unit.isVerified) ||
      (selectedStatus === "unverified" && !unit.isVerified)

    // Filter by service
    const matchesService = selectedService === "all" || unit.servicesOffered?.includes(selectedService)

    // Filter by availability
    const matchesAvailability =
      selectedAvailability === "all" ||
      (selectedAvailability === "available" && unit.availabilityStatus) ||
      (selectedAvailability === "unavailable" && !unit.availabilityStatus)

    return matchesSearch && matchesStatus && matchesService && matchesAvailability
  })

  // Get unique services for filter
  const allServices = units.flatMap((unit) => unit.servicesOffered || [])
  const uniqueServices = [...new Set(allServices)].filter(Boolean)

  const filterComponent = (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Status</Label>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="mt-2 mobile-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending Verification</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">Service Type</Label>
        <Select value={selectedService} onValueChange={setSelectedService}>
          <SelectTrigger className="mt-2 mobile-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {uniqueServices.map((service) => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">Availability</Label>
        <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
          <SelectTrigger className="mt-2 mobile-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
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
    <PullToRefresh onRefresh={loadUnits}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Emergency Units</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage emergency response units and their availability
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
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
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.available}</div>
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

        {/* Tabs and Search */}
        <div className="space-y-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="available">Available</TabsTrigger>
            </TabsList>
          </Tabs>

          <MobileSearch onSearch={setSearchTerm} placeholder="Search emergency units..." filters={filterComponent} />
        </div>

        {/* Priority Section - Pending Verifications */}
        {stats.pending > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Priority: Pending Verifications ({stats.pending})
              </CardTitle>
              <CardDescription className="text-orange-700">
                Emergency units that have uploaded documents and are waiting for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {units
                  .filter((unit) => unit.hasUploadedDocuments && !unit.isVerified)
                  .slice(0, 3)
                  .map((unit) => (
                    <div key={unit._id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={unit.profilePhoto || "/placeholder.svg"} />
                          <AvatarFallback>
                            {unit.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{unit.name}</div>
                          <div className="text-sm text-muted-foreground">{unit.email}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {unit.servicesOffered?.slice(0, 2).map((service, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground text-right">
                          <div>Documents uploaded</div>
                          <div>
                            {unit.documentsUploadedAt && new Date(unit.documentsUploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyUnit(unit._id, "verify")}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Units Table */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Units</CardTitle>
            <CardDescription>List of all emergency response units</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.length > 0 ? (
                  filteredUnits.map((unit) => (
                    <TableRow key={unit._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={unit.profilePhoto || "/placeholder.svg"} />
                            <AvatarFallback>
                              {unit.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{unit.name}</div>
                            <div className="text-sm text-muted-foreground">{unit.email}</div>
                            <div className="text-sm text-muted-foreground">{unit.phone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {unit.servicesOffered?.slice(0, 2).map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {unit.servicesOffered?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{unit.servicesOffered.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {unit.location ? `${unit.location.city}, ${unit.location.state}` : "Not specified"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(unit)}
                          <span>{getStatusBadge(unit)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={unit.availabilityStatus || false}
                            onCheckedChange={() => handleToggleAvailability(unit._id, unit.availabilityStatus)}
                            disabled={!unit.isVerified || !unit.isApprovedByAdmin}
                          />
                          <span className="text-sm">{unit.availabilityStatus ? "Available" : "Unavailable"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUnit(unit)
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
                              setUnitToDelete(unit)
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
                        <Shield className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No emergency units found</h3>
                        <p className="text-gray-500">
                          {searchTerm || selectedStatus !== "all" || selectedService !== "all"
                            ? "Try adjusting your filters"
                            : "No emergency units have been registered yet"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Unit Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Emergency Unit Details</DialogTitle>
              <DialogDescription>Detailed information about the emergency unit</DialogDescription>
            </DialogHeader>
            {selectedUnit && (
              <div className="space-y-6">
                {/* Unit Header */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUnit.profilePhoto || "/placeholder.svg"} alt="Unit" />
                    <AvatarFallback className="text-lg">
                      {selectedUnit.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{selectedUnit.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedUnit)}
                      <span>{getStatusBadge(selectedUnit)}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        checked={selectedUnit.availabilityStatus || false}
                        onCheckedChange={() =>
                          handleToggleAvailability(selectedUnit._id, selectedUnit.availabilityStatus)
                        }
                        disabled={!selectedUnit.isVerified || !selectedUnit.isApprovedByAdmin}
                      />
                      <span className="text-sm">{selectedUnit.availabilityStatus ? "Available" : "Unavailable"}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedUnit.email}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedUnit.phone}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {selectedUnit.location
                          ? `${selectedUnit.location.city}, ${selectedUnit.location.state}`
                          : "Not specified"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Joined</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {selectedUnit.createdAt && new Date(selectedUnit.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Services Offered */}
                {selectedUnit.servicesOffered && selectedUnit.servicesOffered.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Services Offered</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedUnit.servicesOffered.map((service, index) => (
                        <Badge key={index} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {selectedUnit.documents && (
                  <div>
                    <Label className="text-sm font-medium">Documents</Label>
                    <div className="space-y-2 mt-2">
                      {selectedUnit.documents.nationalID && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">National ID</span>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      )}
                      {selectedUnit.documents.certificationFiles?.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Certification {index + 1}</span>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                    {selectedUnit.documentsUploadedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Uploaded: {new Date(selectedUnit.documentsUploadedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Verification Status */}
                {selectedUnit.hasUploadedDocuments && !selectedUnit.isVerified && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Pending Verification</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      This emergency unit has uploaded documents and is waiting for verification.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="mobile-button">
                Close
              </Button>
              {selectedUnit && selectedUnit.hasUploadedDocuments && !selectedUnit.isVerified && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleVerifyUnit(selectedUnit._id, "reject")}
                    className="mobile-button text-red-600 hover:text-red-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleVerifyUnit(selectedUnit._id, "verify")}
                    className="mobile-button bg-green-600 hover:bg-green-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Verify
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Delete Emergency Unit</DialogTitle>
              <DialogDescription>Are you sure you want to delete this emergency unit?</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This action cannot be undone. This will permanently delete the emergency unit from the system.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setUnitToDelete(null)
                }}
                className="mobile-button"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUnit} className="mobile-button" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Unit"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PullToRefresh>
  )
}
