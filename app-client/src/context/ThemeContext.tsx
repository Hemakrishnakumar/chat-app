import React, { createContext, useContext, useEffect, useState } from 'react';



export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getThemeColors: () => Record<string, string>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    children,
    defaultTheme = 'blue',
}) => {
    const [theme, setThemeState] = useState<Theme>(defaultTheme);

    // Get theme colors from CSS variables
    const getThemeColorsFromCSS = (): Record<string, string> => {
        const root = document.documentElement;
        const styles = getComputedStyle(root);
    
        const colorVars = [
            'background',
            'foreground',
            'primary',
            'primary-foreground',
            'secondary',
            'secondary-foreground',
            'accent',
            'accent-foreground',
            'destructive',
            'destructive-foreground',
            'muted',
            'muted-foreground',
            'border',
            'input',
            'ring',
        ];

        const colors: Record<string, string> = {};
        colorVars.forEach((varName) => {
            const value = styles.getPropertyValue(`--${varName}`).trim();
            colors[varName] = value;
        });

        return colors;
    };

    const getThemeColors = (): Record<string, string> => {
        return getThemeColorsFromCSS();
    };

    const applyTheme = (selectedTheme: Theme) => {
        const root = document.documentElement;
    
        // Remove all theme classes
        root.classList.remove('light', 'dark', 'blue', 'green', 'purple');
    
        // Add the selected theme class
        root.classList.add(selectedTheme);
    
        // Store in localStorage
        localStorage.setItem('theme', selectedTheme);
    
    };

    const setTheme = (selectedTheme: Theme) => {
        setThemeState(selectedTheme);
        applyTheme(selectedTheme);
    };

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setThemeState(savedTheme);
            applyTheme(savedTheme);
        } else {
            applyTheme(defaultTheme);
        }
    }, [defaultTheme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, getThemeColors }}>
            {children}
        </ThemeContext.Provider>
    );
};
