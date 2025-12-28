"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface Photo {
  id: number;
  src: string;
  alt: string;
  title?: string;
  location?: string;
  date?: string;
  category?: string;
  city?: string;
}

interface PhotoMetadata {
  filename: string;
  latitude: number | null;
  longitude: number | null;
  city: string;
  date: string | null;
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);

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
            ? new Date(meta.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
            : null;
          
          return {
            id: index + 1,
            src: `/photography/${meta.filename}`,
            alt: `Photo from ${meta.city}`,
            title: meta.filename.replace('.JPG', '').replace('.jpg', ''),
            location: meta.city !== 'No GPS Data' ? meta.city : undefined,
            date: dateStr || undefined,
            category: "all",
            city: meta.city
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

        const validCities = citiesList.filter(city => city !== 'No GPS Data');
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
    }, 150);
  };

  // Snap to center photo
  const snapToCenter = () => {
    if (!scrollContainerRef.current || filteredPhotos.length === 0) return;

    const container = scrollContainerRef.current;
    const containerCenter = container.scrollLeft + container.offsetWidth / 2;
    
    let closestIndex = 0;
    let closestDistance = Infinity;
    let closestPhotoElement: HTMLDivElement | null = null;

    photoRefs.current.forEach((ref, index) => {
      if (ref) {
        const photoCenter = ref.offsetLeft + ref.offsetWidth / 2;
        const distance = Math.abs(photoCenter - containerCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
          closestPhotoElement = ref;
        }
      }
    });

    // Snap to the closest photo
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

  // Handle photo click to open modal
  const handlePhotoClick = async (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
    setExifData(null);
    
    // Extract EXIF data from the image
    try {
      const exifrModule = await import('exifr');
      const exif = await exifrModule.default.parse(photo.src, {
        exif: true,
        gps: true,
        iptc: true,
        ifd0: true,
        ifd1: true,
        translateKeys: true,
        translateValues: true,
        reviveValues: true,
      });
      setExifData(exif);
    } catch (error) {
      console.error('Error extracting EXIF data:', error);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
    setExifData(null);
  };

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
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Chiu Alex
            </Link>
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
        className="min-h-screen relative pt-20"
        style={{ 
          background: 'linear-gradient(to right, #dbeafe 0%, #dbeafe 40%, #ffffff 40%, #ffffff 100%)',
          fontFamily: 'var(--font-inter)',
          overflowY: 'visible'
        }}
      >
        <main className="flex w-full max-w-7xl flex-col items-center mx-auto px-0 py-16 relative z-10" style={{ overflow: 'visible' }}>
          {/* Header */}
          <div 
            className={`w-full text-center mb-12 transition-all duration-1000 delay-300 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h1 
              className="mb-4 text-5xl font-bold text-gray-900 sm:text-6xl" 
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Photography
            </h1>
            <p 
              className="text-lg text-gray-600 max-w-2xl mx-auto" 
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Capturing moments and perspectives from around the world
            </p>
          </div>

          {/* City Filter */}
          {cities.length > 0 && (
            <div 
              className={`w-full mb-8 flex flex-wrap justify-center gap-4 transition-all duration-1000 delay-500 ${
                hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {cities.filter(city => city !== 'No GPS Data').map((city) => (
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
                    className="flex items-center gap-8 py-12" 
                    style={{ 
                      paddingLeft: 'calc(50vw - 400px)', 
                      paddingRight: 'calc(50vw - 400px)',
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
                            width: '800px',
                            height: '600px'
                          }}
                          onClick={() => handlePhotoClick(photo)}
                        >
                          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                          <Image
                            src={photo.src}
                            alt={photo.alt}
                            fill
                              className="object-contain rounded-2xl"
                              sizes="800px"
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
      </div>

      {/* Photo Modal */}
      {isModalOpen && selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Black low opacity backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <div 
            className="relative z-10 max-w-5xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo Frame/Case */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl font-light z-20"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                ×
              </button>
              
              {/* Photo in Frame */}
              <div className="relative w-full mb-6">
                <div className="relative rounded-lg overflow-hidden bg-black p-4 shadow-inner" style={{ aspectRatio: '4/3' }}>
                  <div className="relative w-full h-full rounded-md overflow-hidden bg-gray-900">
                  <Image
                    src={selectedPhoto.src}
                    alt={selectedPhoto.alt}
                    fill
                    className="object-contain"
                      sizes="(max-width: 768px) 100vw, 1200px"
                      priority
                  />
                  </div>
                </div>
              </div>

              {/* Photo Information */}
              <div className="space-y-4" style={{ fontFamily: 'var(--font-poppins)' }}>
                {/* Basic Info */}
                  {selectedPhoto.location && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</h3>
                    <p className="text-lg text-gray-900">{selectedPhoto.location}</p>
                  </div>
                )}
                
                  {selectedPhoto.date && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Date</h3>
                    <p className="text-lg text-gray-900">{selectedPhoto.date}</p>
                  </div>
                )}

                {/* EXIF Data */}
                {exifData && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Camera Settings</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {exifData.Make && exifData.Model && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Camera</p>
                          <p className="text-sm text-gray-900">{exifData.Make} {exifData.Model}</p>
                        </div>
                      )}
                      {exifData.FocalLength && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Focal Length</p>
                          <p className="text-sm text-gray-900">{exifData.FocalLength}{exifData.FocalLengthIn35mmFormat && ` (${exifData.FocalLengthIn35mmFormat}mm equiv.)`}</p>
                        </div>
                      )}
                      {exifData.FNumber && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Aperture</p>
                          <p className="text-sm text-gray-900">f/{exifData.FNumber}</p>
                        </div>
                      )}
                      {exifData.ExposureTime && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Shutter Speed</p>
                          <p className="text-sm text-gray-900">{exifData.ExposureTime}s</p>
                        </div>
                      )}
                      {exifData.ISO && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">ISO</p>
                          <p className="text-sm text-gray-900">{exifData.ISO}</p>
                        </div>
                      )}
                      {exifData.LensModel && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Lens</p>
                          <p className="text-sm text-gray-900">{exifData.LensModel}</p>
                        </div>
                      )}
                      {exifData.ImageWidth && exifData.ImageHeight && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Resolution</p>
                          <p className="text-sm text-gray-900">{exifData.ImageWidth} × {exifData.ImageHeight}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

    </>
  );
}
