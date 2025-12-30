"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import InteractiveBackground from "../components/InteractiveBackground";

interface Photo {
  id: number;
  src: string;
  alt: string;
  title?: string;
  location?: string;
  date?: string;
  category?: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface PhotoMetadata {
  filename: string;
  latitude: number | null;
  longitude: number | null;
  city: string;
  date: string | null;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export default function PhotographyPage() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exifData, setExifData] = useState<any>(null);
  const [detailedLocation, setDetailedLocation] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAuthor, setCommentAuthor] = useState<string>("");
  const [commentText, setCommentText] = useState<string>("");
  const [showPhotoControls, setShowPhotoControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const photoRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);
  const photoControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const categories = ["all", "landscape", "urban", "nature"];

  useEffect(() => {
    // Load metadata and create photos array sorted by city
    const loadPhotos = async () => {
      try {
        const response = await fetch('/photography/metadata.json');
        const data = await response.json();
        
        const photoMetadata: PhotoMetadata[] = data.photos || [];
        const citiesList = data.cities || [];
        
        // Create photos array with city information, sorted by city
        const photosList: Photo[] = photoMetadata.map((meta, index) => {
          const dateStr = meta.date 
            ? new Date(meta.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : null;
          
          return {
            id: index + 1,
            src: `/photography/${meta.filename}`,
            alt: `Photo from ${meta.city}`,
            title: undefined,
            location: meta.city !== 'No GPS Data' ? meta.city : undefined,
            date: dateStr || undefined,
            category: "all",
            city: meta.city,
            latitude: meta.latitude,
            longitude: meta.longitude
          };
        });

        // Sort by city (already sorted in metadata, but ensure it)
        photosList.sort((a, b) => {
          const cityA = a.city || 'ZZZ';
          const cityB = b.city || 'ZZZ';
          if (cityA === cityB) {
            return a.title?.localeCompare(b.title || '') || 0;
          }
          return cityA.localeCompare(cityB);
        });

        const validCities = citiesList.filter((city: string) => city !== 'No GPS Data');
        setPhotos(photosList);
        setCities(citiesList);
        // Set initial category to first valid city
        if (validCities.length > 0) {
          setSelectedCategory(validCities[0]);
        }
        setHasLoaded(true);
        photoRefs.current = new Array(photosList.length).fill(null);
      } catch (error) {
        console.error('Error loading photo metadata:', error);
        setHasLoaded(true);
      }
    };

    loadPhotos();
  }, []);

  const filteredPhotos = photos.filter(photo => photo.city === selectedCategory);

  // Reset to first photo when category changes
  useEffect(() => {
    setCurrentPhotoIndex(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
    // Clear any pending scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, [selectedCategory]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Scroll to center photo when index changes (only if not user scrolling)
  useEffect(() => {
    if (!isScrollingRef.current && photoRefs.current[currentPhotoIndex] && scrollContainerRef.current) {
      const photoElement = photoRefs.current[currentPhotoIndex];
      const container = scrollContainerRef.current;
      const containerWidth = container.offsetWidth;
      const photoLeft = photoElement.offsetLeft;
      const photoWidth = photoElement.offsetWidth;
      const scrollPosition = photoLeft - (containerWidth / 2) + (photoWidth / 2);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [currentPhotoIndex, filteredPhotos.length]);

  // Handle scroll to detect current photo and snap to center
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    isScrollingRef.current = true;
    const container = scrollContainerRef.current;
    const containerCenter = container.scrollLeft + container.offsetWidth / 2;
    
    let closestIndex = 0;
    let closestDistance = Infinity;

    photoRefs.current.forEach((ref, index) => {
      if (ref) {
        const photoCenter = ref.offsetLeft + ref.offsetWidth / 2;
        const distance = Math.abs(photoCenter - containerCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }
    });

    if (closestIndex !== currentPhotoIndex) {
      setCurrentPhotoIndex(closestIndex);
    }

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set timeout to snap to center after scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      snapToCenter();
      isScrollingRef.current = false;
    }, 50);
  };

  // Snap to center photo
  const snapToCenter = () => {
    if (!scrollContainerRef.current || filteredPhotos.length === 0) return;

    const container = scrollContainerRef.current;
    const containerCenter = container.scrollLeft + container.offsetWidth / 2;
    
    let closestIndex = 0;
    let closestDistance = Infinity;

    photoRefs.current.forEach((ref, index) => {
      if (ref) {
        const photoCenter = ref.offsetLeft + ref.offsetWidth / 2;
        const distance = Math.abs(photoCenter - containerCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }
    });

    // Snap to the closest photo
    const closestPhotoElement = photoRefs.current[closestIndex];
    if (closestPhotoElement) {
      const photoLeft = closestPhotoElement.offsetLeft;
      const photoWidth = closestPhotoElement.offsetWidth;
      const scrollPosition = photoLeft - (container.offsetWidth / 2) + (photoWidth / 2);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });

      setCurrentPhotoIndex(closestIndex);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPhotoIndex, filteredPhotos.length]);

  const goToPrevious = () => {
    isScrollingRef.current = false;
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? filteredPhotos.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    isScrollingRef.current = false;
    setCurrentPhotoIndex((prev) => 
      prev === filteredPhotos.length - 1 ? 0 : prev + 1
    );
  };

  const currentPhoto = filteredPhotos[currentPhotoIndex];

  // Load comments for a photo from localStorage
  const loadComments = (photoSrc: string): Comment[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(`photo_comments_${photoSrc}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading comments:', error);
      return [];
    }
  };

  // Save comments for a photo to localStorage
  const saveComments = (photoSrc: string, comments: Comment[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`photo_comments_${photoSrc}`, JSON.stringify(comments));
    } catch (error) {
      console.error('Error saving comments:', error);
    }
  };

  // Load photo data for modal
  const loadPhotoData = async (photo: Photo) => {
    setSelectedPhoto(photo);
    setExifData(null);
    setDetailedLocation(null);
    setCommentAuthor("");
    setCommentText("");
    
    // Load comments for this photo
    const photoComments = loadComments(photo.src);
    setComments(photoComments);
    
    // Fetch detailed location from GPS coordinates using Nominatim (OpenStreetMap)
    if (photo.latitude !== null && photo.latitude !== undefined && 
        photo.longitude !== null && photo.longitude !== undefined) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${photo.latitude}&lon=${photo.longitude}&zoom=18&addressdetails=1&accept-language=en`,
          {
            headers: {
              'User-Agent': 'Personal Photography Website',
              'Accept-Language': 'en'
            }
          }
        );
        const data = await response.json();
        
        if (data.address) {
          const address = data.address;
          const locationParts: string[] = [];
          
          // Build location string in format: country/city/district
          // Start with country (most general)
          if (address.country) {
            locationParts.push(address.country);
          }
          
          // Add state/region if available
          if (address.state || address.region) {
            locationParts.push(address.state || address.region);
          }
          
          // Add city/town/village
          if (address.city || address.town || address.village) {
            locationParts.push(address.city || address.town || address.village);
          }
          
          // Add district/neighbourhood/suburb (most specific)
          if (address.neighbourhood || address.suburb || address.city_district || address.county) {
            locationParts.push(address.neighbourhood || address.suburb || address.city_district || address.county);
          }
          
          // Join with forward slashes for hierarchical display
          setDetailedLocation(locationParts.join(' / '));
        }
      } catch (error) {
        console.error('Error fetching location details:', error);
      }
    }
    
    // Extract EXIF data from the image
    try {
      const exifrModule = await import('exifr');
      const exif = await exifrModule.default.parse(photo.src, {
        exif: true,
        gps: true,
        iptc: true,
        translateKeys: true,
        translateValues: true,
        reviveValues: true,
      });
      setExifData(exif);
    } catch (error) {
      console.error('Error extracting EXIF data:', error);
    }
  };

  // Handle photo click - slide to photo if not center, open modal if center
  const handlePhotoClick = async (photo: Photo) => {
    const clickedIndex = filteredPhotos.findIndex(p => p.src === photo.src);
    
    // If clicking on a side photo, slide to it
    if (clickedIndex !== currentPhotoIndex && clickedIndex !== -1) {
      isScrollingRef.current = false;
      setCurrentPhotoIndex(clickedIndex);
      return;
    }
    
    // If clicking on the center photo, open modal
    if (clickedIndex === currentPhotoIndex) {
      setIsModalOpen(true);
      setShowPhotoControls(true);
      await loadPhotoData(photo);
    }
  };

  // Handle mouse enter on photo section
  const handlePhotoMouseEnter = () => {
    setShowPhotoControls(true);
    if (photoControlsTimeoutRef.current) {
      clearTimeout(photoControlsTimeoutRef.current);
    }
  };

  // Handle mouse leave on photo section
  const handlePhotoMouseLeave = () => {
    if (photoControlsTimeoutRef.current) {
      clearTimeout(photoControlsTimeoutRef.current);
    }
    photoControlsTimeoutRef.current = setTimeout(() => {
      setShowPhotoControls(false);
    }, 2000); // Hide after 2 seconds
  };

  // Navigate to previous photo in modal
  const handlePreviousPhoto = async () => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.src === selectedPhoto.src);
    if (currentIndex === -1) return;
    const prevIndex = currentIndex === 0 ? filteredPhotos.length - 1 : currentIndex - 1;
    await loadPhotoData(filteredPhotos[prevIndex]);
  };

  // Navigate to next photo in modal
  const handleNextPhoto = async () => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.src === selectedPhoto.src);
    if (currentIndex === -1) return;
    const nextIndex = currentIndex === filteredPhotos.length - 1 ? 0 : currentIndex + 1;
    await loadPhotoData(filteredPhotos[nextIndex]);
  };

  // Handle adding a new comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhoto || !commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: commentAuthor.trim() || "Anonymous",
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    saveComments(selectedPhoto.src, updatedComments);
    setCommentText("");
    setCommentAuthor("");
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
    setExifData(null);
    setDetailedLocation(null);
    setComments([]);
    setCommentAuthor("");
    setCommentText("");
    setShowPhotoControls(true);
    setIsFullscreen(false);
    if (photoControlsTimeoutRef.current) {
      clearTimeout(photoControlsTimeoutRef.current);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (photoControlsTimeoutRef.current) {
        clearTimeout(photoControlsTimeoutRef.current);
      }
    };
  }, []);

  // Handle keyboard escape to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

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
            <Link href="/" className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Chiu Alex
            </Link>
            <div className="flex gap-2 sm:gap-4 md:gap-6 text-sm sm:text-base" style={{ fontFamily: 'var(--font-poppins)' }}>
              <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap">Intro</Link>
              <Link href="/resume" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap">About Me</Link>
              <Link href="/projects" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap">Projects</Link>
              <Link href="/photography" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap hidden sm:inline">Photo</Link>
              <Link href="/photography" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap sm:hidden">Photo</Link>
              <Link href="/#contact" className="text-gray-700 hover:text-gray-900 transition-colors font-medium whitespace-nowrap hidden md:inline">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      <div 
        className="min-h-screen relative pt-20"
        style={{ 
          fontFamily: 'var(--font-inter)',
          overflowY: 'visible'
        }}
      >
        {/* Interactive Background */}
        <InteractiveBackground />
        <main className="flex w-full max-w-7xl flex-col items-center mx-auto px-0 py-20 md:py-32 relative z-10" style={{ overflow: 'visible' }}>
          {/* Header */}
          <div 
            className={`w-full text-center mb-16 transition-all duration-1000 delay-300 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h1 
              className="mb-4 text-6xl md:text-7xl font-bold text-gray-900" 
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Photography
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          {/* City Filter */}
          {cities.length > 0 && (
            <div 
              className={`w-full mb-8 flex flex-wrap justify-center gap-4 transition-all duration-1000 delay-500 ${
                hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {cities.filter((city: string) => city !== 'No GPS Data').map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCategory(city)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === city
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  {city}
                </button>
              ))}
            </div>
          )}

          {/* Film Strip Gallery */}
          {filteredPhotos.length > 0 && (
          <div 
              className={`w-screen transition-all duration-1000 delay-700 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
              style={{ overflow: 'visible', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}
            >
              {/* Scrollable Container */}
              <div className="relative w-full" style={{ overflow: 'visible' }}>
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="w-full overflow-x-auto pb-8"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    overflowY: 'visible'
                  }}
                >
                  <div 
                    className="flex items-center gap-4 sm:gap-8 py-8 sm:py-12" 
                    style={{ 
                      paddingLeft: 'max(1rem, calc(50vw - min(400px, 45vw)))', 
                      paddingRight: 'max(1rem, calc(50vw - min(400px, 45vw)))',
                      minWidth: 'max-content',
                      overflow: 'visible'
                    }}
                  >
                    {filteredPhotos.map((photo, index) => {
                      const isActive = index === currentPhotoIndex;
                      const distance = Math.abs(index - currentPhotoIndex);
                      const opacity = isActive ? 1 : Math.max(0.2, 1 - distance * 0.25);
                      const scale = isActive ? 1 : Math.max(0.5, 1 - distance * 0.12);
                
                return (
                        <div
                          key={photo.id}
                          ref={(el) => {
                            photoRefs.current[index] = el;
                          }}
                          className="flex-shrink-0 transition-all duration-500 ease-out cursor-pointer"
                          style={{
                            opacity: opacity,
                            transform: `scale(${scale})`,
                            width: 'min(800px, 90vw)',
                            height: 'min(600px, calc(90vw * 0.75))'
                          }}
                          onClick={() => handlePhotoClick(photo)}
                        >
                          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                          <Image
                            src={photo.src}
                            alt={photo.alt}
                            fill
                              className="object-contain rounded-2xl"
                              sizes="(max-width: 768px) 90vw, 800px"
                            />
                    </div>
                  </div>
                );
                    })}
                    </div>
                  </div>
              </div>

              </div>
            )}

          {/* Empty State */}
          {filteredPhotos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>
                No photos found in this category.
              </p>
            </div>
          )}
        </main>

      {/* Photo Modal */}
      {isModalOpen && selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Black low opacity backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          
            {/* Modal Content - Full viewport fit, no scrolling */}
          <div 
              className="relative z-10 w-full h-full max-w-7xl max-h-[95vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo Frame/Case */}
              <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-h-[95vh] flex flex-col md:flex-row overflow-hidden">
              {/* Close Button */}
              <button
                onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl font-light z-20 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white transition-colors"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                ×
              </button>
              
                {/* Photo Section - Left side on desktop, top on mobile */}
                <div 
                  className="relative w-full md:w-3/5 h-2/5 md:h-full flex-shrink-0 bg-black flex items-center justify-center p-4 md:p-8"
                  onMouseEnter={handlePhotoMouseEnter}
                  onMouseLeave={handlePhotoMouseLeave}
                >
                  {/* Navigation Buttons - Left and Right */}
                  {filteredPhotos.length > 1 && (
                    <>
                      <button
                        onClick={handlePreviousPhoto}
                        className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg hover:scale-110 transition-opacity duration-500 ease-in-out ${
                          showPhotoControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        aria-label="Previous photo"
                      >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleNextPhoto}
                        className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg hover:scale-110 transition-opacity duration-500 ease-in-out ${
                          showPhotoControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        aria-label="Next photo"
                      >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      {/* Photo Counter */}
                      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-medium transition-opacity duration-500 ease-in-out ${
                        showPhotoControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}>
                        {filteredPhotos.findIndex(p => p.src === selectedPhoto.src) + 1} / {filteredPhotos.length}
                      </div>
                    </>
                  )}
                  <div 
                    className="relative w-full h-full max-h-full cursor-zoom-in"
                    onClick={() => setIsFullscreen(true)}
                  >
                  <Image
                    src={selectedPhoto.src}
                    alt={selectedPhoto.alt}
                    fill
                    className="object-contain"
                      sizes="(max-width: 768px) 100vw, 60vw"
                      priority
                  />
                  </div>
              </div>

                {/* Details Section - Right side on desktop, bottom on mobile */}
                <div className="w-full md:w-2/5 h-3/5 md:h-full flex flex-col bg-white p-6 md:p-8 relative" style={{ fontFamily: 'var(--font-poppins)' }}>
                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto mb-4">
              {/* Photo Information */}
                    <div className="mb-6">
                    <div className="space-y-3">
                      {detailedLocation ? (
                        <div>
                          <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-1">Location</h3>
                          <p className="text-base md:text-lg text-gray-900 font-medium">{detailedLocation}</p>
                        </div>
                      ) : selectedPhoto.location && (
                        <div>
                          <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-1">Location</h3>
                          <p className="text-base md:text-lg text-gray-900 font-medium">{selectedPhoto.location}</p>
                        </div>
                      )}
                      
                      {selectedPhoto.latitude !== null && selectedPhoto.latitude !== undefined && 
                       selectedPhoto.longitude !== null && selectedPhoto.longitude !== undefined && (
                        <div>
                          <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-1">Coordinates</h3>
                          <div className="flex flex-col gap-1">
                            <p className="text-sm text-gray-900 font-mono font-medium">
                              {selectedPhoto.latitude.toFixed(6)}, {selectedPhoto.longitude.toFixed(6)}
                            </p>
                            <a
                              href={`https://www.google.com/maps?q=${selectedPhoto.latitude},${selectedPhoto.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1 font-medium"
                            >
                              View on Google Maps
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {selectedPhoto.date && (
                        <div>
                          <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-1">Date</h3>
                          <p className="text-base md:text-lg text-gray-900 font-medium">{selectedPhoto.date}</p>
                        </div>
                      )}
                    </div>
                  </div>

                    {/* Camera Settings */}
                    {exifData && (
                      <div className="pt-4 border-t border-gray-200 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                          {exifData.Make && exifData.Model && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-800 uppercase mb-1 font-semibold">Camera</p>
                              <p className="text-sm font-medium text-gray-900">{exifData.Make} {exifData.Model}</p>
                            </div>
                          )}
                          {exifData.FocalLength && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-800 uppercase mb-1 font-semibold">Focal Length</p>
                              <p className="text-sm font-medium text-gray-900">{exifData.FocalLength}{exifData.FocalLengthIn35mmFormat && ` (${exifData.FocalLengthIn35mmFormat}mm equiv.)`}</p>
                            </div>
                          )}
                          {exifData.FNumber && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-800 uppercase mb-1 font-semibold">Aperture</p>
                              <p className="text-sm font-medium text-gray-900">f/{exifData.FNumber}</p>
                            </div>
                          )}
                          {exifData.ExposureTime && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-800 uppercase mb-1 font-semibold">Shutter Speed</p>
                              <p className="text-sm font-medium text-gray-900">{exifData.ExposureTime}s</p>
                        </div>
                      )}
                      {exifData.ISO && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-800 uppercase mb-1 font-semibold">ISO</p>
                              <p className="text-sm font-medium text-gray-900">{exifData.ISO}</p>
                        </div>
                      )}
                      {exifData.LensModel && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-800 uppercase mb-1 font-semibold">Lens</p>
                              <p className="text-sm font-medium text-gray-900">{exifData.LensModel}</p>
                        </div>
                      )}
                      {exifData.ImageWidth && exifData.ImageHeight && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-800 uppercase mb-1 font-semibold">Resolution</p>
                              <p className="text-sm font-medium text-gray-900">{exifData.ImageWidth} × {exifData.ImageHeight}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Show message if no EXIF data */}
                    {!exifData && (
                      <div className="pt-4 border-t border-gray-200 mb-6 text-center">
                        <p className="text-sm text-gray-700">Loading camera settings...</p>
                      </div>
                    )}
                  </div>

                  {/* Comments - Sticky to bottom */}
                  <div className="pt-4 border-t border-gray-200 flex-shrink-0">
                    {/* Comments List */}
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                      {comments.length === 0 ? (
                        <p className="text-sm text-gray-800 italic font-medium">No comments yet. Be the first to comment!</p>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between mb-1">
                              <p className="text-sm font-semibold text-gray-900">{comment.author}</p>
                              <p className="text-xs text-gray-700 font-medium">
                                {new Date(comment.timestamp).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <p className="text-sm text-gray-900 font-medium">{comment.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Comment Form */}
                    <form onSubmit={handleAddComment} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wide mb-1">
                          Your Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your name"
                          value={commentAuthor}
                          onChange={(e) => setCommentAuthor(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wide mb-1">
                          Your Comment <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          placeholder="Write your comment here..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          rows={3}
                          required
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
                      >
                        Post Comment
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Photo View */}
        {isFullscreen && selectedPhoto && (
          <div 
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl font-light z-20 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label="Close fullscreen"
            >
              ×
            </button>
            
            {/* Fullscreen Image */}
            <div className="relative w-full h-full flex items-center justify-center p-8">
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <footer 
          id="contact"
          className="w-full bg-gray-900 text-gray-300 mt-20 relative z-10"
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
                        About Me
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
