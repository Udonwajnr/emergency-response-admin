"use client";

import { useState, useEffect } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Heart,
  AlertTriangle,
  UserCheck,
  Clock,
  ChevronRight,
  Activity,
  Shield,
  FileText,
} from "lucide-react";
import { MobileCard } from "@/components/mobile-card";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { emergencyService } from "@/services/emergencyService";
import { emergencyUnitService } from "@/services/emergencyUnitService";
import { firstAidService } from "@/services/firstAidService";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalUsers: 0,
    clients: 0,
    freelancers: 0,
    emergencyUnits: 0,
    firstAidGuides: 0,
    pendingApprovals: 0,
    activeEmergencies: 0,
    resolvedEmergencies: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        usersResponse,
        emergenciesResponse,
        emergencyUnitsResponse,
        firstAidResponse,
      ] = await Promise.all([
        userService.getUsers(),
        emergencyService.getEmergencies(),
        emergencyUnitService.getEmergencyUnits(),
        firstAidService.getGuides(),
      ]);

      // Process users data
      const users = usersResponse.data || [];
      const clients = users.filter((user) => user.role === "client");
      const freelancers = users.filter((user) => user.role === "freelancer");
      const pendingUsers = users.filter((user) => user.status === "pending");

      // Process emergencies data
      const emergencies = emergenciesResponse.data || [];
      const activeEmergencies = emergencies.filter(
        (emergency) =>
          emergency.status === "active" || emergency.status === "in_progress"
      );
      const resolvedEmergencies = emergencies.filter(
        (emergency) =>
          emergency.status === "resolved" || emergency.status === "completed"
      );

      // Process emergency units data
      const emergencyUnits = emergencyUnitsResponse.data || [];
      const activeUnits = emergencyUnits.filter(
        (unit) => unit.status === "active"
      );

      // Process first aid guides data
      const firstAidGuides = firstAidResponse.data || [];
      const publishedGuides = firstAidGuides.filter(
        (guide) => guide.status === "published"
      );

      // Update stats
      setStats({
        totalUsers: users.length,
        clients: clients.length,
        freelancers: freelancers.length,
        emergencyUnits: activeUnits.length,
        firstAidGuides: publishedGuides.length,
        pendingApprovals: pendingUsers.length,
        activeEmergencies: activeEmergencies.length,
        resolvedEmergencies: resolvedEmergencies.length,
      });

      // Generate recent activity from real data
      const activities = [];

      // Add recent user registrations
      const recentUsers = users
        .filter((user) => {
          const createdAt = new Date(user.created_at || user.createdAt);
          const now = new Date();
          const diffHours = (now - createdAt) / (1000 * 60 * 60);
          return diffHours <= 24;
        })
        .sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt) -
            new Date(a.created_at || a.createdAt)
        )
        .slice(0, 3);

      recentUsers.forEach((user) => {
        const timeAgo = getTimeAgo(new Date(user.created_at || user.createdAt));
        activities.push({
          id: `user_${user.id}`,
          type: "user_registered",
          message: `New ${user.role} registered: ${user.name || user.email}`,
          time: timeAgo,
        });
      });

      // Add recent emergencies
      const recentEmergencies = emergencies
        .sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt) -
            new Date(a.created_at || a.createdAt)
        )
        .slice(0, 2);

      recentEmergencies.forEach((emergency) => {
        const timeAgo = getTimeAgo(
          new Date(emergency.created_at || emergency.createdAt)
        );
        activities.push({
          id: `emergency_${emergency._id}`,
          type:
            emergency.status === "resolved"
              ? "emergency_resolved"
              : "emergency_created",
          message: `Emergency ${emergency.status}: ${
           emergency.emergencyType
          }`,
          time: timeAgo,
        });
      });

      
      // Add recent first aid guide updates
      const recentGuides = firstAidGuides
        .filter((guide) => {
          const updatedAt = new Date(guide.updated_at || guide.updatedAt);
          const now = new Date();
          const diffHours = (now - updatedAt) / (1000 * 60 * 60);
          return diffHours <= 24;
        })
        .sort(
          (a, b) =>
            new Date(b.updated_at || b.updatedAt) -
            new Date(a.updated_at || a.updatedAt)
        )
        .slice(0, 2);

      recentGuides.forEach((guide) => {
        const timeAgo = getTimeAgo(
          new Date(guide.updated_at || guide.updatedAt)
        );
        activities.push({
          id: `guide_${guide.id}`,
          type: "guide_updated",
          message: `First aid guide updated: ${guide.title}`,
          time: timeAgo,
        });
      });

      // Sort activities by most recent and limit to 6
      activities.sort((a, b) => {
        const timeA = parseTimeAgo(a.time);
        const timeB = parseTimeAgo(b.time);
        return timeA - timeB;
      });

      setRecentActivity(activities.slice(0, 6));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data");
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get time ago string
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  // Helper function to parse time ago for sorting
  const parseTimeAgo = (timeStr) => {
    if (timeStr === "Just now") return 0;
    const match = timeStr.match(/(\d+)\s+(minute|hour|day)/);
    if (!match) return 0;
    const value = Number.parseInt(match[1]);
    const unit = match[2];
    if (unit === "minute") return value;
    if (unit === "hour") return value * 60;
    if (unit === "day") return value * 60 * 24;
    return 0;
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "All registered users",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/dashboard/users",
    },
    {
      title: "Clients",
      value: stats.clients,
      description: "Active clients",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/dashboard/users?role=client",
    },
    {
      title: "Freelancers",
      value: stats.freelancers,
      description: "Verified freelancers",
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/dashboard/freelancers",
    },
    {
      title: "Emergency Units",
      value: stats.emergencyUnits,
      description: "Active emergency units",
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-100",
      href: "/dashboard/emergency-units",
    },
    {
      title: "Active Emergencies",
      value: stats.activeEmergencies,
      description: "Currently active",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      href: "/dashboard/emergencies?status=active",
    },
    {
      title: "First Aid Guides",
      value: stats.firstAidGuides,
      description: "Published guides",
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      href: "/dashboard/first-aid",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      description: "Awaiting review",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      href: "/dashboard/users?status=pending",
    },
    {
      title: "Resolved Cases",
      value: stats.resolvedEmergencies,
      description: "Successfully resolved",
      icon: Activity,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      href: "/dashboard/emergencies?status=resolved",
    },
  ];

  const quickActions = [
    {
      title: "Review Pending Approvals",
      description: "Approve new freelancers and emergency units",
      badge: stats.pendingApprovals,
      href: "/dashboard/users?status=pending",
      urgent: stats.pendingApprovals > 0,
    },
    {
      title: "Monitor Active Emergencies",
      description: "Track ongoing emergency situations",
      badge: stats.activeEmergencies,
      href: "/dashboard/emergencies?status=active",
      urgent: stats.activeEmergencies > 0,
    },
    {
      title: "Create First Aid Guide",
      description: "Add new emergency response guides",
      href: "/dashboard/first-aid",
    },
    {
      title: "Manage Emergency Units",
      description: "View and manage emergency response teams",
      href: "/dashboard/emergency-units",
    },
    {
      title: "View User Reports",
      description: "Analyze user activity and engagement",
      href: "/dashboard/users",
    },
    {
      title: "System Analytics",
      description: "View detailed system performance metrics",
      href: "/dashboard/analytics",
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={loadDashboardData}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Welcome to your emergency response management dashboard
          </p>
          {loading && (
            <div className="flex items-center gap-2 mt-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">
                Loading latest data...
              </span>
            </div>
          )}
        </div>

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <MobileCard
              key={index}
              onTap={() => router.push(stat.href)}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium leading-tight">
                  {stat.title}
                </CardTitle>
                <div
                  className={`h-6 w-6 md:h-8 md:w-8 rounded-full ${stat.bgColor} flex items-center justify-center`}
                >
                  <stat.icon
                    className={`h-3 w-3 md:h-4 md:w-4 ${stat.color}`}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </MobileCard>
          ))}
        </div>

        {/* Recent Activity & Quick Actions - Mobile Stack */}
        <div className="grid gap-4 lg:grid-cols-2">
          <MobileCard>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-sm">
                Latest updates from your emergency response system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3 p-2">
                      <div className="animate-pulse bg-gray-200 h-2 w-2 rounded-full mt-2"></div>
                      <div className="flex-1 space-y-2">
                        <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
                        <div className="animate-pulse bg-gray-200 h-3 w-1/2 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity,index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`flex h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                          activity.type === "emergency_created"
                            ? "bg-red-600"
                            : activity.type === "emergency_resolved"
                            ? "bg-green-600"
                            : activity.type === "user_registered"
                            ? "bg-blue-600"
                            : "bg-gray-600"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">
                          {activity.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No recent activity</p>
                </div>
              )}
            </CardContent>
          </MobileCard>

          <MobileCard>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-sm">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <MobileCard
                    key={index}
                    onTap={() => router.push(action.href)}
                    className={`p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                      action.urgent ? "border-orange-200 bg-orange-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {action.title}
                          </span>
                          {action.badge && action.badge > 0 && (
                            <Badge
                              variant={
                                action.urgent ? "destructive" : "secondary"
                              }
                              className="text-xs"
                            >
                              {action.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                          {action.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </MobileCard>
                ))}
              </div>
            </CardContent>
          </MobileCard>
        </div>
      </div>
    </PullToRefresh>
  );
}
