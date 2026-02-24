import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './index';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);
    const [loading, setLoading] = useState(true);
    const theme = isDark ? darkTheme : lightTheme;

    useEffect(() => {
        AsyncStorage.getItem('@pft_theme').then(val => {
            if (val) setIsDark(val === 'dark');
            setLoading(false);
        });
    }, []);

    const toggleTheme = async () => {
        const newVal = !isDark;
        setIsDark(newVal);
        await AsyncStorage.setItem('@pft_theme', newVal ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme, loading }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
