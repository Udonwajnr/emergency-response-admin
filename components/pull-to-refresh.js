"use client"

import { useState, useRef } from "react"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export function PullToRefresh({ onRefresh, children, className }) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)

  const maxPullDistance = 80
  const triggerDistance = 60

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e) => {
    if (!isPulling) return

    currentY.current = e.touches[0].clientY
    const distance = Math.max(0, Math.min(maxPullDistance, currentY.current - startY.current))
    setPullDistance(distance)

    if (distance > 0) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling) return

    setIsPulling(false)

    if (pullDistance >= triggerDistance && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    setPullDistance(0)
  }

  const refreshProgress = Math.min(pullDistance / triggerDistance, 1)
  const shouldTrigger = pullDistance >= triggerDistance

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-300 bg-gradient-to-b from-red-50 to-transparent",
          isPulling || isRefreshing ? "opacity-100" : "opacity-0",
        )}
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
          transform: `translateY(${isPulling ? 0 : isRefreshing ? 0 : -60}px)`,
        }}
      >
        <div className="flex flex-col items-center gap-2 text-red-600">
          <RefreshCw
            className={cn(
              "h-5 w-5 transition-transform duration-300",
              isRefreshing && "animate-spin",
              shouldTrigger && !isRefreshing && "rotate-180",
            )}
            style={{
              transform: `rotate(${refreshProgress * 180}deg)`,
            }}
          />
          <span className="text-xs font-medium">
            {isRefreshing ? "Refreshing..." : shouldTrigger ? "Release to refresh" : "Pull to refresh"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="pull-to-refresh"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
