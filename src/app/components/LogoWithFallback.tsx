// 'use client';

// import { useState } from 'react';

// export default function LogoWithFallback() {
//   const [hasError, setHasError] = useState(false);
//   const [isLoaded, setIsLoaded] = useState(false);

//   if (hasError) {
//     // Fallback: Display a styled placeholder
//     return (
//       <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
//         TIK
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-20 h-20">
//       {/* Show loading skeleton until image loads */}
//       {!isLoaded && (
//         <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
//       )}
      
//       <img 
//         src="/logo/TIK_POLRI.png"
//         alt="TIK POLRI Logo"
//         className={`w-20 h-20 object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
//         onLoad={() => setIsLoaded(true)}
//         onError={() => setHasError(true)}
//         style={{ 
//           maxWidth: '100%', 
//           height: 'auto',
//           display: 'block'
//         }}
//       />
//     </div>
//   );
// }