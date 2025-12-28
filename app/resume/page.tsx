"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function ResumePage() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [resumeInView, setResumeInView] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Control open/close for resume sections (click-to-toggle)
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

  // Check if resume section is in view
  useEffect(() => {
    const handleScroll = () => {
      if (resumeRef.current) {
        const rect = resumeRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
        setResumeInView(isInView);
      }
    };

    handleScroll(); // Check immediately
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Navigation Header */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300 ${
          hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>Chiu Alex</Link>
            <div className="flex gap-2 sm:gap-4 md:gap-6 text-sm sm:text-base" style={{ fontFamily: 'var(--font-poppins)' }}>
              <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap">Intro</Link>
              <Link href="/resume" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap">Resume</Link>
              <Link href="/projects" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap">Projects</Link>
              <Link href="/photography" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap hidden sm:inline">Photo</Link>
              <Link href="/photography" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap sm:hidden">Photo</Link>
              <Link href="/#contact" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap hidden md:inline">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      <div 
        className="min-h-screen relative overflow-hidden pt-20"
        style={{ 
          background: 'linear-gradient(to bottom, #f0f9ff 0%, #ffffff 100%)',
          fontFamily: 'var(--font-inter)'
        }}
      >
        <main className="flex w-full max-w-6xl flex-col items-center mx-auto px-8 py-20 md:py-32 relative z-10">
          {/* Title Section */}
          <div 
            className={`mb-16 w-full text-center transition-all duration-1000 delay-300 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 
              className="text-6xl md:text-7xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Resume
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          {/* Resume Section */}
          <div 
            ref={resumeRef}
            className={`w-full transition-all duration-1000 delay-500 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Content */}
            <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
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
        </main>

        {/* Footer */}
        <footer 
          id="contact"
          className="w-full bg-gray-900 text-gray-300 mt-20"
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
                      <Link href="/" className="hover:text-white transition-colors duration-200" style={{ fontFamily: 'var(--font-poppins)' }}>
                        Intro
                      </Link>
                    </li>
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
                    {[
                      { name: "GitHub", url: "https://github.com/Alexchiuu", icon: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" },
                      { name: "LinkedIn", url: "https://linkedin.com/in/alex-c-26389239a", icon: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" },
                      { name: "Instagram", url: "https://instagram.com/ccalexisme", icon: "M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.505 4.505 0 0 0 12 7.5zm0 1A3.5 3.5 0 1 1 8.5 12 3.504 3.504 0 0 1 12 8.5zM17 6.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z" },
                      { name: "Discord", url: "https://discord.gg/pNEAjDvN", icon: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" },
                      { name: "Facebook", url: "https://www.facebook.com/chiu.alex.417443", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                    ].map((link) => (
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

