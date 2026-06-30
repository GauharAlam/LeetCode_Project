import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // AlgoForge is dark-only. The warm graphite palette IS the theme.
    const theme = 'dark';
    const toggleTheme = () => {}; // no-op, kept for API compatibility
    const setTheme = () => {};   // no-op

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
