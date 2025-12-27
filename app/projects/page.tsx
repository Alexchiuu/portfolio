"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function ProjectsPage() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [projectsInView, setProjectsInView] = useState(false);
  const projectsRef = useRef<HTMLDivElement>(null);

  // Entry animation effect
  useEffect(() => {
    setHasLoaded(true);
  }, []);

  // Check if projects section is in view
  useEffect(() => {
    const handleScroll = () => {
      if (projectsRef.current) {
        const rect = projectsRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight * 0.7 && rect.bottom > 0;
        setProjectsInView(isInView);
      }
    };

    handleScroll(); // Check immediately
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const projects = [
    {
      id: 1,
      title: "Discord Bot for Minecraft",
      description: "A Discord bot that enables remote control of a local Minecraft server via Discord commands. Solves the challenge of 24/7 hosting costs by allowing on-demand server startup/shutdown.",
      url: "https://github.com/Alexchiuu/Discord_bot_for_Minecraft_server",
      tags: ["JavaScript", "Node.js", "Discord.js"],
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      color: "blue"
    },
    {
      id: 2,
      title: "Competitive Programming",
      description: "A collection of algorithms and solutions for competitive programming challenges from CSES, ZeroJudge, TIO Judge, and CodeForces. Focuses on graph theory, dynamic programming, and optimization.",
      url: "https://github.com/Alexchiuu/programming_contest_code",
      tags: ["C++", "Algorithms", "Data Structures"],
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
        </svg>
      ),
      color: "purple"
    },
    {
      id: 3,
      title: "Rainmeter Desktop Theme",
      description: "A clean and customizable system monitor skin for Rainmeter featuring CPU/GPU temps, network info, Spotify integration, and animated visualizers. Updated for 2024 with modern design.",
      url: "https://github.com/Alexchiuu/rainmeter_desktop_plugin",
      tags: ["Lua", "Rainmeter", "UI/UX Design"],
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      ),
      color: "green"
    },
    {
      id: 4,
      title: "ROS Ackermann Car",
      description: "A Robot Operating System (ROS2) package for simulating an Ackermann steering car in Gazebo. Includes launch files, URDF models, and controller configurations for autonomous vehicle development.",
      url: "https://github.com/Alexchiuu/ROS_ackermann_car",
      tags: ["Python", "ROS2", "Robotics"],
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      ),
      color: "orange"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
        hover: "hover:bg-blue-100"
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-200",
        hover: "hover:bg-purple-100"
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200",
        hover: "hover:bg-green-100"
      },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        border: "border-orange-200",
        hover: "hover:bg-orange-100"
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      {/* Navigation Header */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300 ${
          hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}
      >
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>Chiu Alex</Link>
            <div className="flex gap-6" style={{ fontFamily: 'var(--font-poppins)' }}>
              <Link href="/#about" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Intro</Link>
              <Link href="/resume" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Resume</Link>
              <Link href="/projects" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Projects</Link>
              <Link href="/photography" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Photography</Link>
              <Link href="/#contact" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      <div 
        className="min-h-screen relative overflow-hidden pt-20"
        style={{ 
          background: 'linear-gradient(to right, #dbeafe 0%, #dbeafe 40%, #ffffff 40%, #ffffff 100%)',
          fontFamily: 'var(--font-inter)'
        }}
      >
        <main className="flex w-full max-w-6xl flex-col items-center mx-auto px-8 py-16 relative z-10">
          {/* Projects Section */}
          <div 
            ref={projectsRef}
            className={`mb-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-0 transition-all duration-1000 delay-500 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ minHeight: '50vh' }}
          >
            {/* Title - Left Side (Blue Background) */}
            <div className="p-8 flex items-center justify-start">
              <h2 
                className={`text-7xl font-bold text-gray-900 transition-all duration-1000 ease-out ${
                  projectsInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
                }`}
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Projects
              </h2>
            </div>
            
            {/* Content - Right Side (White Background) */}
            <div className="p-8 flex flex-col justify-center bg-white/90 rounded-2xl backdrop-blur-md">
              <div className="space-y-6">
                {projects.map((project, index) => {
                  const colorClasses = getColorClasses(project.color);
                  return (
                    <a
                      key={project.id}
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block group transition-all duration-700 ease-out ${
                        projectsInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                      }`}
                      style={{ 
                        transitionDelay: projectsInView ? `${400 + index * 150}ms` : '0ms'
                      }}
                    >
                      <div className={`relative p-6 rounded-xl border-2 ${colorClasses.border} ${colorClasses.bg} ${colorClasses.hover} transition-all duration-300 shadow-sm hover:shadow-lg`}>
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border} group-hover:scale-110 transition-transform duration-300`}>
                            {project.icon}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h3 className={`text-xl font-bold ${colorClasses.text} group-hover:underline transition-colors`} style={{ fontFamily: 'var(--font-poppins)' }}>
                                {project.title}
                              </h3>
                              <svg 
                                className={`w-5 h-5 ${colorClasses.text} flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </div>
                            
                            <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                              {project.description}
                            </p>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                              {project.tags.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border}`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
