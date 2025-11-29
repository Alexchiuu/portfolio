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
  const triangleIdCounter = useRef(0);
  const darkenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

      // Manage nav bar visibility
      setIsAtTop(window.scrollY < 50);
      setIsScrolling(true);

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
  }, []);

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
              <a href="#experience" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Experience</a>
              <a href="#projects" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Projects</a>
              <a href="#contact" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Contact</a>
            </div>
          </div>
        </div>
      </nav>
      <div 
        className="min-h-screen relative overflow-hidden pt-20" // Added pt-20 for padding
        style={{ 
          perspective: '1000px',
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
            style={{ minHeight: '60vh' }}
          >
            {/* Profile Section */}
            <div 
              className={`bg-blue-50 p-6 shadow-lg text-center flex flex-col justify-center transition-all duration-1000 delay-500 relative z-20 ${
                hasLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
              }`}
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
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
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
          <div className="w-full" style={{ height: '7vh' }}></div>
          {/* Experience Section */}
          <div 
            id="experience" 
            className={`mb-10 w-full bg-gray-100 p-8 shadow-lg transition-all duration-1000 delay-500 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="mb-6 text-2xl font-semibold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Experience & Education
            </h2>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'var(--font-poppins)' }}>
                  Bachelor of Engineering — Electrical & Electronics Engineering
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  National Taiwan University
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Sep 2025 — Jun 2029
                </p>
                <p className="text-gray-700">
                  Pursuing a comprehensive education in electrical and electronics engineering, focusing on circuit design, systems analysis, and emerging technologies.
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'var(--font-poppins)' }}>
                  High School Diploma — Class of Science
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Taipei Municipal Jianguo High School
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Sep 2022 — Jun 2025
                </p>
                <p className="text-gray-700">
                  Completed rigorous science curriculum with focus on mathematics, physics, and chemistry. Served as General Organizer for Science Affairs, leading and coordinating science-related activities and events for the class.
                </p>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div 
            id="projects" 
            className={`mb-10 w-full bg-gray-100 p-8 shadow-lg transition-all duration-1000 delay-700 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="mb-6 text-2xl font-semibold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Projects
            </h2>
            <div className="space-y-6">
              <div className="group relative border border-gray-300 p-6 transition-all hover:scale-105 hover:shadow-xl bg-white">
                <DualRingEffect />
                <h3 className="relative z-20 text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                  Personal Portfolio Website
                </h3>
                <p className="relative z-20 text-gray-700 mb-3">
                  A modern, responsive portfolio website built with Next.js and Tailwind CSS, featuring dynamic content and smooth animations.
                </p>
                <div className="relative z-20 flex flex-wrap gap-2">
                  <span className="bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    Next.js
                  </span>
                  <span className="bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    TypeScript
                  </span>
                  <span className="bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    Tailwind CSS
                  </span>
                </div>
              </div>
              
              <div className="group relative border border-gray-300 p-6 transition-all hover:scale-105 hover:shadow-xl bg-white">
                <DualRingEffect />
                <h3 className="relative z-20 text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                  Engineering Projects
                </h3>
                <p className="relative z-20 text-gray-700 mb-3">
                  Various electrical and electronics engineering projects focusing on circuit design, systems analysis, and practical applications.
                </p>
                <div className="relative z-20 flex flex-wrap gap-2">
                  <span className="bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                    Circuit Design
                  </span>
                  <span className="bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                    Systems Engineering
                  </span>
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
