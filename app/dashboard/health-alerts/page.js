"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Activity,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Scan,
  RefreshCw,
  Calendar,
  Stethoscope,
} from "lucide-react"
import { healthAlertService } from "@/services/health-alert-service"
import { useToast } from "@/hooks/use-toast"
// Remove the cronService import since we're using healthAlertService for everything

export default function HealthAlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [activeTab, setActiveTab] = useState("active")
  const { toast } = useToast()

  const [cronStatus, setCronStatus] = useState(null)
  const [cronLoading, setCronLoading] = useState(false)

  useEffect(() => {
    loadAlerts()
  }, [activeTab])

  useEffect(() => {
    loadCronStatus()
  }, [])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const resolved = activeTab === "resolved"
      const data = await healthAlertService.getHealthAlerts(resolved)
      setAlerts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load health alerts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const triggerScan = async () => {
    try {
      setScanning(true)
      const result = await healthAlertService.triggerHealthScan()
      setScanResult(result)

      if (result.alerts && result.alerts.length > 0) {
        toast({
          title: "Scan Complete",
          description: `${result.alerts.length} new health alerts detected`,
        })
        loadAlerts() // Refresh the alerts list
      } else {
        toast({
          title: "Scan Complete",
          description: "No new health risks detected",
        })
      }
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Failed to perform health risk scan",
        variant: "destructive",
      })
    } finally {
      setScanning(false)
    }
  }

  const resolveAlert = async (alertId) => {
    try {
      await healthAlertService.resolveAlert(alertId)
      toast({
        title: "Alert Resolved",
        description: "Health alert has been marked as resolved",
      })
      loadAlerts()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getAlertSeverity = (description) => {
    const lowerDesc = description.toLowerCase()
    if (lowerDesc.includes("urgent") || lowerDesc.includes("severe") || lowerDesc.includes("critical")) {
      return "high"
    } else if (lowerDesc.includes("moderate") || lowerDesc.includes("concern")) {
      return "medium"
    }
    return "low"
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const loadCronStatus = async () => {
    try {
      setCronLoading(true)
      const status = await healthAlertService.getCronStatus()
      setCronStatus(status)
    } catch (error) {
      console.error("Failed to load cron status:", error)
      // Set default status if API fails
      setCronStatus({
        isRunning: true,
        nextRun: healthAlertService.calculateNextRun(),
        schedule: "Every 6 hours",
        timezone: "UTC",
      })
    } finally {
      setCronLoading(false)
    }
  }

  const toggleCron = async () => {
    try {
      if (cronStatus?.isRunning) {
        await healthAlertService.stopCron()
        toast({
          title: "Cron Stopped",
          description: "Automatic health scanning has been stopped",
          variant: "destructive",
        })
      } else {
        await healthAlertService.startCron()
        toast({
          title: "Cron Started",
          description: "Automatic health scanning has been started",
        })
      }
      loadCronStatus() // Refresh status
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to control cron job",
        variant: "destructive",
      })
    }
  }

  const formatNextRun = (dateString) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m`
    } else {
      return "Soon"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Alerts</h1>
          <p className="text-muted-foreground">Monitor and manage health risk alerts from telemedicine sessions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAlerts} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={triggerScan} disabled={scanning}>
            {scanning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Scan className="h-4 w-4 mr-2" />}
            {scanning ? "Scanning..." : "Trigger Scan"}
          </Button>
        </div>
      </div>

      {/* Scan Result Alert */}
      {scanResult && (
        <Alert
          className={
            scanResult.alerts && scanResult.alerts.length > 0
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Scan Results</AlertTitle>
          <AlertDescription>{scanResult.message}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter((a) => !a.resolved).length}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                alerts.filter((a) => a.resolved && new Date(a.createdAt).toDateString() === new Date().toDateString())
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Resolved in last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Scanner</CardTitle>
            <Activity className={`h-4 w-4 ${cronStatus?.isRunning ? "text-green-500" : "text-red-500"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cronStatus?.isRunning ? "text-green-600" : "text-red-600"}`}>
              {cronLoading ? "..." : cronStatus?.isRunning ? "Active" : "Stopped"}
            </div>
            <p className="text-xs text-muted-foreground">
              {cronStatus?.isRunning ? "Scanning every 6 hours" : "Manual scans only"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Auto Scan</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cronLoading ? "..." : cronStatus?.isRunning ? formatNextRun(cronStatus?.nextRun) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {cronStatus?.isRunning ? "Time remaining" : "Auto scan disabled"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add this new Cron Control Card before the Alerts Tabs */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Automatic Health Scanning
          </CardTitle>
          <CardDescription>
            The system automatically scans telemedicine sessions every 6 hours to detect health risk clusters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className={cronStatus?.isRunning ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {cronStatus?.isRunning ? "🟢 RUNNING" : "🔴 STOPPED"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Schedule: Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
                </span>
              </div>
              {cronStatus?.isRunning && (
                <p className="text-sm text-muted-foreground">
                  Next automatic scan in: <strong>{formatNextRun(cronStatus?.nextRun)}</strong>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={toggleCron}
                variant={cronStatus?.isRunning ? "destructive" : "default"}
                size="sm"
                disabled={cronLoading}
              >
                {cronLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : cronStatus?.isRunning ? (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Stop Auto Scan
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Start Auto Scan
                  </>
                )}
              </Button>
              <Button onClick={loadCronStatus} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="resolved">Resolved Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading alerts...
            </div>
          ) : alerts.filter((a) => !a.resolved).length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Active Alerts</h3>
                  <p className="text-muted-foreground">All health alerts have been resolved</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts
                .filter((a) => !a.resolved)
                .map((alert) => {
                  const severity = getAlertSeverity(alert.description)
                  return (
                    <Card key={alert._id} className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(severity)}>{severity.toUpperCase()} PRIORITY</Badge>
                              <Badge variant="outline">
                                <MapPin className="h-3 w-3 mr-1" />
                                {alert.radiusInKm}km radius
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">{alert.address}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {formatDate(alert.createdAt)}
                            </CardDescription>
                          </div>
                          <Button onClick={() => resolveAlert(alert._id)} size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Alert Description</h4>
                            <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">{alert.description}</p>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Location
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Lat: {alert.location.coordinates[1].toFixed(6)}
                                <br />
                                Lng: {alert.location.coordinates[0].toFixed(6)}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" />
                                Sessions Involved
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {alert.triggeredBy.length} telemedicine sessions
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading resolved alerts...
            </div>
          ) : alerts.filter((a) => a.resolved).length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Resolved Alerts</h3>
                  <p className="text-muted-foreground">No alerts have been resolved yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts
                .filter((a) => a.resolved)
                .map((alert) => (
                  <Card key={alert._id} className="border-l-4 border-l-green-500 opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800 border-green-200">RESOLVED</Badge>
                            <Badge variant="outline">
                              <MapPin className="h-3 w-3 mr-1" />
                              {alert.radiusInKm}km radius
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{alert.address}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {formatDate(alert.createdAt)}
                          </CardDescription>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">{alert.description}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
