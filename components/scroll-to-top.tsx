"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { useButtonHover } from "@/context/HoverContext"
import { useTheme } from "next-themes"

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [isBlinking, setIsBlinking] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  const buttonRef = useRef<HTMLButtonElement>(null)
  const pupilRef = useRef<SVGCircleElement>(null)
  const ellipseRef = useRef<SVGEllipseElement>(null)
  const [pupilTransform, setPupilTransform] = useState('')

  const { isButtonHovered } = useButtonHover()

  // Mount check
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!buttonRef.current || !pupilRef.current || !isVisible) return

      const buttonRect = buttonRef.current.getBoundingClientRect()
      const eyeCenterX = buttonRect.left + buttonRect.width / 2
      const eyeCenterY = buttonRect.top + buttonRect.height / 2
      
      const cursorX = event.clientX
      const cursorY = event.clientY

      const deltaX = cursorX - eyeCenterX
      const deltaY = cursorY - eyeCenterY
      const angle = Math.atan2(deltaY, deltaX)

      const maxPupilDist = buttonRect.width * 0.15 

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const sensitivity = 0.1
      let pupilDist = distance * sensitivity

      pupilDist = Math.min(pupilDist, maxPupilDist)

      const pupilX = Math.cos(angle) * pupilDist
      const pupilY = Math.sin(angle) * pupilDist

      setPupilTransform(`translate(${pupilX}px, ${pupilY}px)`)
    }

    if (isVisible) {
      window.addEventListener('mousemove', handleMouseMove)
    } else {
      setPupilTransform('') 
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isVisible])

  useEffect(() => {
    const toggleVisibility = () => {
      const journeySection = document.getElementById('journey')
      if (!journeySection) {
        if (window.scrollY > window.innerHeight * 0.5) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
        return
      }

      const threshold = journeySection.offsetTop + journeySection.offsetHeight

      if (window.scrollY > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility, { passive: true })
    toggleVisibility()

    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    if (isBlinking) return

    setIsBlinking(true)
    
    setTimeout(() => {
      setIsBlinking(false)
    }, 150)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const buttonVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

  const normalRy = 15
  const squintRy = 5
  const blinkRy = 2

  // Theme-specific styling
  const isDark = mounted && resolvedTheme === 'dark'
  const strokeWidth = isDark ? 6 : 5 // Thinner stroke in light mode
  const eyeColor = isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'
  const pupilColor = isDark ? 'hsl(var(--primary-foreground))' : 'hsl(var(--primary-foreground))'
  const buttonClass = isDark ? 
    "fixed bottom-8 right-8 w-12 h-12 z-[9999]" : 
    "fixed bottom-8 right-8 w-12 h-12 z-[9999] shadow-md backdrop-blur-sm rounded-full"

  if (!mounted) {
    // Return a placeholder with the same size to avoid layout shift
    return null
  }

  return (
    <motion.div
      className={buttonClass}
      variants={buttonVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      <button
        ref={buttonRef}
        onClick={scrollToTop}
        className="w-full h-full cursor-pointer transition-opacity duration-300 flex items-center justify-center"
        aria-label="Scroll to top"
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          overflow: 'visible',
        }}
      >
        <svg 
          viewBox="0 0 100 100"
          className="w-full h-full text-[hsl(var(--foreground))] transition-colors duration-300"
          aria-hidden="true"
        >
          <polygon 
            points="50,10 95,90 5,90"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <ellipse 
            ref={ellipseRef}
            cx="50" 
            cy="60"
            rx="25"
            ry={isBlinking ? blinkRy : isButtonHovered ? squintRy : normalRy}
            fill={eyeColor}
            style={{
              transition: 'ry 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
          <circle 
            ref={pupilRef}
            cx="50"
            cy="60"
            r="8"
            fill={pupilColor}
            style={{
              transform: pupilTransform,
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </svg>
      </button>
    </motion.div>
  )
}
