import { createContext, PropsWithChildren, useContext } from 'react';
import { useColorScheme } from 'nativewind';
import { ThemeName, tokens } from './tokens';

type ThemeContextValue = { theme: ThemeName; setTheme: (theme: ThemeName) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const theme: ThemeName = colorScheme === 'dark' ? 'dark' : 'light';
  const setTheme = (nextTheme: ThemeName) => setColorScheme(nextTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return { ...context, colors: tokens.colors[context.theme] };
}
