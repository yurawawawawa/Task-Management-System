'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

export type ThemeStyle = 'retro' | 'minimal';
export type AccentColor = 'orange' | 'green';
export type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  themeStyle: ThemeStyle;
  accentColor: AccentColor;
  colorMode: ColorMode;
  setThemeStyle: (theme: ThemeStyle) => void;
  setAccentColor: (accent: AccentColor) => void;
  setColorMode: (mode: ColorMode) => void;
  setThemeAndAccent: (theme: ThemeStyle, accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_COOKIE_KEY = 'trekly_theme_style';
const ACCENT_COOKIE_KEY = 'trekly_accent_color';
const COLOR_MODE_COOKIE_KEY = 'trekly_color_mode';
const COOKIE_EXPIRY_DAYS = 365;

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeStyle;
  initialAccent?: AccentColor;
  initialColorMode?: ColorMode;
}

export function ThemeProvider({
  children,
  initialTheme = 'retro',
  initialAccent = 'orange',
  initialColorMode = 'light',
}: ThemeProviderProps) {
  const [themeStyle, setThemeStyleState] = useState<ThemeStyle>(initialTheme);
  const [accentColor, setAccentColorState] = useState<AccentColor>(initialAccent);
  const [colorMode, setColorModeState] = useState<ColorMode>(initialColorMode);

  // Sync to client cookie with 1 year expiration
  const persistCookie = useCallback((key: string, value: string) => {
    Cookies.set(key, value, {
      expires: COOKIE_EXPIRY_DAYS,
      path: '/',
      sameSite: 'lax',
    });
  }, []);

  // Sync to database via API in the background
  const syncToDatabase = useCallback(async (theme: ThemeStyle, accent: AccentColor, mode: ColorMode) => {
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeStyle: theme, accentColor: accent, colorMode: mode }),
      });
    } catch (err) {
      console.error('Failed to sync theme preferences to database', err);
    }
  }, []);

  const setThemeStyle = useCallback(
    (theme: ThemeStyle) => {
      setThemeStyleState(theme);
      persistCookie(THEME_COOKIE_KEY, theme);
      syncToDatabase(theme, accentColor, colorMode);
    },
    [accentColor, colorMode, persistCookie, syncToDatabase]
  );

  const setAccentColor = useCallback(
    (accent: AccentColor) => {
      setAccentColorState(accent);
      persistCookie(ACCENT_COOKIE_KEY, accent);
      syncToDatabase(themeStyle, accent, colorMode);
    },
    [colorMode, themeStyle, persistCookie, syncToDatabase]
  );

  const setThemeAndAccent = useCallback(
    (theme: ThemeStyle, accent: AccentColor) => {
      setThemeStyleState(theme);
      setAccentColorState(accent);
      persistCookie(THEME_COOKIE_KEY, theme);
      persistCookie(ACCENT_COOKIE_KEY, accent);
      syncToDatabase(theme, accent, colorMode);
    },
    [colorMode, persistCookie, syncToDatabase]
  );

  const setColorMode = useCallback(
    (mode: ColorMode) => {
      setColorModeState(mode);
      persistCookie(COLOR_MODE_COOKIE_KEY, mode);
      syncToDatabase(themeStyle, accentColor, mode);
    },
    [accentColor, persistCookie, syncToDatabase, themeStyle]
  );

  // Read cookies on mount as client fallback if not set by SSR
  useEffect(() => {
    const savedTheme = Cookies.get(THEME_COOKIE_KEY) as ThemeStyle | undefined;
    const savedAccent = Cookies.get(ACCENT_COOKIE_KEY) as AccentColor | undefined;
    const savedColorMode = Cookies.get(COLOR_MODE_COOKIE_KEY) as ColorMode | undefined;

    if (savedTheme && (savedTheme === 'retro' || savedTheme === 'minimal')) {
      setThemeStyleState(savedTheme);
    }
    if (savedAccent && (savedAccent === 'orange' || savedAccent === 'green')) {
      setAccentColorState(savedAccent);
    }
    if (savedColorMode && (savedColorMode === 'light' || savedColorMode === 'dark')) {
      setColorModeState(savedColorMode);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        themeStyle,
        accentColor,
        colorMode,
        setThemeStyle,
        setAccentColor,
        setColorMode,
        setThemeAndAccent,
      }}
    >
      <div
        id="trekly-theme-root"
        data-theme={themeStyle}
        data-accent={accentColor}
        data-color-mode={colorMode}
        className="min-h-screen transition-colors duration-200"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
