import { useState } from 'react';

export const useZoom = (type = 'discovery') => {
  const [isOpen, setIsOpen] = useState(false);

  const openBooking = () => {
    setIsOpen(true);
  };

  const closeBooking = () => setIsOpen(false);

  const defaultZoomUrl = 'https://scheduler.zoom.us/kishan-bhalani/free-discovery-call';
  const universalUrl = process.env.NEXT_PUBLIC_ZOOM_URL || defaultZoomUrl;
  const bookingUrl = type === 'consultation'
    ? (process.env.NEXT_PUBLIC_ZOOM_URL_CONSULTATION || universalUrl || process.env.NEXT_PUBLIC_CAL_URL_CONSULTATION || defaultZoomUrl)
    : type === 'cp_coaching'
    ? (process.env.NEXT_PUBLIC_ZOOM_URL_CP_COACHING || universalUrl || defaultZoomUrl)
    : (process.env.NEXT_PUBLIC_ZOOM_URL_DISCOVERY || universalUrl || defaultZoomUrl);

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
