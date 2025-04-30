import React, { createContext, useState, useEffect } from 'react';

// Create the context
const UserPreferencesContext = createContext();

/**
 * UserPreferencesProvider Component
 * 
 * Provides user preferences state and functions to the application
 * Stores preferences in localStorage for persistence
 */
export const UserPreferencesProvider = ({ children }) => {
  // Initialize state from localStorage or defaults
  const [preferences, setPreferences] = useState(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    return savedPreferences 
      ? JSON.parse(savedPreferences) 
      : {
          knowledgeLevel: 'intermediate',
          theme: 'light',
          contentDensity: 'standard',
          codeSnippetTheme: 'dark',
          showCitations: true,
          showRelatedTopics: true,
          autoSaveNotes: true,
          notificationsEnabled: true
        };
  });

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  // Update a single preference
  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update knowledge level
  const setKnowledgeLevel = (level) => {
    updatePreference('knowledgeLevel', level);
  };

  // Toggle theme between light and dark
  const toggleTheme = () => {
    updatePreference('theme', preferences.theme === 'light' ? 'dark' : 'light');
  };

  // Reset preferences to defaults
  const resetPreferences = () => {
    const defaultPreferences = {
      knowledgeLevel: 'intermediate',
      theme: 'light',
      contentDensity: 'standard',
      codeSnippetTheme: 'dark',
      showCitations: true,
      showRelatedTopics: true,
      autoSaveNotes: true,
      notificationsEnabled: true
    };
    setPreferences(defaultPreferences);
  };

  // Context value
  const value = {
    preferences,
    updatePreference,
    setKnowledgeLevel,
    toggleTheme,
    resetPreferences
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export default UserPreferencesContext;
