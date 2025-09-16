// file: app/layout.tsx
import './globals.css';
import { AppThemeProvider } from './providers'; // <-- 1. Impor provider
import { Toaster } from 'react-hot-toast'; // Kita sudah punya ini

export const metadata = { /* ... */ };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning> 
      <body>
        {/* 2. Bungkus children dengan AppThemeProvider */}
        <AppThemeProvider> 
          <Toaster position="top-center" />
          {children}
        </AppThemeProvider>
      </body>
    </html>
  );
}