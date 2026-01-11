import { useState } from 'react';

export const useCal = (type = 'discovery') => {
  const [isOpen, setIsOpen] = useState(false);

  const openCal = () => {
    console.log('Opening Cal.com with URL:', calUrl);
    setIsOpen(true);
  };

  const closeCal = () => setIsOpen(false);

  // Support both discovery calls and post-payment consultations
  const calUrl = type === 'consultation'
    ? (process.env.REACT_APP_CAL_URL_CONSULTATION || 'https://cal.com/militarydisabilitynexus/claim-readiness-review')
    : (process.env.REACT_APP_CAL_URL_DISCOVERY || 'https://cal.com/militarydisabilitynexus/discovery-call-military-disability-nexus');

  // Log the URL on mount for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`Cal.com URL configured (${type}):`, calUrl);
  }

  return {
    isOpen,
    openCal,
    closeCal,
    calUrl
  };
};

// Backward compatibility export
export const useCalendly = useCal;
