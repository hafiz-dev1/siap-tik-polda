'use client';

import { useEffect, useState } from 'react';

interface BrowserInfo {
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  version: string;
  supportsBackdropFilter: boolean;
  supportsWebGL: boolean;
  isMobile: boolean;
}

export function useBrowserDetection(): BrowserInfo {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({
    isChrome: false,
    isFirefox: false,
    isSafari: false,
    isEdge: false,
    version: '',
    supportsBackdropFilter: false,
    supportsWebGL: false,
    isMobile: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
    const isEdge = /Edg/.test(userAgent);
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);

    // Get version
    let version = '';
    if (isChrome) {
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : '';
    } else if (isFirefox) {
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : '';
    } else if (isSafari) {
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : '';
    } else if (isEdge) {
      const match = userAgent.match(/Edg\/(\d+)/);
      version = match ? match[1] : '';
    }

    // Feature detection
    const supportsBackdropFilter = 'backdropFilter' in document.documentElement.style ||
                                   'webkitBackdropFilter' in document.documentElement.style;
    
    let supportsWebGL = false;
    try {
      const canvas = document.createElement('canvas');
      supportsWebGL = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      supportsWebGL = false;
    }

    setBrowserInfo({
      isChrome,
      isFirefox,
      isSafari,
      isEdge,
      version,
      supportsBackdropFilter,
      supportsWebGL,
      isMobile,
    });
  }, []);

  return browserInfo;
}

export function useChromeOptimizations() {
  const browserInfo = useBrowserDetection();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Apply Chrome-specific optimizations
    if (browserInfo.isChrome) {
      document.documentElement.classList.add('chrome-browser');
      
      // Enable smooth scrolling for Chrome
      document.documentElement.style.scrollBehavior = 'smooth';
      
      // Optimize for Chrome's rendering
      const style = document.createElement('style');
      style.textContent = `
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .chrome-optimized {
          transform: translateZ(0);
          backface-visibility: hidden;
          will-change: transform;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, [browserInfo.isChrome]);

  return {
    ...browserInfo,
    shouldUseGPUAcceleration: browserInfo.isChrome && browserInfo.supportsWebGL,
    shouldUseBackdropFilter: browserInfo.supportsBackdropFilter,
    optimizationClass: browserInfo.isChrome ? 'chrome-optimized' : '',
  };
}