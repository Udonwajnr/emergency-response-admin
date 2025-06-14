"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function MobileCard({ children, className, onTap, swipeable = false, onSwipeLeft, onSwipeRight, ...props }) {
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [isPressed, setIsPressed] = useState(false)

  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsPressed(true)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    setIsPressed(false)
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (swipeable) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft()
      }
      if (isRightSwipe && onSwipeRight) {
        onSwipeRight()
      }
    }
  }

  const handleClick = () => {
    if (onTap) {
      onTap()
    }
  }

  return (
    <Card
      className={cn("mobile-card cursor-pointer select-none", isPressed && "scale-[0.98] bg-gray-50", className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Card>
  )
}
