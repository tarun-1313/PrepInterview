"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface TechIconProps {
  tech: string;
  url: string;
  fallbackUrl?: string;
  index: number;
}

const TechIcon = ({ tech, url, fallbackUrl, index }: TechIconProps) => {
  const [currentSrc, setCurrentSrc] = useState(url);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imgKey, setImgKey] = useState(0);

  const handleError = () => {
    console.log(`Image failed to load: ${currentSrc}, trying fallback`);
    if (!hasError && fallbackUrl) {
      // First try the fallback URL if primary fails
      setCurrentSrc(fallbackUrl);
      setHasError(true);
      setImgKey(prev => prev + 1);
    } else {
      console.log(`Using fallback for: ${tech}`);
      // Use a data URL as a last resort
      setCurrentSrc("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Crect width='20' height='20' fill='%23374151' rx='4'/%3E%3Ctext x='10' y='14' font-family='Arial, sans-serif' font-size='10' fill='%23d1d5db' text-anchor='middle' font-weight='bold'%3E" + tech.charAt(0).toUpperCase() + "%3C/text%3E%3C/svg%3E");
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Reset state when tech changes
  useEffect(() => {
    setCurrentSrc(url);
    setHasError(false);
    setIsLoading(true);
    setImgKey(prev => prev + 1);
  }, [url, fallbackUrl]);

  return (
    <div 
      className="relative bg-dark-300 rounded-full p-2 flex items-center justify-center"
      title={tech}  // Show tech name on hover
    >
      <div className={`relative w-10 h-10 flex items-center justify-center ${isLoading ? 'animate-pulse' : ''}`}>
        <Image
          key={imgKey}
          src={currentSrc}
          alt={tech}
          width={32}
          height={32}
          className={`w-full h-full object-contain ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={handleError}
          onLoad={handleLoad}
          priority={false}
          unoptimized={currentSrc.startsWith('data:')}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-dark-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechIcon;