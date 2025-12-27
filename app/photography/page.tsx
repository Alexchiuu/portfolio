"use client";

import { useState, useEffect } from "react";
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [cities, setCities] = useState<string[]>([]);

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

        setPhotos(photosList);
        setCities(citiesList);
        setHasLoaded(true);
      } catch (error) {
        console.error('Error loading photo metadata:', error);
        setHasLoaded(true);
      }
    };

    loadPhotos();
  }, []);

  const filteredPhotos = selectedCategory === "all" 
    ? photos 
    : photos.filter(photo => photo.city === selectedCategory);

  const openModal = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
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
        className="min-h-screen relative overflow-hidden pt-20"
        style={{ 
          background: 'linear-gradient(to right, #dbeafe 0%, #dbeafe 40%, #ffffff 40%, #ffffff 100%)',
          fontFamily: 'var(--font-inter)'
        }}
      >
        <main className="flex w-full max-w-7xl flex-col items-center mx-auto px-8 py-16 relative z-10">
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
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === "all"
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                All Cities
              </button>
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

          {/* Photo Gallery */}
          <div 
            className={`w-full transition-all duration-1000 delay-700 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {selectedCategory === "all" ? (
              // Group by city when showing all
              cities.map((city) => {
                const cityPhotos = photos.filter(photo => photo.city === city);
                if (cityPhotos.length === 0) return null;
                
                return (
                  <div key={city} className="mb-12">
                    <h2 
                      className="text-3xl font-bold text-gray-900 mb-6" 
                      style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                      {city === 'No GPS Data' ? 'Other Photos' : city} <span className="text-lg font-normal text-gray-500">({cityPhotos.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cityPhotos.map((photo, index) => (
                        <div
                          key={photo.id}
                          className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-gray-100 aspect-[4/3]"
                          onClick={() => openModal(photo)}
                          style={{
                            animationDelay: `${index * 100}ms`
                          }}
                        >
                          <Image
                            src={photo.src}
                            alt={photo.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center p-4">
                              <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
                                {photo.title}
                              </h3>
                              {photo.location && (
                                <p className="text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>
                                  {photo.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Show photos in grid when a specific city is selected
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-gray-100 aspect-[4/3]"
                    onClick={() => openModal(photo)}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center p-4">
                        <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
                          {photo.title}
                        </h3>
                        {photo.location && (
                          <p className="text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>
                            {photo.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Empty State */}
          {filteredPhotos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>
                No photos found in this category.
              </p>
            </div>
          )}
        </main>

        {/* Modal for full-size photo view */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <div 
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="relative w-full aspect-video bg-gray-100">
                  <Image
                    src={selectedPhoto.src}
                    alt={selectedPhoto.alt}
                    fill
                    className="object-contain"
                    sizes="90vw"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {selectedPhoto.title}
                  </h2>
                  {selectedPhoto.location && (
                    <p className="text-gray-600 mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
                      📍 {selectedPhoto.location}
                    </p>
                  )}
                  {selectedPhoto.date && (
                    <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {selectedPhoto.date}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

