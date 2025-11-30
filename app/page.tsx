"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

interface Triangle {
  id: number;
  x: number;
  y: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  rotationSpeed: number;
  size: number;
  opacity: number;
  brightness: number;
  darkenProgress: number;
}

function DualRingEffect() {
  return (
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-visible">
      {/* Light ring effect */}
      <div className="absolute inset-0 transition-opacity duration-300 overflow-hidden">
        <div className="absolute inset-[-200%] animate-spin-slow" style={{
          background: 'conic-gradient(from 0deg, red, orange, yellow, lime, cyan, blue, magenta, red)'
        }}></div>
        <div className="absolute inset-[1px] bg-white"></div>
      </div>
      {/* Blur rainbow effect */}
      <div className="gradient-container">
        <div className="gradient"></div>
      </div>
      <div className="absolute inset-[3px] bg-white"></div>
    </div>
  );
}

function ScrollDownArrow() {
  return (
    <div 
      className="flex justify-center items-center overflow-hidden cursor-pointer animate-bounce transition-all duration-500 ease-in-out"
      style={{ 
        height: '13vh',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}
      onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
    >
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        className="text-gray-700"
      >
        <path d="M19 12l-7 7-7-7"/>
      </svg>
    </div>
  );
}

export default function Home() {
  const [triangles, setTriangles] = useState<Triangle[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const [mouseVelocity, setMouseVelocity] = useState({ vx: 0, vy: 0 });
  const [shouldDarken, setShouldDarken] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [resumeInView, setResumeInView] = useState(false);
  const triangleIdCounter = useRef(0);
  const darkenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  // New: control open/close for resume sections (click-to-toggle)
  const [openSections, setOpenSections] = useState({
    education: false,
    experience: false,
    extracurriculars: false,
    skills: false,
  });

  const toggleSection = (key: 'education' | 'experience' | 'extracurriculars' | 'skills') => {
    setOpenSections(prev => {
      // If clicking the same section that's already open, close it
      if (prev[key]) {
        return { ...prev, [key]: false };
      }
      // Otherwise, close all sections and open the clicked one
      return {
        education: false,
        experience: false,
        extracurriculars: false,
        skills: false,
        [key]: true
      };
    });
  };

  // Entry animation effect
  useEffect(() => {
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      setTriangles((prevTriangles) => {
        return prevTriangles
          .map((triangle) => {
            // Calculate distance from mouse to triangle
            const dx = triangle.x - mousePos.x;
            const dy = triangle.y - mousePos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Gradually fade out when mouse stops moving (with delay)
            let newDarkenProgress = triangle.darkenProgress;
            if (shouldDarken) {
              // Gradually increase darken progress (0 to 1 over time)
              newDarkenProgress = Math.min(1, triangle.darkenProgress + 0.02);
            } else if (isMouseMoving) {
              // Gradually decrease darken progress when moving
              newDarkenProgress = Math.max(0, triangle.darkenProgress - 0.05);
            }
            
            // Calculate base opacity from distance (start fading at 100px, gone by 180px)
            const maxDistance = 180;
            const fadeStart = 100;
            let distanceOpacity = 1;
            
            if (distance > fadeStart) {
              // Steeper fade curve - triangles fade faster as they get farther
              const fadeProgress = (distance - fadeStart) / (maxDistance - fadeStart);
              distanceOpacity = Math.max(0, 1 - Math.pow(fadeProgress, 0.7)); // Power < 1 for steeper fade
            }
            
            // Apply stop-motion fade: use MAX of distance fade and darken progress
            // This ensures outer triangles fade first (from distance), then inner ones (from darken)
            const fadeMultiplier = 1 - newDarkenProgress; // 1 = full opacity, 0 = transparent
            const newOpacity = Math.min(distanceOpacity, fadeMultiplier) * 0.8; // Reduce overall opacity to 50%
            
            // Calculate brightness based on distance (closer = brighter)
            const maxBrightnessDistance = 160;
            const brightness = distance < maxBrightnessDistance ? 1 - (distance / maxBrightnessDistance) : 0;

            // Calculate rotation based on mouse movement and proximity
            let rotationChange = 0;
            if (isMouseMoving && distance < 160) {
              // Stronger effect when mouse is closer and moving
              const influence = 1 - (distance / 160);
              const velocityMagnitude = Math.sqrt(mouseVelocity.vx * mouseVelocity.vx + mouseVelocity.vy * mouseVelocity.vy);
              // Use same rotation speed for all triangles (sign determines direction)
              const direction = triangle.rotationSpeed > 0 ? 1 : -1;
              // Speed multiplier based on distance (closer = much faster, outer = much slower)
              const speedMultiplier = 0.1 + (influence * 2.9); // Range from 0.1 (far) to 3.0 (close)
              rotationChange = direction * influence * Math.min(velocityMagnitude / 2.5, 15) * speedMultiplier;
            }
            
            return {
              ...triangle,
              rotationX: triangle.rotationX + rotationChange,
              rotationY: triangle.rotationY + rotationChange * 0.7,
              rotationZ: triangle.rotationZ + rotationChange * 1.2,
              opacity: newOpacity,
              brightness: brightness,
              darkenProgress: newDarkenProgress,
            };
          })
          .filter((triangle) => triangle.opacity > 0);
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    if (isHovering) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isHovering, mousePos, isMouseMoving, mouseVelocity, shouldDarken]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const newX = e.clientX;
    const newY = e.clientY + window.scrollY; // Add scroll offset
    
    // Calculate velocity
    const vx = newX - mousePos.x;
    const vy = newY - mousePos.y;
    setMouseVelocity({ vx, vy });
    
    setMousePos({ x: newX, y: newY });
    setIsMouseMoving(true);
    
    if (isHovering) {
      const maxTriangles = 100; // Keep 100 triangles around the mouse
      
      setTriangles((prev) => {
        // If we have fewer triangles than the max, add more
        if (prev.length < maxTriangles) {
          const trianglesToAdd = Math.min(8, maxTriangles - prev.length);
          const newTriangles = [];
          
          for (let i = 0; i < trianglesToAdd; i++) {
            let attempts = 0;
            let validPosition = false;
            let triangleX: number = 0;
            let triangleY: number = 0;
            
            // Try to find a position that doesn't overlap with existing triangles
            while (!validPosition && attempts < 10) {
              // Generate random angle and distance from mouse cursor
              const angle = Math.random() * Math.PI * 2;
              const distance = Math.random() * 170 + 30; // Random distance between 30-200px from cursor
              const offsetX = Math.cos(angle) * distance;
              const offsetY = Math.sin(angle) * distance;
              
              triangleX = newX + offsetX;
              triangleY = newY + offsetY;
              
              // Check if this position is far enough from existing triangles
              const minDistance = 25; // Minimum distance between triangles
              validPosition = prev.every(triangle => {
                const dx = triangle.x - triangleX;
                const dy = triangle.y - triangleY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                return dist > minDistance;
              });
              
              attempts++;
            }
            
            // Only add if we found a valid position
            if (validPosition) {
              triangleIdCounter.current += 1;
              // Randomly choose between normal (0°) and upside-down (180°)
              const initialRotationZ = Math.random() < 0.5 ? 0 : 180;
              newTriangles.push({
                id: triangleIdCounter.current,
                x: triangleX,
                y: triangleY,
                rotationX: 0,
                rotationY: 0,
                rotationZ: initialRotationZ,
                rotationSpeed: 8,
                size: 30, // Fixed size for all triangles
                opacity: 1,
                brightness: 1,
                darkenProgress: 0,
              });
            }
          }
          
          return [...prev, ...newTriangles];
        }
        
        return prev;
      });
    }
  };

  // Detect when mouse stops moving
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsMouseMoving(false);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [mousePos]);

  // Delay before starting to darken after mouse stops
  useEffect(() => {
    if (!isMouseMoving) {
      // Clear any existing timeout
      if (darkenTimeoutRef.current) {
        clearTimeout(darkenTimeoutRef.current);
      }
      // Start darkening after 1 second delay
      darkenTimeoutRef.current = setTimeout(() => {
        setShouldDarken(true);
      }, 1000);
    } else {
      // Mouse is moving, cancel darkening immediately
      if (darkenTimeoutRef.current) {
        clearTimeout(darkenTimeoutRef.current);
        darkenTimeoutRef.current = null;
      }
      setShouldDarken(false);
    }
    
    return () => {
      if (darkenTimeoutRef.current) {
        clearTimeout(darkenTimeoutRef.current);
      }
    };
  }, [isMouseMoving]);

  // Hide scroll arrow and manage nav visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Manage scroll arrow visibility
      if (window.scrollY > 50) {
        setShowScrollArrow(false);
      } else {
        setShowScrollArrow(true);
      }

      // Calculate scroll progress for profile/intro animation (0 to 1)
      // Start fading at 100px, fully hidden by 600px (slower)
      const fadeStart = 100;
      const fadeEnd = 600;
      const scrollY = window.scrollY;
      const progress = Math.min(Math.max((scrollY - fadeStart) / (fadeEnd - fadeStart), 0), 1);
      setScrollProgress(progress);

      // Manage nav bar visibility
      setIsAtTop(window.scrollY < 50);
      setIsScrolling(true);

      // Check if resume section is in view - trigger animation every time
      if (resumeRef.current) {
        const rect = resumeRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight * 0.7 && rect.bottom > 0;
        setResumeInView(isInView);
      }

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 2000); // Hide nav after 2 seconds of inactivity
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [resumeInView]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTriangles([]);
  };
  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/Alexchiuu",
      icon: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/alex-c-26389239a",
      icon: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/ccalexisme",
      icon: "M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.505 4.505 0 0 0 12 7.5zm0 1A3.5 3.5 0 1 1 8.5 12 3.504 3.504 0 0 1 12 8.5zM17 6.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z",
    },
    {
      name: "Discord",
      url: "https://discord.gg/pNEAjDvN",
      icon: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/chiu.alex.417443",
      icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    },
    {
      name: "Email",
      url: "mailto:b14901022@g.ntu.edu.tw",
      icon: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
    },
  ];

  return (
    <>
      {/* Navigation Header */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300 ${
          hasLoaded && (isScrolling || isAtTop) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}
      >
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>Chiu Alex</h2>
            <div className="flex gap-6" style={{ fontFamily: 'var(--font-poppins)' }}>
              <a href="#about" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Intro</a>
              <a href="#resume" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Resume</a>
              <a href="#projects" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Projects</a>
              <a href="#contact" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Contact</a>
            </div>
          </div>
        </div>
      </nav>
      <div 
        className="min-h-screen relative overflow-hidden pt-20" // Added pt-20 for padding
        style={{ 
          perspective: '2000px',
          background: 'linear-gradient(to right, #dbeafe 0%, #dbeafe 40%, #ffffff 40%, #ffffff 100%)',
          fontFamily: 'var(--font-inter)'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Animated Triangles */}
        {triangles.map((triangle) => (
          <div
            key={triangle.id}
            className="absolute pointer-events-none z-0"
            style={{
              left: triangle.x,
              top: triangle.y,
              transform: `translate(-50%, -50%) rotateX(${triangle.rotationX}deg) rotateY(${triangle.rotationY}deg) rotateZ(${triangle.rotationZ}deg)`,
              transformStyle: 'preserve-3d',
              opacity: triangle.opacity,
            }}
          >
            <svg
              width={triangle.size}
              height={triangle.size}
              viewBox="0 0 100 100"
              style={{
                filter: `brightness(${triangle.brightness}) drop-shadow(0 0 2px rgba(255, 255, 255, ${triangle.brightness * 0.5}))`,
              }}
            >
              <polygon
                points="50,10 90,90 10,90"
                fill="none"
                stroke="black"
                strokeWidth="3"
              />
            </svg>
          </div>
        ))}

        <main className="flex w-full max-w-6xl flex-col items-center mx-auto px-8 py-16 relative z-10">
          {/* Transparent Spacer Bottom */}
          <div className="w-full" style={{ height: '5vh' }}></div>

          {/* Profile and About Section - Side by Side */}
          <div 
            className="mb-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-0" 
            style={{ 
              minHeight: '60vh',
              transform: `translateY(${scrollProgress * 80}px) scale(${1 - scrollProgress * 0.25})`,
              opacity: 1 - scrollProgress * 1.1,
              transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
              transformStyle: 'preserve-3d',
              perspective: '1500px'
            }}
          >
            {/* Profile Section */}
            <div 
              className={`bg-blue-50 p-6 shadow-lg text-center flex flex-col justify-center transition-all duration-1000 delay-500 relative z-20 ${
                hasLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
              }`}
              style={{
                transform: `
                  translateX(${-scrollProgress * 250}px) 
                  translateZ(${-scrollProgress * 200}px)
                  rotateY(${-scrollProgress * 90}deg) 
                  rotateX(${scrollProgress * 15}deg)
                  scale(${1 - scrollProgress * 0.15})
                `,
                transformStyle: 'preserve-3d',
                transformOrigin: 'right center',
                transition: 'transform 0.15s ease-out',
                filter: `blur(${scrollProgress * 4}px)`,
                backfaceVisibility: 'hidden'
              }}
            >
              <div className="mb-4 inline-block">
                <div className="relative h-52 w-52 overflow-hidden rounded-full mx-auto">
                  <Image
                    src="/image.jpg"
                    alt="Chiu Alex Profile Picture"
                    width={208}
                    height={208}
                    className="object-cover"
                  />
                </div>
              </div>

              <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>
                Chiu Alex
              </h1>
              <div className="w-32 h-0.5 bg-blue-900 mx-auto mb-2"></div>
              <p className="mb-2 text-lg text-gray-700 font-medium" style={{ fontFamily: 'var(--font-poppins)' }}>
                Student
                <br />
                <br />
                Currently studying Electrical Engineering
                <br />
                at National Taiwan University.
              </p>
            </div>

            {/* Intro Section */}
            <div 
              id="about" 
              className={`bg-white p-6 shadow-lg flex flex-col justify-center transition-all duration-1000 delay-500 relative z-10 ${
                hasLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
              }`}
              style={{
                transform: `
                  translateX(${scrollProgress * 250}px) 
                  translateZ(${-scrollProgress * 200}px)
                  rotateY(${scrollProgress * 90}deg) 
                  rotateX(${scrollProgress * 15}deg)
                  scale(${1 - scrollProgress * 0.15})
                `,
                transformStyle: 'preserve-3d',
                transformOrigin: 'left center',
                transition: 'transform 0.15s ease-out',
                filter: `blur(${scrollProgress * 4}px)`,
                backfaceVisibility: 'hidden'
              }}
            >
              <h2 className="mb-4 text-3xl font-semibold text-gray-900 sm:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>
                Intro
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Hello! I'm Alex, a passionate electrical engineering student at National Taiwan University with a deep interest in technology and innovation.
                </p>
                <p>
                  When I'm not studying, you can find me coding, playing guitar, or exploring new places with my camera. I love traveling, photography, and capturing unique perspectives from around the world.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <a 
                    href="https://www.google.com/maps/place/Taipei,+Taiwan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="location-button group relative inline-block cursor-pointer border-none px-8 py-3.5 font-bold text-base rounded-full overflow-hidden bg-white text-gray-900 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-200"
                    style={{ fontFamily: 'var(--font-poppins)', letterSpacing: '0.05rem' }}
                  >
                    <span 
                      className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-[400ms] ease-[cubic-bezier(0.3,1,0.8,1)]"
                    ></span>
                    <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-400">
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform duration-300 group-hover:scale-110"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>Taipei, Taiwan</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>


          {/* Scroll Down Arrow */}
          <div 
            className={`ease-in-out overflow-hidden ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ 
              height: showScrollArrow ? '13vh' : '0',
              opacity: showScrollArrow && hasLoaded ? 1 : 0,
              transition: hasLoaded && !showScrollArrow ? 'all 0.5s ease-in-out' : 'all 1s ease-in-out 3s'
            }}
          >
            <ScrollDownArrow />
          </div>
          {/* Transparent Spacer Bottom */}
          <div className="w-full" style={{ height: '14vh' }}></div>
          {/* Resume Section */}
          <div 
            id="resume" 
            ref={resumeRef}
            className={`mb-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-0 transition-all duration-1000 delay-500 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ minHeight: '50vh' }}
          >
            {/* Title - Left Side (Blue Background) */}
            <div className="p-8 flex items-center justify-start">
              <h2 
                className={`text-7xl font-bold text-gray-900 transition-all duration-1000 ease-out ${
                  resumeInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
                }`}
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Resume
              </h2>
            </div>
            
            {/* Content - Right Side (White Background) */}
            <div className="p-8 flex flex-col justify-center bg-white/90 rounded-2xl backdrop-blur-md">
              <div className="space-y-8">
                {/* Education */}
                <div className="cursor-pointer">
                  <div
                    className={`flex items-center gap-2 transition-all duration-700 ease-out ${
                      resumeInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                    }`}
                    style={{ 
                      transitionDelay: resumeInView ? '400ms' : '0ms',
                      animation: resumeInView ? 'bounceInRight 0.8s ease-out 0.4s both' : 'bounceOutRight 0.6s ease-out both'
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleSection('education')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSection('education'); }}
                    aria-expanded={openSections.education}
                  >
                     <svg 
                      className={`w-5 h-5 mb-4 transition-all duration-300 ${openSections.education ? 'text-blue-600 rotate-90' : 'text-gray-400'}`}
                       fill="none" 
                       stroke="currentColor" 
                       viewBox="0 0 24 24"
                     >
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                    <h3 className={`text-2xl font-bold text-gray-900 mb-4 transition-colors ${openSections.education ? 'text-blue-600' : ''}`} style={{ fontFamily: 'var(--font-playfair)' }}>
                       Education
                     </h3>
                   </div>
                  <div className={`relative pl-8 overflow-hidden transition-all duration-500 ease-in-out ${openSections.education ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {/* Vertical Timeline Line (starts at first dot, ends at last dot) */}
                    <div className="absolute left-[9px] top-[6px] bottom-[6px] w-0.5 bg-blue-500"></div>
                    
                    <div className="space-y-6 pb-4">
                      {/* Taipei Municipal Jianguo High School */}
                      <div className="relative">
                        {/* Timeline Dot */}
                        <div className="absolute left-[-30px] top-[6px] w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
                          High School Diploma, Class of Science
                        </h4>
                        <p className="text-base text-gray-600 mb-1">
                          Taipei Municipal Jianguo High School
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          Sep 2022 — Jun 2025
                        </p>
                        <p className="text-base text-gray-700 leading-relaxed">
                          <span className="font-medium text-gray-800">Activities and societies:</span> General organizer of the Science affair in Class of Science
                        </p>
                        <p className="text-base text-gray-700 leading-relaxed mt-1">
                          Project Management
                        </p>
                      </div>

                      {/* National Taiwan University */}
                      <div className="relative">
                        {/* Timeline Dot */}
                        <div className="absolute left-[-30px] top-[6px] w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
                          Bachelor of Engineering - BE, Electrical and Electronics Engineering
                        </h4>
                        <p className="text-base text-gray-600 mb-1">
                          National Taiwan University
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          Sep 2025 — Jun 2029
                        </p>
                        <p className="text-base text-gray-700 leading-relaxed">
                          Project Management and Engineering
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div className="cursor-pointer">
                  <div
                    className={`flex items-center gap-2 transition-all duration-700 ease-out ${
                      resumeInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                    }`}
                    style={{ 
                      transitionDelay: resumeInView ? '600ms' : '100ms',
                      animation: resumeInView ? 'bounceInRight 0.8s ease-out 0.6s both' : 'bounceOutRight 0.6s ease-out 0.1s both'
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleSection('experience')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSection('experience'); }}
                    aria-expanded={openSections.experience}
                  >
                     <svg 
                      className={`w-5 h-5 mb-4 transition-all duration-300 ${openSections.experience ? 'text-green-600 rotate-90' : 'text-gray-400'}`}
                       fill="none" 
                       stroke="currentColor" 
                       viewBox="0 0 24 24"
                     >
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                    <h3 className={`text-2xl font-bold text-gray-900 mb-4 transition-colors ${openSections.experience ? 'text-green-600' : ''}`} style={{ fontFamily: 'var(--font-playfair)' }}>
                       Experience
                     </h3>
                   </div>

                  <div className={`relative pl-8 overflow-hidden transition-all duration-500 ease-in-out ${openSections.experience ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {/* Vertical Timeline Line (starts at first dot, ends at last dot) */}
                    <div className="absolute left-[9px] top-[6px] bottom-[6px] w-0.5 bg-green-500"></div>

                    <div className="space-y-6 pb-4">
                      {/* Research & Project (Senior Research) */}
                      <div className="relative">
                        <div className="absolute left-[-30px] top-[6px] w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
                          Senior Research — Vehicle Roll-Prevention Driver Assistance
                        </h4>
                        <p className="text-base text-gray-600 mb-1">Advisor: Prof. 詹魁元 (NTU Mechanical Engineering)</p>
                        <p className="text-sm text-gray-500 mb-2">High school research / team project</p>
                        <p className="text-base text-gray-700 leading-relaxed">
                          Designed and implemented an Ackermann-model test vehicle using Raspberry Pi (control), Arduino (motor PWM), ROS for message passing, and a 6-axis IMU + SLAM-based feedback loop to reduce dynamic roll. Responsibilities included system architecture, sensor integration, control algorithm prototyping, MATLAB simulations, and preparing results for Taiwan International Science Fair submissions.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 rounded">Raspberry Pi</span>
                          <span className="bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 rounded">ROS / ROS2</span>
                          <span className="bg-green-100 px-3 py-1 text-xs font-medium text-green-800 rounded">Arduino</span>
                          <span className="bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 rounded">MATLAB</span>
                        </div>
                      </div>

                      {/* Independent Research (Wind Tunnel) */}
                      <div className="relative">
                        <div className="absolute left-[-30px] top-[6px] w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
                          Independent Research — Truck Roof Spoiler Aerodynamics
                        </h4>
                        <p className="text-base text-gray-600 mb-1">NTU Mechanical Lab (wind tunnel experiments)</p>
                        <p className="text-sm text-gray-500 mb-2">Independent study / senior year</p>
                        <p className="text-base text-gray-700 leading-relaxed">
                          3D-modeled and printed truck models, designed roof spoilers, and measured aerodynamic drag in a small wind tunnel. Performed LabVIEW data acquisition and applied post-processing to quantify drag differences. Gained hands-on experience with experimental setup, calibration and result analysis.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 rounded">3D Printing</span>
                          <span className="bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 rounded">LabVIEW</span>
                          <span className="bg-green-100 px-3 py-1 text-xs font-medium text-green-800 rounded">Wind Tunnel</span>
                        </div>
                      </div>

                      {/* Teaching & Mentoring */}
                      <div className="relative">
                        <div className="absolute left-[-30px] top-[6px] w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
                          Teaching & Mentoring — Algorithm Lecturer
                        </h4>
                        <p className="text-base text-gray-600 mb-1">建國中學 Student Algorithm Club</p>
                        <p className="text-sm text-gray-500 mb-2">High school — ongoing</p>
                        <p className="text-base text-gray-700 leading-relaxed">
                          Prepared and delivered algorithm and problem-solving lectures for younger students, organized practice sessions for online judges (ZeroJudge, CSES, TIOJ), and mentored peers preparing for APCS and national competitions.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 rounded">Algorithms</span>
                          <span className="bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 rounded">C++</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extracurriculars */}
                <div className="cursor-pointer">
                  <div
                    className={`flex items-center gap-2 transition-all duration-700 ease-out ${
                      resumeInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                    }`}
                    style={{ 
                      transitionDelay: resumeInView ? '800ms' : '200ms',
                      animation: resumeInView ? 'bounceInRight 0.8s ease-out 0.8s both' : 'bounceOutRight 0.6s ease-out 0.2s both'
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleSection('extracurriculars')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSection('extracurriculars'); }}
                    aria-expanded={openSections.extracurriculars}
                  >
                     <svg 
                      className={`w-5 h-5 mb-4 transition-all duration-300 ${openSections.extracurriculars ? 'text-purple-600 rotate-90' : 'text-gray-400'}`}
                       fill="none" 
                       stroke="currentColor" 
                       viewBox="0 0 24 24"
                     >
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                    <h3 className={`text-2xl font-bold text-gray-900 mb-4 transition-colors ${openSections.extracurriculars ? 'text-purple-600' : ''}`} style={{ fontFamily: 'var(--font-playfair)' }}>
                       Extracurriculars
                     </h3>
                   </div>

                  <div className={`relative pl-8 overflow-hidden transition-all duration-500 ease-in-out ${openSections.extracurriculars ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {/* Vertical Timeline Line (starts at first dot, ends at last dot) */}
                    <div className="absolute left-[9px] top-[6px] bottom-[6px] w-0.5 bg-purple-500"></div>

                    <div className="space-y-6 pb-4">
                      <div className="relative">
                        <div className="absolute left-[-30px] top-[6px] w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-md"></div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
                          Science Fair Coordinator
                        </h4>
                        <p className="text-base text-gray-600 mb-1">建國中學 Science Program — Jun 2023 — May 2024</p>
                        <p className="text-base text-gray-700 leading-relaxed">
                          Led the annual science fair for the school's science program. Responsible for team coordination, visual design, venue and vendor communication, promotion, video production, and event scheduling. Developed large-event planning, communication, and time-management skills while leading cross-grade teams to a successful exhibition.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 rounded">Event Management</span>
                          <span className="bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 rounded">Leadership</span>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute left-[-30px] top-[6px] w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-md"></div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
                          Algorithm Lecturer
                        </h4>
                        <p className="text-base text-gray-600 mb-1">建國中學 — ongoing</p>
                        <p className="text-base text-gray-700 leading-relaxed">
                          Acted as an algorithm instructor in a student-led study group: created structured teaching materials, demonstrated problem-solving approaches, and led practice contests to prepare younger students for programming competitions.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 rounded">Teaching</span>
                          <span className="bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 rounded">Algorithms</span>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute left-[-30px] top-[6px] w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-md"></div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
                          Competition Achievements
                        </h4>
                        <p className="text-base text-gray-600 mb-1">Selected awards & honors</p>
                        <ul className="list-disc list-inside text-gray-700">
                          <li>Taiwan International Science Fair — Finalist / Exhibition (selected)</li>
                          <li>YTP (Turing Program) — Team Bronze (National 3rd)</li>
                          <li>NTU Internet Programming Contest — Top 10 in preliminary</li>
                          <li>APCS: Concept 4/5, Practical 5/5</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="cursor-pointer">
                  <div
                    className={`flex items-center gap-2 transition-all duration-700 ease-out ${
                      resumeInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                    }`}
                    style={{ 
                      transitionDelay: resumeInView ? '1000ms' : '300ms',
                      animation: resumeInView ? 'bounceInRight 0.8s ease-out 1s both' : 'bounceOutRight 0.6s ease-out 0.3s both'
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleSection('skills')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSection('skills'); }}
                    aria-expanded={openSections.skills}
                  >
                     <svg 
                      className={`w-5 h-5 mb-4 transition-all duration-300 ${openSections.skills ? 'text-orange-600 rotate-90' : 'text-gray-400'}`}
                       fill="none" 
                       stroke="currentColor" 
                       viewBox="0 0 24 24"
                     >
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                    <h3 className={`text-2xl font-bold text-gray-900 mb-4 transition-colors ${openSections.skills ? 'text-orange-600' : ''}`} style={{ fontFamily: 'var(--font-playfair)' }}>
                       Skills
                     </h3>
                   </div>

                  <div className={`relative pl-8 overflow-hidden transition-all duration-500 ease-in-out ${openSections.skills ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {/* Vertical Timeline Line (starts at first dot, ends at last dot) */}
                    <div className="absolute left-[9px] top-[6px] bottom-[6px] w-0.5 bg-orange-500"></div>

                    <div className="pb-4">
                      <div className="mb-3">
                        <h4 className="text-lg font-medium text-gray-900" style={{ fontFamily: 'var(--font-poppins)' }}>Programming & Tools</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 rounded">C++</span>
                          <span className="bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 rounded">Python</span>
                          <span className="bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 rounded">MATLAB</span>
                          <span className="bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 rounded">LabVIEW</span>
                          <span className="bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 rounded">ROS</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h4 className="text-lg font-medium text-gray-900" style={{ fontFamily: 'var(--font-poppins)' }}>Hardware & Experimentation</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="bg-green-100 px-3 py-1 text-sm font-medium text-green-800 rounded">Raspberry Pi</span>
                          <span className="bg-green-100 px-3 py-1 text-sm font-medium text-green-800 rounded">Arduino</span>
                          <span className="bg-green-100 px-3 py-1 text-sm font-medium text-green-800 rounded">3D Printing</span>
                          <span className="bg-green-100 px-3 py-1 text-sm font-medium text-green-800 rounded">Wind Tunnel Testing</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-medium text-gray-900" style={{ fontFamily: 'var(--font-poppins)' }}>Languages & Certifications</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 rounded">TOEIC 955</span>
                          <span className="bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 rounded">TOEFL 96</span>
                          <span className="bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 rounded">GEPT Intermediate</span>
                          <span className="bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 rounded">APCS 4/5 (concept), 5/5 (practical)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div 
            id="projects" 
            className={`mb-10 w-full transition-all duration-1000 delay-700 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ 
              minHeight: '80vh',
              perspective: '1500px'
            }}
          >
            <div className="projects-background">
              <div className="max-w-7xl mx-auto px-8 py-16">
                <h2 className="mb-16 text-5xl font-bold text-gray-900 text-center" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Projects
                </h2>
                
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 items-stretch">
                  <a 
                    href="https://github.com/Alexchiuu/Discord_bot_for_Minecraft_server"
                    target="_blank"
                    rel="noopener noreferrer"
                  className="project-card group"
                >
                  <div className="project-card-inner">
                    <div className="project-card-glow"></div>
                    <div className="project-card-content">
                      <div className="flex items-start justify-between mb-4">
                        <div className="project-icon">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors" style={{ fontFamily: 'var(--font-poppins)' }}>
                        Discord Bot for Minecraft
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        A Discord bot that enables remote control of a local Minecraft server via Discord commands. Solves the challenge of 24/7 hosting costs by allowing on-demand server startup/shutdown.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="project-tag">JavaScript</span>
                        <span className="project-tag">Node.js</span>
                        <span className="project-tag">Discord.js</span>
                      </div>
                    </div>
                  </div>
                </a>
                
                <a 
                  href="https://github.com/Alexchiuu/programming_contest_code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-card group"
                >
                  <div className="project-card-inner">
                    <div className="project-card-glow"></div>
                    <div className="project-card-content">
                      <div className="flex items-start justify-between mb-4">
                        <div className="project-icon">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                          </svg>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors" style={{ fontFamily: 'var(--font-poppins)' }}>
                        Competitive Programming
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        A collection of algorithms and solutions for competitive programming challenges from CSES, ZeroJudge, TIO Judge, and CodeForces. Focuses on graph theory, dynamic programming, and optimization.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="project-tag">C++</span>
                        <span className="project-tag">Algorithms</span>
                        <span className="project-tag">Data Structures</span>
                      </div>
                    </div>
                  </div>
                </a>

                <a 
                  href="https://github.com/Alexchiuu/rainmeter_desktop_plugin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-card group"
                >
                  <div className="project-card-inner">
                    <div className="project-card-glow"></div>
                    <div className="project-card-content">
                      <div className="flex items-start justify-between mb-4">
                        <div className="project-icon">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                          </svg>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors" style={{ fontFamily: 'var(--font-poppins)' }}>
                        Rainmeter Desktop Theme
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        A clean and customizable system monitor skin for Rainmeter featuring CPU/GPU temps, network info, Spotify integration, and animated visualizers. Updated for 2024 with modern design.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="project-tag">Lua</span>
                        <span className="project-tag">Rainmeter</span>
                        <span className="project-tag">UI/UX Design</span>
                      </div>
                    </div>
                  </div>
                </a>

                <a 
                  href="https://github.com/Alexchiuu/ROS_ackermann_car"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-card group"
                >
                  <div className="project-card-inner">
                    <div className="project-card-glow"></div>
                    <div className="project-card-content">
                      <div className="flex items-start justify-between mb-4">
                        <div className="project-icon">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                          </svg>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors" style={{ fontFamily: 'var(--font-poppins)' }}>
                        ROS Ackermann Car
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        A Robot Operating System (ROS2) package for simulating an Ackermann steering car in Gazebo. Includes launch files, URDF models, and controller configurations for autonomous vehicle development.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="project-tag">Python</span>
                        <span className="project-tag">ROS2</span>
                        <span className="project-tag">Robotics</span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
          </div>

          {/* Interests Section */}
          <div 
            className={`mb-10 w-full bg-gray-100 p-8 shadow-lg transition-all duration-1000 delay-[900ms] ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="mb-6 text-2xl font-semibold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Interests & Hobbies
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="group relative flex items-center gap-3 bg-white p-4 transition-all hover:scale-105 hover:shadow-lg">
                <DualRingEffect />
                <span className="relative z-20 text-2xl">💻</span>
                <span className="relative z-20 text-sm font-medium text-gray-700">Coding</span>
              </div>
              <div className="group relative flex items-center gap-3 bg-white p-4 transition-all hover:scale-105 hover:shadow-lg">
                <DualRingEffect />
                <span className="relative z-20 text-2xl">🎸</span>
                <span className="relative z-20 text-sm font-medium text-gray-700">Guitar</span>
              </div>
              <div className="group relative flex items-center gap-3 bg-white p-4 transition-all hover:scale-105 hover:shadow-lg">
                <DualRingEffect />
                <span className="relative z-20 text-2xl">✈️</span>
                <span className="relative z-20 text-sm font-medium text-gray-700">Traveling</span>
              </div>
              <div className="group relative flex items-center gap-3 bg-white p-4 transition-all hover:scale-105 hover:shadow-lg">
                <DualRingEffect />
                <span className="relative z-20 text-2xl">�</span>
                <span className="relative z-20 text-sm font-medium text-gray-700">Photography</span>
              </div>
              <div className="group relative flex items-center gap-3 bg-white p-4 transition-all hover:scale-105 hover:shadow-lg">
                <DualRingEffect />
                <span className="relative z-20 text-2xl">🔬</span>
                <span className="relative z-20 text-sm font-medium text-gray-700">Science</span>
              </div>
              <div className="group relative flex items-center gap-3 bg-white p-4 transition-all hover:scale-105 hover:shadow-lg">
                <DualRingEffect />
                <span className="relative z-20 text-2xl">🌐</span>
                <span className="relative z-20 text-sm font-medium text-gray-700">Web Dev</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div 
            id="contact" 
            className={`w-full mb-10 transition-all duration-1000 delay-[1300ms] ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Connect With Me
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center justify-center gap-3 bg-gray-100 p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <DualRingEffect />
                  <svg
                    className="relative z-20 h-8 w-8 fill-gray-700"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d={link.icon} />
                  </svg>
                  <span className="relative z-20 text-sm font-medium text-gray-700">
                    {link.name}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer 
            className={`mt-16 text-center text-sm text-gray-600 transition-all duration-1000 delay-[1500ms] ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p>© 2025 Chiu Alex. Built with Next.js & Tailwind CSS</p>
          </footer>
        </main>
      </div>
    </>
  );
}
