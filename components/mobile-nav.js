"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Heart, Settings, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "First Aid",
    href: "/dashboard/first-aid",
    icon: Heart,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <>
      {/* Bottom Navigation for Mobile */}
      <div className="mobile-nav md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 3).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors touch-friendly",
                  isActive ? "text-red-600 bg-red-50" : "text-gray-600 hover:text-red-600 hover:bg-gray-50",
                )}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            )
          })}

          {/* Menu Sheet Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center p-2 rounded-lg touch-friendly"
              >
                <Menu className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 p-4 border-b">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <Users className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <div className="flex-1 py-4">
                  <nav className="space-y-2">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-friendly",
                            isActive ? "text-red-600 bg-red-50" : "text-gray-700 hover:text-red-600 hover:bg-gray-50",
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      )
                    })}
                  </nav>
                </div>

                <div className="border-t p-4">
                  <Button
                    variant="outline"
                    className="w-full touch-friendly"
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
