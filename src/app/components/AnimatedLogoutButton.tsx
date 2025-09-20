// file: app/components/AnimatedLogoutButton.tsx
'use client';

import { useState } from 'react';

type Props = {
  onLogout: () => Promise<void>;
};

export default function AnimatedLogoutButton({ onLogout }: Props) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);

  const handleClick = async () => {
    setIsLoggingOut(true);
    
    // Show loading animation for 500ms
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Show success state
    setLogoutSuccess(true);
    
    // Show success animation for 300ms before logout
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await onLogout();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoggingOut || logoutSuccess}
      className={`
        px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out
        ${logoutSuccess
          ? 'bg-green-600 text-white border border-green-600' 
          : isLoggingOut 
            ? 'bg-gray-400 text-gray-200 border border-gray-400 cursor-not-allowed' 
            : 'text-white bg-red-600 hover:bg-red-700 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
        }
      `}
    >
      {logoutSuccess ? (
        <div className="flex items-center space-x-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-white animate-pulse" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
          <span>Berhasil!</span>
        </div>
      ) : isLoggingOut ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Keluar...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          <span>Logout</span>
        </div>
      )}
    </button>
  );
}