"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import InteractiveBackground from "./components/InteractiveBackground";

export default function Home() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(true);

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Hide scroll arrow when user scrolls down
      if (window.scrollY > 100) {
        setShowScrollArrow(false);
      } else {
        setShowScrollArrow(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
  ];

  const exploreItems = [
    {
      title: "About Me",
      description: "View my professional experience, education, and skills.",
      link: "/resume",
      image: "/profile.png",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Projects",
      description: "Explore my coding projects and technical work.",
      link: "/projects",
      image: "/projects/discord-bot.jpg",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Photography",
      description: "Discover my travel photography and visual stories.",
      link: "/photography",
      image: "/photography/A6400887.JPG",
      color: "from-orange-500 to-red-500"
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
        <div className="max-w-6xl mx-auto px-2 sm:px-8 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-base sm:text-xl font-bold text-gray-900 shrink-0" style={{ fontFamily: 'var(--font-playfair)' }}>Chiu Alex</Link>
            <div className="flex gap-1 sm:gap-4 md:gap-6 text-xs sm:text-base" style={{ fontFamily: 'var(--font-poppins)' }}>
              <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap hidden min-[375px]:inline">Intro</Link>
              <Link href="/resume" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap">About Me</Link>
              <Link href="/projects" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap">Projects</Link>
              <Link href="/photography" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap hidden sm:inline">Photo</Link>
              <Link href="/photography" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap sm:hidden">Photo</Link>
              <a href="#contact" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap hidden md:inline">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Interactive Background */}
      <InteractiveBackground />

      {/* Main Content */}
      <div className="relative min-h-screen z-10 pt-20">
        <main className="flex flex-col items-center justify-center min-h-screen px-8 py-32 relative">
          {/* Hero Section */}
          <div 
            id="about"
            className={`text-center mb-40 transition-all duration-1000 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h1 
              className="text-6xl md:text-7xl font-bold mb-12 text-gray-900 drop-shadow-sm"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
                Chiu Alex
              </h1>
            <div className="w-32 h-1 bg-blue-500 mx-auto mb-12"></div>
            <p 
              className="text-xl md:text-2xl text-gray-800 mb-8 font-light"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Electrical Engineering Student
            </p>
            <p 
              className="text-lg text-gray-700 mb-10"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              National Taiwan University
            </p>
            <p 
              className="text-lg text-gray-700 max-w-2xl mx-auto mb-12"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Passionate about technology and innovation
            </p>
                  <a 
                    href="https://www.google.com/maps/place/Taipei,+Taiwan"
                    target="_blank"
                    rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 backdrop-blur-md text-gray-800 rounded-full hover:bg-blue-100 transition-all duration-300 border border-blue-200"
              style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="text-gray-800">Taipei, Taiwan</span>
                  </a>
                </div>

          {/* Scroll Arrow Indicator */}
          <div 
            className={`w-full flex justify-center mt-20 mb-20 transition-all duration-500 ${
              showScrollArrow && hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
            onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
          >
            <div className="flex flex-col items-center cursor-pointer group">
              <svg 
                className="animate-bounce w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* Explore More Section */}
          <div className="w-full max-w-6xl mt-32">
            <h2 
              className="text-4xl font-bold text-gray-900 text-center mb-16 drop-shadow-sm"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Explore More
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {exploreItems.map((item, index) => (
                <Link
                  key={item.title}
                  href={item.link}
                  className={`group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ 
                    transitionDelay: `${index * 150}ms`
                  }}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
          </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 
                      className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors"
                      style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                      {item.title}
                    </h3>
                    <p 
                      className="text-gray-700 text-sm leading-relaxed"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      {item.description}
                    </p>
                    <div className="mt-4 flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                      <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-poppins)' }}>Explore</span>
                      <svg 
                        className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
              </div>
              </div>
                </Link>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer 
          id="contact"
          className={`w-full bg-gray-900 text-gray-300 transition-all duration-1000 ${
            hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="w-full px-8 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                {/* Quick Links */}
                <div>
                  <h3 className="text-white font-semibold mb-4 text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Quick Links
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/resume" className="hover:text-white transition-colors duration-200" style={{ fontFamily: 'var(--font-poppins)' }}>
                        Resume
                      </Link>
                    </li>
                      <li>
                        <Link href="/projects" className="hover:text-white transition-colors duration-200" style={{ fontFamily: 'var(--font-poppins)' }}>
                          Projects
                        </Link>
                      </li>
                      <li>
                        <Link href="/photography" className="hover:text-white transition-colors duration-200" style={{ fontFamily: 'var(--font-poppins)' }}>
                          Photography
                        </Link>
                      </li>
                      <li>
                        <a href="#contact" className="hover:text-white transition-colors duration-200" style={{ fontFamily: 'var(--font-poppins)' }}>
                          Contact
                        </a>
                      </li>
                  </ul>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-white font-semibold mb-4 text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Contact
                  </h3>
                  <ul className="space-y-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                    <li>
                      <a 
                        href="mailto:b14901022@g.ntu.edu.tw" 
                        className="hover:text-white transition-colors duration-200"
                      >
                        b14901022@g.ntu.edu.tw
                      </a>
                    </li>
                    <li className="text-gray-400">
                      Taipei, Taiwan
                    </li>
                    <li className="text-gray-400">
                      National Taiwan University
                    </li>
                  </ul>
                </div>

                {/* Social Media */}
                <div className="md:col-span-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {socialLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex flex-col items-center justify-center gap-2 bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-all duration-300 hover:scale-105"
                      >
                        <svg
                          className="h-6 w-6 fill-gray-300 group-hover:fill-white transition-colors"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d={link.icon} />
                        </svg>
                        <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors" style={{ fontFamily: 'var(--font-poppins)' }}>
                          {link.name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-800 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-poppins)' }}>
                    © 2025 Chiu Alex. All rights reserved.
                  </p>
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-poppins)' }}>
                    Built with Next.js & Tailwind CSS
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
