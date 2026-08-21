import { createContext, useContext, useEffect, useState } from 'react';
import { GENERATION_METHODS } from '../utils/graphHelpers';

const GenerationContext = createContext(null);
const STORAGE_KEY = 'generationCalculationMethod';

export function GenerationProvider({ children }) {
  const [generationMethod, setGenerationMethod] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return Object.values(GENERATION_METHODS).includes(saved)
      ? saved
      : GENERATION_METHODS.MATERNAL;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, generationMethod);
  }, [generationMethod]);

  return (
    <GenerationContext.Provider value={{ generationMethod, setGenerationMethod }}>
      {children}
    </GenerationContext.Provider>
  );
}

// Context and hook intentionally live together, matching the app's LanguageContext pattern.
// eslint-disable-next-line react-refresh/only-export-components
export function useGeneration() {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
}
