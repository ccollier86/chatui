"use client"

import * as React from "react"
import { ArrowDown } from "lucide-react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ScrollButtonProps extends ButtonProps {
  threshold?: number
}

export function ScrollButton({
  threshold = 50,
  className,
  variant = "outline",
  size = "sm",
  ...props
}: ScrollButtonProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const scrollContainerRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    // Find the scroll container (ChatContainerRoot)
    const findScrollContainer = () => {
      let element = document.querySelector('[data-scroll-container="true"]')
      if (!element) {
        // Fallback: find element with overflow-y-auto
        element = document.querySelector('.overflow-y-auto')
      }
      return element as HTMLElement | null
    }

    scrollContainerRef.current = findScrollContainer()

    if (!scrollContainerRef.current) {
      console.warn('ScrollButton: Could not find scroll container. Make sure ChatContainerRoot has data-scroll-container="true"')
      return
    }

    const scrollContainer = scrollContainerRef.current

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      setIsVisible(distanceFromBottom > threshold)
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [threshold])

  const handleClick = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }

  if (!isVisible) return null

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "h-8 w-8 rounded-full shadow-md transition-all hover:shadow-lg",
        className
      )}
      onClick={handleClick}
      aria-label="Scroll to bottom"
      {...props}
    >
      <ArrowDown className="h-4 w-4" />
    </Button>
  )
}
