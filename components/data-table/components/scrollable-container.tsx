'use client'

import { cn } from "@/lib/utils"
import React from "react"

interface ScrollableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string | number
  className?: string
  children: React.ReactNode
}

export function ScrollableContainer({
  maxHeight = "80vh",
  className,
  children,
  ...props
}: ScrollableContainerProps) {
  return (
    <div
      className={cn(
        "relative overflow-auto overscroll-none",
        // Custom scrollbar styling
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 active:scrollbar-thumb-muted-foreground/60",
        // Smooth scrolling
        "scroll-smooth",
        // Hide scrollbar in Firefox
        "scrollbar-w-2 firefox:scrollbar-none",
        // Custom styling for WebKit browsers
        "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20",
        "[&:hover::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
        "[&:active::-webkit-scrollbar-thumb]:bg-muted-foreground/60",
        // Prevent content jumping in Windows
        "pr-1",
        className
      )}
      style={{ maxHeight: maxHeight }}
      {...props}
    >
      {children}
    </div>
  )
} 