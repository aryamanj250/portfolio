"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { useTheme } from "next-themes"

export default function CustomCursor() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isPointer, setIsPointer] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  
  // Smooth cursor motion values
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  // Apply spring physics for smooth motion - premium feel
  const springConfig = { 
    damping: 25, // Balanced damping for smooth movement
    stiffness: 300, // Moderate stiffness for natural feel
    mass: 0.8, // Slightly heavier mass for premium feel
    restDelta: 0.001,
    restSpeed: 0.001
  }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)
  
  // Trail effect - premium trail
  const trailDots = 0; // Changed from 3 to 0 to disable trail dots
  
  // Create a delayed reference for each dot in the trail - premium spring configs
  const trailXSprings = Array.from({ length: trailDots }).map((_, i) => {
    return useSpring(cursorX, { 
      ...springConfig,
      damping: 30 + (i * 5), // Progressive damping for smooth trail
      stiffness: 250 - (i * 30), // Progressive stiffness reduction
      mass: 0.7 + (i * 0.15), // Progressive mass increase for trail effect
    })
  })
  
  const trailYSprings = Array.from({ length: trailDots }).map((_, i) => {
    return useSpring(cursorY, {
      ...springConfig,
      damping: 30 + (i * 5),
      stiffness: 250 - (i * 30),
      mass: 0.7 + (i * 0.15),
    })
  })
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (!mounted) return
    
    // Optimized event handler with requestAnimationFrame
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      // Cancel any pending animation frame
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      // Schedule the update for the next frame
      rafId = requestAnimationFrame(() => {
        cursorX.set(e.clientX)
        cursorY.set(e.clientY)
        
        // Check element under cursor for hover states
        const target = e.target as Element
        
        // Optimized interactive element check
        const isInteractive = 
          target.tagName === "A" || 
          target.tagName === "BUTTON" || 
          target.closest("a") || 
          target.closest("button") || 
          target.classList.contains("clickable") ||
          window.getComputedStyle(target).cursor === "pointer"
          
        setIsPointer(isInteractive)
        setIsHovering(isInteractive)
      })
    }
    
    // Check for cursor style changes
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as Element
      if (window.getComputedStyle(target).cursor === "pointer") {
        // setIsPointer(true) // Already handled by mousemove
      }
    }
    
    const handleMouseOut = () => {
      // setIsPointer(false) // Already handled by mousemove
    }
    
    // Hide the default cursor
    document.documentElement.classList.add("cursor-hidden")
    
    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseover", handleMouseOver)
    window.addEventListener("mouseout", handleMouseOut)
    
    // Inject style to hide default cursor forcefully
    const styleId = "custom-cursor-hide-native";
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      styleElement.innerHTML = `
        .cursor-hidden * {
          cursor: none !important;
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    return () => {
      document.documentElement.classList.remove("cursor-hidden")
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseover", handleMouseOver)
      window.removeEventListener("mouseout", handleMouseOut)
      
      // Remove injected style
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    }
  }, [mounted, cursorX, cursorY])
  
  // Don't render on SSR or mobile
  if (!mounted || (typeof window !== "undefined" && window.innerWidth < 1024)) {
    return null
  }
  
  // Use white for difference blend mode
  const cursorBaseColor = "#FFFFFF";
  const dotOpacityDefault = 0.85; // Slightly higher base opacity
  const ringOpacityDefault = 0.35; // Slightly higher ring opacity
  
  // Styles for the main cursor dot - premium feel
  const dotStyle = {
    height: isPointer ? '14px' : '10px', // Larger dot for better visibility
    width: isPointer ? '14px' : '10px',
    backgroundColor: cursorBaseColor, 
    opacity: isPointer ? 1 : dotOpacityDefault, // Full opacity on hover
    borderRadius: '9999px', 
    mixBlendMode: 'difference',
  } as const;

  return (
    <>
      {/* Trail dots - premium rendering */}
      {trailDots > 0 && trailXSprings.map((trailX, i) => (
        <motion.div
          key={`trail-${i}`}
          className="fixed top-0 left-0 z-[98] pointer-events-none"
          style={{
            x: trailXSprings[i],
            y: trailYSprings[i],
            translateX: "-50%",
            translateY: "-50%",
            backgroundColor: cursorBaseColor,
            mixBlendMode: 'difference',
            borderRadius: '9999px',
            opacity: 0.45 - (i * 0.12), // Richer trail opacity
            width: 7 - (i * 1.2), // Slightly larger trail dots
            height: 7 - (i * 1.2),
          }}
        />
      ))}
    
      {/* Main cursor dot - premium animation */}
      <motion.div
        className="fixed top-0 left-0 z-[100] pointer-events-none"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
          ...dotStyle
        }}
        animate={{
          scale: isHovering ? 1.2 : 1, // More pronounced scale change
        }}
        transition={{ 
          duration: 0.2, // Slightly longer for smoother feel
          type: "spring", 
          stiffness: 400, // Balanced stiffness
          damping: 30, // Balanced damping
          mass: 0.7 // Heavier mass for premium feel
        }}
      />
      
      {/* Cursor ring/circle - premium animation */}
      <motion.div
        ref={cursorRef}
        className={`fixed top-0 left-0 z-[99] rounded-full pointer-events-none border`}
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
          borderColor: cursorBaseColor, 
          mixBlendMode: 'difference',
          filter: 'none',
        }}
        animate={{
          width: "32px", // Larger ring
          height: "32px",
          opacity: ringOpacityDefault,
          scale: isHovering ? 1.15 : 1, // More pronounced scale change
          borderWidth: "1.5px", // Slightly thicker border
        }}
        transition={{ 
          duration: 0.25, // Longer duration for smoother feel
          type: "spring", 
          stiffness: 300, // Softer spring
          damping: 35, // More damping for smoother motion
          mass: 0.8 // Heavier mass for premium feel
        }}
      />
    </>
  )
}
