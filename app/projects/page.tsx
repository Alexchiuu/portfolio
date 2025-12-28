"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

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
      coverImage: "/projects/discord-bot.jpg"
    },
    {
      id: 2,
      title: "Competitive Programming",
      description: "A collection of algorithms and solutions for competitive programming challenges from CSES, ZeroJudge, TIO Judge, and CodeForces. Focuses on graph theory, dynamic programming, and optimization.",
      url: "https://github.com/Alexchiuu/programming_contest_code",
      tags: ["C++", "Algorithms", "Data Structures"],
      coverImage: "/projects/competitive-programming.jpg"
    },
    {
      id: 3,
      title: "Rainmeter Desktop Theme",
      description: "A clean and customizable system monitor skin for Rainmeter featuring CPU/GPU temps, network info, Spotify integration, and animated visualizers. Updated for 2024 with modern design.",
      url: "https://github.com/Alexchiuu/rainmeter_desktop_plugin",
      tags: ["Lua", "Rainmeter", "UI/UX Design"],
      coverImage: "/projects/rainmeter.jpg"
    },
    {
      id: 4,
      title: "ROS Ackermann Car",
      description: "A Robot Operating System (ROS2) package for simulating an Ackermann steering car in Gazebo. Includes launch files, URDF models, and controller configurations for autonomous vehicle development.",
      url: "https://github.com/Alexchiuu/ROS_ackermann_car",
      tags: ["Python", "ROS2", "Robotics"],
      coverImage: "/projects/ros-car.jpg"
    }
  ];

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
              <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Intro</Link>
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
          {/* Title Section */}
          <div 
            className={`mb-12 w-full transition-all duration-1000 delay-300 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 
              className="text-6xl md:text-7xl font-bold text-gray-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Projects
            </h2>
            <div className="w-24 h-1 bg-blue-900 mt-4"></div>
          </div>
          
          {/* Projects Grid */}
          <div 
            ref={projectsRef}
            className="w-full space-y-8"
          >
            {projects.map((project, index) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block group transition-all duration-700 ease-out ${
                  projectsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ 
                  transitionDelay: projectsInView ? `${200 + index * 100}ms` : '0ms'
                }}
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                    {/* Cover Image */}
                    <div className="relative h-48 md:h-auto md:min-h-[200px] overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                      <div className="absolute inset-0 flex items-center justify-center text-blue-600 text-6xl opacity-20 pointer-events-none z-0">
                        📷
                      </div>
                      <div className="relative w-full h-full z-10">
                        <Image
                          src={project.coverImage}
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="md:col-span-2 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 
                            className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors"
                            style={{ fontFamily: 'var(--font-poppins)' }}
                          >
                            {project.title}
                          </h3>
                          <svg 
                            className="w-5 h-5 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
