import React, { createContext, useState } from 'react';

// Create the context
export const ModeContext = createContext();

// Create a provider component
export const ModeProvider = ({ children }) => {
  const [mode, setMode] = useState('default'); // Default mode

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'default' ? 'social_media' : 'default'));
  };

  return (
    <ModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};