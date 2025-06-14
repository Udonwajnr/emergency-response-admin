"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Heart, AlertTriangle, UserCheck, Clock, ChevronRight } from "lucide-react"
import { MobileCard } from "@/components/mobile-card"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    clients: 0,
    freelancers: 0,
    emergencyUnits: 0,
    firstAidGuides: 0,
    pendingApprovals: 0,
  })

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: "user_registered", message: "New freelancer registered", time: "2 minutes ago" },
    { id: 2, type: "guide_created", message: "First aid guide for CPR updated", time: "15 minutes ago" },
    { id: 3, type: "approval_pending", message: "Emergency unit awaiting approval", time: "1 hour ago" },
    { id: 4, type: "user_verified", message: "Client account verified", time: "2 hours ago" },
  ])

  const loadData = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setStats({
      totalUsers: 1247,
      clients: 892,
      freelancers: 234,
      emergencyUnits: 121,
      firstAidGuides: 45,
      pendingApprovals: 12,
    })
  }

  useEffect(() => {
    loadData()
  }, [])

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
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      href: "/dashboard/emergency-units",
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
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      href: "/dashboard/users?status=pending",
    },
  ]

  const quickActions = [
    {
      title: "Review Pending Approvals",
      description: "Approve new freelancers and emergency units",
      badge: stats.pendingApprovals,
      href: "/dashboard/users?status=pending",
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
  ]

  return (
    <PullToRefresh onRefresh={loadData}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Welcome to your emergency response management dashboard
          </p>
        </div>

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat, index) => (
            <MobileCard key={index} onTap={() => router.push(stat.href)} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium leading-tight">{stat.title}</CardTitle>
                <div className={`h-6 w-6 md:h-8 md:w-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </MobileCard>
          ))}
        </div>

        {/* Recent Activity & Quick Actions - Mobile Stack */}
        <div className="grid gap-4 lg:grid-cols-2">
          <MobileCard>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Recent Activity</CardTitle>
              <CardDescription className="text-sm">Latest updates from your emergency response system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </MobileCard>

          <MobileCard>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
              <CardDescription className="text-sm">Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <MobileCard
                    key={index}
                    onTap={() => router.push(action.href)}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{action.title}</span>
                          {action.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {action.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 hidden md:block">{action.description}</p>
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
  )
}
