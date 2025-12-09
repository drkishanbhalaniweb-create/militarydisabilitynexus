import { useState } from 'react';

export const useCalendly = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const openCalendly = () => {
    console.log('Opening Calendly with URL:', calendlyUrl);
    setIsOpen(true);
  };
  
  const closeCalendly = () => setIsOpen(false);
  
  const calendlyUrl = process.env.REACT_APP_CALENDLY_URL || 'https://calendly.com/dr-kishanbhalani-web/military-disability-nexis';
  
  // Log the URL on mount for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('Calendly URL configured:', calendlyUrl);
  }
  
  return {
    isOpen,
    openCalendly,
    closeCalendly,
    calendlyUrl
  };
};
