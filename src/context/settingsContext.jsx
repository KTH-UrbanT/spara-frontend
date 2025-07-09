import { createContext, useEffect, useContext, useState } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {

    const [initialized, setInitialized] = useState(false);
    const [notificationAudio, setNotificationAudio] = useState(true);

    const lightThemes = ['light', 'winter']; // Define light themes
    const darkThemes = ['dark', 'night']; // Define dark themes
    const themes = [...lightThemes, ...darkThemes]; // Combine both light and dark themes

    const [theme, setTheme] = useState(lightThemes[0]); // Set a default theme

    const setDataTheme = (theme) => {
        if (!lightThemes.includes(theme) && !darkThemes.includes(theme)) {
            console.warn(`Theme "${theme}" is not supported. Getting default light theme".`);
            theme = lightThemes[0]; // Fallback to a default theme if the provided one is not valid
        }
        // Update the data-theme attribute on the document element
        const el = document.querySelector('html')
        // Remove all existing theme classes
        for (const t of themes) {
            el.classList.remove(`${t}`);
        }
        // Add the new theme class
        el.classList.add(`${theme}`);
        el.setAttribute('data-theme', theme);
    }

    // Initilize settings from localStorage
    useEffect(() => {
        // Load settings from localStorage if available
        const storedNotificationAudio = localStorage.getItem('notificationAudio');
        const storedTheme = localStorage.getItem('theme');

        if (storedNotificationAudio !== null) {
            setNotificationAudio(storedNotificationAudio === 'true');
        }
        if (storedTheme !== null && storedTheme !== 'undefined') {
            setTheme(storedTheme);
        } else {
            // If no theme is stored, check for system preference
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const defaultTheme = prefersDark ? darkThemes[0] : lightThemes[0];
            setTheme(defaultTheme);
        }
        setInitialized(true);
    }, []);

    // Save settings to localStorage whenever they change
    useEffect(() => {
        if (!initialized) return; // Ensure settings are only saved after initialization
        // Save settings to localStorage whenever they change
        localStorage.setItem('notificationAudio', notificationAudio ? 'true' : 'false');
        if (theme && theme !== 'undefined') {
            localStorage.setItem('theme', theme);
        }
    }, [notificationAudio, theme, initialized]);

    // Update data-theme attribute on the document element
    useEffect(() => {
        setDataTheme(theme);
    }, [theme]);

    return (
        <SettingsContext.Provider value={{
            notificationAudio,
            setNotificationAudio,
            theme,
            themes,
            setTheme
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);