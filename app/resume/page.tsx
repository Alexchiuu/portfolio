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
        const isInView = rect.top < window.innerHeight * 0.7 && rect.bottom > 0;
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
          {/* Resume Section */}
          <div 
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
        </main>
      </div>
    </>
  );
}

