// file: app/layout.tsx
import './globals.css';
import './chrome-optimizations.css'; // Chrome-specific optimizations
import { AppThemeProvider } from './providers';
import { Toaster } from 'react-hot-toast';

export const metadata = { /* ... */ };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning> 
      <head>
        {/* Chrome-specific meta tags for better performance */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body>
        <AppThemeProvider>
          <Toaster position="top-center" />
          {children}
        </AppThemeProvider>
      </body>
    </html>
  );
}