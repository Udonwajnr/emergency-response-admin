"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  MapPin,
  Trash2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { emergencyService } from "@/services/emergencyService";
import { userService } from "@/services/userService";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { MobileSearch } from "@/components/mobile-search";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

export default function EmergenciesPage() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [emergencyToDelete, setEmergencyToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { toast } = useToast();

  const loadEmergencies = async () => {
    try {
      setLoading(true);
      const result = await emergencyService.getEmergencies();

      if (result.success) {
        setEmergencies(result.data);

        // Fetch user details for each unique userId
        const userIds = [
          ...new Set(result.data.map((emergency) => emergency.userId)),
        ];
        const userMap = {};

        for (const userId of userIds) {
          const userResult = await userService.getUserById(userId);
          if (userResult.success) {
            userMap[userId] = userResult.data;
          }
        }

        setUsers(userMap);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load emergencies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmergencies();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedType, activeTab]);

  const handleResolveEmergency = async (emergencyId) => {
    try {
      setSubmitting(true);
      const result = await emergencyService.resolveEmergency(emergencyId);

      if (result.success) {
        setEmergencies((prev) =>
          prev.map((emergency) =>
            emergency._id === emergencyId
              ? { ...emergency, status: "resolved", resolvedAt: new Date() }
              : emergency
          )
        );

        toast({
          title: "Success",
          description: "Emergency marked as resolved",
        });

        setIsViewDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve emergency",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmergency = async () => {
    if (!emergencyToDelete) return;

    try {
      setSubmitting(true);
      const result = await emergencyService.deleteEmergency(
        emergencyToDelete._id
      );

      if (result.success) {
        setEmergencies((prev) =>
          prev.filter((emergency) => emergency._id !== emergencyToDelete._id)
        );

        toast({
          title: "Success",
          description: "Emergency deleted successfully",
        });

        setIsDeleteDialogOpen(false);
        setEmergencyToDelete(null);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete emergency",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-red-100 text-red-800">Active</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case "accepted":
        return <Badge className="bg-blue-100 text-blue-800">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-gray-100 text-gray-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "accepted":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Filter emergencies based on search and filters
  const filteredEmergencies = useMemo(() => {
    return emergencies.filter((emergency) => {
      // Filter by tab
      if (activeTab !== "all" && emergency.status !== activeTab) {
        return false;
      }

      // Filter by search term
      const matchesSearch =
        emergency.emergencyType
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        emergency.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        emergency.location?.address
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Filter by status
      const matchesStatus =
        selectedStatus === "all" || emergency.status === selectedStatus;

      // Filter by type
      const matchesType =
        selectedType === "all" || emergency.emergencyType === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [emergencies, searchTerm, selectedStatus, selectedType, activeTab]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmergencies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmergencies = filteredEmergencies.slice(startIndex, endIndex);

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Get unique emergency types for filter
  const emergencyTypes = [
    ...new Set(emergencies.map((emergency) => emergency.emergencyType)),
  ].filter(Boolean);

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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">Emergency Type</Label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="mt-2 mobile-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {emergencyTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">Items per page</Label>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => setItemsPerPage(Number(value))}
        >
          <SelectTrigger className="mt-2 mobile-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="25">25 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={loadEmergencies}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Emergency Management
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Monitor and manage emergency incidents
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Emergencies
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emergencies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {emergencies.filter((e) => e.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {emergencies.filter((e) => e.status === "accepted").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {emergencies.filter((e) => e.status === "resolved").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Search */}
        <div className="space-y-4">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>

          <MobileSearch
            onSearch={setSearchTerm}
            placeholder="Search emergencies..."
            filters={filterComponent}
          />
        </div>

        {/* Emergencies Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Emergencies ({filteredEmergencies.length})
                </CardTitle>
                <CardDescription>
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredEmergencies.length)} of{" "}
                  {filteredEmergencies.length} emergencies
                </CardDescription>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="hidden sm:flex"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="hidden sm:flex"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmergencies.length > 0 ? (
                  paginatedEmergencies.map((emergency) => (
                    <TableRow key={emergency._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={
                                users[emergency.userId]?.profilePhoto ||
                                "/placeholder.svg"
                              }
                            />
                            <AvatarFallback>
                              {users[emergency.userId]?.name
                                ? users[emergency.userId].name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {users[emergency.userId]?.name || "Unknown User"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {users[emergency.userId]?.phone || "No phone"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {emergency.emergencyType || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Triggered by: {emergency.triggeredBy || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm truncate max-w-[150px]">
                            {emergency.location?.address || "Unknown location"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(emergency.status)}
                          <span>{getStatusBadge(emergency.status)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {emergency.createdAt
                            ? format(
                                new Date(emergency.createdAt),
                                "MMM d, yyyy h:mm a"
                              )
                            : "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEmergency(emergency);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setEmergencyToDelete(emergency);
                              setIsDeleteDialogOpen(true);
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
                        <AlertTriangle className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          No emergencies found
                        </h3>
                        <p className="text-gray-500">
                          {searchTerm ||
                          selectedStatus !== "all" ||
                          selectedType !== "all"
                            ? "Try adjusting your filters"
                            : "No emergency incidents have been reported yet"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Bottom Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredEmergencies.length)} of{" "}
                  {filteredEmergencies.length} emergencies
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="hidden sm:flex"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="hidden sm:flex"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Emergency Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Emergency Details</DialogTitle>
              <DialogDescription>
                Detailed information about the emergency incident
              </DialogDescription>
            </DialogHeader>
            {selectedEmergency && (
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedEmergency.status)}
                    <span className="text-lg font-medium">
                      {selectedEmergency.emergencyType ||
                        "Unknown Emergency Type"}
                    </span>
                  </div>
                  {getStatusBadge(selectedEmergency.status)}
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={
                        users[selectedEmergency.userId]?.profilePhoto ||
                        "/placeholder.svg"
                      }
                      alt="User"
                    />
                    <AvatarFallback>
                      {users[selectedEmergency.userId]?.name
                        ? users[selectedEmergency.userId].name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {users[selectedEmergency.userId]?.name || "Unknown User"}
                    </h3>
                    <p className="text-muted-foreground">
                      {users[selectedEmergency.userId]?.phone || "No phone"}
                    </p>
                    <p className="text-muted-foreground">
                      {users[selectedEmergency.userId]?.email || "No email"}
                    </p>
                  </div>
                </div>

                {/* Emergency Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Emergency Type
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedEmergency.emergencyType || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Triggered By</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedEmergency.triggeredBy || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created At</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedEmergency.createdAt
                        ? format(
                            new Date(selectedEmergency.createdAt),
                            "MMM d, yyyy h:mm a"
                          )
                        : "Unknown"}
                    </p>
                  </div>
                  {selectedEmergency.resolvedAt && (
                    <div>
                      <Label className="text-sm font-medium">Resolved At</Label>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(selectedEmergency.resolvedAt),
                          "MMM d, yyyy h:mm a"
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>
                        {selectedEmergency.location?.address ||
                          "Unknown location"}
                      </span>
                    </div>
                    {selectedEmergency.location?.coordinates && (
                      <div className="aspect-video relative rounded-md overflow-hidden">
                        <iframe
                          title="Emergency Location"
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${selectedEmergency.location.coordinates[1]},${selectedEmergency.location.coordinates[0]}`}
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedEmergency.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedEmergency.description}
                    </p>
                  </div>
                )}

                {/* Images */}
                {selectedEmergency.images &&
                  selectedEmergency.images.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Images</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {selectedEmergency.images.map((image, index) => (
                          <div
                            key={index}
                            className="aspect-square rounded-md overflow-hidden"
                          >
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Emergency ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Responders */}
                {selectedEmergency.responders &&
                  selectedEmergency.responders.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Responders</Label>
                      <div className="space-y-2 mt-2">
                        {selectedEmergency.responders.map(
                          (responderId, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                            >
                              <Avatar>
                                <AvatarFallback>R{index + 1}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  Responder {index + 1}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ID: {responderId}
                                </div>
                              </div>
                              {selectedEmergency.assignedResponderId ===
                                responderId && (
                                <Badge className="ml-auto bg-blue-100 text-blue-800">
                                  Primary
                                </Badge>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Action Buttons */}
                {selectedEmergency.status === "active" && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">
                      Active Emergency
                    </AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      This emergency is currently active and requires attention.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
                className="mobile-button"
              >
                Close
              </Button>
              {selectedEmergency && selectedEmergency.status === "active" && (
                <Button
                  onClick={() => handleResolveEmergency(selectedEmergency._id)}
                  className="mobile-button bg-green-600 hover:bg-green-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Resolved
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Delete Emergency</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this emergency record?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This action cannot be undone. This will permanently delete the
                  emergency record from the database.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setEmergencyToDelete(null);
                }}
                className="mobile-button"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteEmergency}
                className="mobile-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Emergency"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PullToRefresh>
  );
}
