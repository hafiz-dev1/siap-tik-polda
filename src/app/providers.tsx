// file: app/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from "next-themes";

export function AppThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider {...props} attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}