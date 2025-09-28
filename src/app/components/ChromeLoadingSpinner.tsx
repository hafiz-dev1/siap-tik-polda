'use client';

import { useState, useEffect } from 'react';

interface ChromeLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ChromeLoadingSpinner({ 
  size = 'md', 
  className = '' 
}: ChromeLoadingSpinnerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay showing spinner to avoid flash for fast operations
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`${sizeClasses[size]} chrome-spinner ${className}`}
      style={{
        border: '2px solid rgba(59, 130, 246, 0.2)',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
      aria-label="Loading..."
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}