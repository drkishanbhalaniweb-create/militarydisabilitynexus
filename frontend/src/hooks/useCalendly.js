import { useState } from 'react';

export const useZoom = (type = 'discovery') => {
  const [isOpen, setIsOpen] = useState(false);

  const openBooking = () => {
    setIsOpen(true);
  };

  const closeBooking = () => setIsOpen(false);

  const universalUrl = process.env.NEXT_PUBLIC_ZOOM_URL;
  const bookingUrl = type === 'consultation'
    ? (process.env.NEXT_PUBLIC_ZOOM_URL_CONSULTATION || universalUrl || process.env.NEXT_PUBLIC_CAL_URL_CONSULTATION || process.env.REACT_APP_CAL_URL_CONSULTATION || 'https://scheduler.zoom.us')
    : type === 'cp_coaching'
    ? (process.env.NEXT_PUBLIC_ZOOM_URL_CP_COACHING || universalUrl || process.env.NEXT_PUBLIC_ZOOM_URL_CONSULTATION || process.env.NEXT_PUBLIC_CAL_URL_CONSULTATION || 'https://scheduler.zoom.us')
    : (process.env.NEXT_PUBLIC_ZOOM_URL_DISCOVERY || universalUrl || process.env.NEXT_PUBLIC_CAL_URL_DISCOVERY || process.env.REACT_APP_CAL_URL_DISCOVERY || 'https://scheduler.zoom.us');

  return {
    isOpen,
    openBooking,
    closeBooking,
    bookingUrl,
    openCal: openBooking,
    closeCal: closeBooking,
    calUrl: bookingUrl
  };
};

export const useCal = useZoom;
export const useCalendly = useZoom;
